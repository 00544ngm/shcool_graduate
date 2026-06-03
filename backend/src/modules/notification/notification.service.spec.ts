import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../common/prisma.service';
import { NotificationGateway } from './notification.gateway';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  const mockGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        createManyAndReturn: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const notification = { id: 'notif-1', userId: 'user-1', type: 'comment', content: 'Test', relatedId: 'photo-1' };
      prisma.notification.create.mockResolvedValue(notification);

      const result = await service.create('user-1', 'comment', 'Test', 'photo-1');

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', type: 'comment', content: 'Test', relatedId: 'photo-1', fromUserId: undefined },
        include: { fromUser: { select: { id: true, nickname: true, username: true, avatar: true } } },
      });
      expect(result.id).toBe('notif-1');
    });
  });

  describe('findMy', () => {
    it('should return paginated notifications', async () => {
      prisma.notification.findMany.mockResolvedValue([{ id: 'notif-1', userId: 'user-1' }]);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.findMy('user-1', 1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('markRead', () => {
    it('should mark a notification as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markRead('notif-1', 'user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { read: true },
      });
    });
  });

  describe('markAllRead', () => {
    it('should mark all unread as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      await service.markAllRead('user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
        data: { read: true },
      });
    });
  });
});
