import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(userId: string, type: string, content: string, relatedId?: string, fromUserId?: string) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, content, relatedId, fromUserId },
      include: {
        fromUser: { select: { id: true, nickname: true, username: true, avatar: true } },
      },
    });
    this.notificationGateway.sendNotification(userId, notification);
    return notification;
  }

  async findMy(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          fromUser: { select: { id: true, nickname: true, username: true, avatar: true } },
        },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async broadcast(fromUserId: string, content: string) {
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'VISITOR' } },
      select: { id: true },
    });

    const data = users.map((u) => ({
      userId: u.id,
      type: 'SYSTEM' as const,
      content,
      fromUserId,
    }));

    const notifications = await this.prisma.notification.createManyAndReturn({
      data,
      include: {
        fromUser: { select: { id: true, nickname: true, username: true, avatar: true } },
      },
    });

    for (const n of notifications) {
      this.notificationGateway.sendNotification(n.userId, n);
    }

    return { count: users.length };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }
}
