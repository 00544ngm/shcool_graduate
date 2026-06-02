import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { canModify } from '../../common/guards/roles.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TargetType } from '../../common/enums/target-type';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, dto: CreateCommentDto) {
    // Normalize targetType to lowercase for consistent queries
    const targetType = dto.targetType.toLowerCase();
    dto.targetType = targetType;

    // Fetch the target owner and create comment in parallel
    const ownerPromise = targetType === TargetType.PHOTO
      ? this.prisma.photo.findUnique({ where: { id: dto.targetId }, select: { userId: true } })
      : targetType === TargetType.VIDEO
        ? this.prisma.video.findUnique({ where: { id: dto.targetId }, select: { userId: true } })
        : targetType === TargetType.MOMENT
          ? this.prisma.moment.findUnique({ where: { id: dto.targetId }, select: { userId: true } })
          : Promise.resolve(null);

    const [comment, owner] = await Promise.all([
      this.prisma.comment.create({
        data: { userId, ...dto },
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      }),
      ownerPromise,
    ]);

    if (owner && owner.userId !== userId) {
      const label = targetType === TargetType.PHOTO ? '照片' : targetType === TargetType.VIDEO ? '视频' : '动态';
      await this.notificationService.create(owner.userId, 'comment', `评论了你的${label}`, dto.targetId, userId);
    }

    return comment;
  }

  async findByTarget(targetType: string, targetId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { targetType, targetId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, nickname: true, avatar: true } },
          },
        },
      },
    });
    return comments;
  }

  async delete(id: string, user: { id: string; role: string }) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (!canModify(comment.userId, user)) throw new ForbiddenException('Not authorized');
    await this.prisma.comment.deleteMany({ where: { OR: [{ id }, { parentId: id }] } });
  }
}
