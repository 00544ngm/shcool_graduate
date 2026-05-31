import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, nickname: true, avatar: true,
        email: true, role: true, bio: true, dormitory: true,
        city: true, graduationPhoto: true, createdAt: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { nickname?: string; bio?: string; city?: string; dormitory?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, username: true, nickname: true, avatar: true,
        email: true, role: true, bio: true, dormitory: true, city: true,
      },
    });
  }

  async getCityMap() {
    const users = await this.prisma.user.findMany({
      where: { city: { not: null } },
      select: { nickname: true, city: true },
    });
    const distribution: Record<string, { count: number; names: string[] }> = {};
    for (const u of users) {
      const city = u.city || '未知';
      if (!distribution[city]) distribution[city] = { count: 0, names: [] };
      distribution[city].count++;
      distribution[city].names.push(u.nickname);
    }
    return { total: users.length, distribution };
  }
}
