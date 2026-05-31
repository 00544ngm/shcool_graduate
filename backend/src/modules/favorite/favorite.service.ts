import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, targetType: string, targetId: string) {
    targetType = targetType.toLowerCase();
    const existing = await this.prisma.favorite.findUnique({
      where: { targetType_targetId_userId: { targetType, targetId, userId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, targetType, targetId } });
    return { favorited: true };
  }

  async findMy(userId: string) {
    const items = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items;
  }

  async isFavorited(userId: string, targetType: string, targetId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: { targetType_targetId_userId: { targetType: targetType.toLowerCase(), targetId, userId } },
    });
    return !!fav;
  }
}
