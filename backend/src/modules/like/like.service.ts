import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { TargetType } from '../../common/enums/target-type';

@Injectable()
export class LikeService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async toggle(userId: string, targetType: string, targetId: string) {
    targetType = targetType.toLowerCase();
    const existing = await this.prisma.like.findUnique({
      where: { targetType_targetId_userId: { targetType, targetId, userId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      const count = await this.prisma.like.count({ where: { targetType, targetId } });
      return { liked: false, count };
    }

    // Create like and fetch owner in parallel
    const ownerPromise = targetType === TargetType.PHOTO
      ? this.prisma.photo.findUnique({ where: { id: targetId }, select: { userId: true } })
      : targetType === TargetType.VIDEO
        ? this.prisma.video.findUnique({ where: { id: targetId }, select: { userId: true } })
        : targetType === TargetType.MOMENT
          ? this.prisma.moment.findUnique({ where: { id: targetId }, select: { userId: true } })
          : Promise.resolve(null);

    const [, owner] = await Promise.all([
      this.prisma.like.create({ data: { userId, targetType, targetId } }),
      ownerPromise,
    ]);

    if (owner && owner.userId !== userId) {
      const label = targetType === TargetType.PHOTO ? '照片' : targetType === TargetType.VIDEO ? '视频' : '动态';
      await this.notificationService.create(owner.userId, 'like', `赞了你的${label}`, targetId, userId);
    }

    const count = await this.prisma.like.count({ where: { targetType, targetId } });
    return { liked: true, count };
  }

  async count(targetType: string, targetId: string) {
    return this.prisma.like.count({ where: { targetType, targetId } });
  }

  async findByTarget(targetType: string, targetId: string) {
    return this.prisma.like.findMany({
      where: { targetType, targetId },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async userLiked(userId: string, targetType: string, targetId: string) {
    const like = await this.prisma.like.findUnique({
      where: { targetType_targetId_userId: { targetType: targetType.toLowerCase(), targetId, userId } },
    });
    return !!like;
  }
}
