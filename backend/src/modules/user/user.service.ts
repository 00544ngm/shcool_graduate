import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, nickname: true, avatar: true,
          bio: true, city: true, dormitory: true, role: true, createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, nickname: true, avatar: true,
        email: true, role: true, bio: true, dormitory: true,
        city: true, graduationPhoto: true, createdAt: true,
      },
    });
    return user;
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

  async getDormitoryGroups() {
    const users = await this.prisma.user.findMany({
      where: { dormitory: { not: null } },
      select: { id: true, nickname: true, username: true, avatar: true, dormitory: true, bio: true },
    });
    const groups: Record<string, { count: number; members: typeof users }> = {};
    for (const u of users) {
      const dorm = u.dormitory!;
      if (!groups[dorm]) groups[dorm] = { count: 0, members: [] };
      groups[dorm].count++;
      groups[dorm].members.push(u);
    }
    return Object.entries(groups).map(([name, data]) => ({ name, ...data }));
  }
}
