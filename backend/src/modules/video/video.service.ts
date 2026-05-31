import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { canModify } from '../../common/guards/roles.guard';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(userId: string, file: Express.Multer.File, dto: CreateVideoDto) {
    const videoUrl = await this.storage.save(file, 'videos');
    return this.prisma.video.create({
      data: { userId, videoUrl, ...dto },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      }),
      this.prisma.video.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async delete(id: string, user: { id: string; role: string }) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Video not found');
    if (!canModify(video.userId, user)) throw new NotFoundException('Not authorized');
    await this.storage.delete(video.videoUrl);
    if (video.coverUrl) await this.storage.delete(video.coverUrl);
    await this.prisma.video.delete({ where: { id } });
  }
}
