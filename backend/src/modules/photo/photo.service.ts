import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { canModify } from '../../common/guards/roles.guard';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Injectable()
export class PhotoService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(userId: string, file: Express.Multer.File, dto: CreatePhotoDto) {
    const imageUrl = await this.storage.save(file, 'photos');
    return this.prisma.photo.create({
      data: {
        userId,
        imageUrl,
        title: dto.title,
        description: dto.description,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : null,
        location: dto.location,
        tags: dto.tags || [],
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      }),
      this.prisma.photo.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }

  async search(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      }),
      this.prisma.photo.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async delete(id: string, user: { id: string; role: string }) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photo not found');
    if (!canModify(photo.userId, user)) throw new NotFoundException('Not authorized');
    await this.storage.delete(photo.imageUrl);
    await this.prisma.photo.delete({ where: { id } });
  }
}
