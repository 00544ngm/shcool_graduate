import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class HomeMessageService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, content: string) {
    return this.prisma.homeMessage.create({
      data: { userId, content },
      include: {
        user: { select: { id: true, nickname: true, username: true, avatar: true } },
      },
    });
  }

  async findAll(limit = 50) {
    return this.prisma.homeMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, nickname: true, username: true, avatar: true } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const msg = await this.prisma.homeMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('留言不存在');
    if (msg.userId !== userId) throw new ForbiddenException('只能删除自己的留言');
    await this.prisma.homeMessage.delete({ where: { id } });
  }
}
