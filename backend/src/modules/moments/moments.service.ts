import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.moment.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      }),
      this.prisma.moment.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async delete(id: string, user: { id: string; role: string }) {
    const moment = await this.prisma.moment.findUnique({ where: { id } });
    if (!moment) throw new NotFoundException('Moment not found');
    if (!canModify(moment.userId, user)) throw new NotFoundException('Not authorized');
    await this.prisma.moment.delete({ where: { id } });
  }
}
