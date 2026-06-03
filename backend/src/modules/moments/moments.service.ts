import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { canModify } from '../../common/guards/roles.guard';
import { CreateMomentDto } from './dto/create-moment.dto';

@Injectable()
export class MomentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMomentDto) {
    return this.prisma.moment.create({
      data: { userId, ...dto },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
  }

  async findAll(page = 1, limit = 20, q?: string) {
    const skip = (page - 1) * limit;
    const where = q ? { content: { contains: q, mode: 'insensitive' as const } } : {};
    const [items, total] = await Promise.all([
      this.prisma.moment.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      }),
      this.prisma.moment.count({ where }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async delete(id: string, user: { id: string; role: string }) {
    const moment = await this.prisma.moment.findUnique({ where: { id } });
    if (!moment) throw new NotFoundException('Moment not found');
    if (!canModify(moment.userId, user)) throw new ForbiddenException('Not authorized');
    await this.prisma.moment.delete({ where: { id } });
  }
}
