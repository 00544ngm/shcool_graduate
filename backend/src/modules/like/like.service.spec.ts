import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from './like.service';
import { PrismaService } from '../../common/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('LikeService', () => {
  let service: LikeService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      like: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      photo: { findUnique: jest.fn() },
      video: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
  });

  describe('toggle', () => {
    it('should create a like if not exists', async () => {
      prisma.like.findUnique.mockResolvedValue(null);
      prisma.like.create.mockResolvedValue({ id: 'like-1' });
      prisma.like.count.mockResolvedValue(1);
      prisma.photo.findUnique.mockResolvedValue({ userId: 'photo-owner' });

      const result = await service.toggle('user-1', 'photo', 'photo-1');

      expect(result.liked).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should remove a like if exists', async () => {
      prisma.like.findUnique.mockResolvedValue({ id: 'like-1', userId: 'user-1' });
      prisma.like.count.mockResolvedValue(0);

      const result = await service.toggle('user-1', 'photo', 'photo-1');

      expect(prisma.like.delete).toHaveBeenCalled();
      expect(result.liked).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe('count', () => {
    it('should return like count', async () => {
      prisma.like.count.mockResolvedValue(5);

      const result = await service.count('photo', 'photo-1');

      expect(result).toBe(5);
    });
  });

  describe('findByTarget', () => {
    it('should return likes with user info', async () => {
      const likes = [{ id: 'like-1', user: { id: 'user-1', nickname: 'Test', avatar: null } }];
      prisma.like.findMany.mockResolvedValue(likes);

      const result = await service.findByTarget('photo', 'photo-1');

      expect(result).toHaveLength(1);
      expect(prisma.like.findMany).toHaveBeenCalledWith({
        where: { targetType: 'photo', targetId: 'photo-1' },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
