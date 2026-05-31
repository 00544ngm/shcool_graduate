import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { PrismaService } from '../../common/prisma.service';

describe('AdminController', () => {
  let controller: AdminController;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { count: jest.fn(), findMany: jest.fn() },
      photo: { count: jest.fn() },
      video: { count: jest.fn() },
      comment: { count: jest.fn() },
      futureLetter: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  describe('stats', () => {
    it('should return aggregated statistics', async () => {
      prisma.user.count.mockResolvedValue(10);
      prisma.photo.count.mockResolvedValue(50);
      prisma.video.count.mockResolvedValue(5);
      prisma.comment.count.mockResolvedValue(100);
      prisma.futureLetter.count.mockResolvedValue(20);

      const result = await controller.stats();

      expect(result.users).toBe(10);
      expect(result.photos).toBe(50);
      expect(result.videos).toBe(5);
      expect(result.comments).toBe(100);
      expect(result.letters).toBe(20);
    });

    it('should return zero counts when db is empty', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.photo.count.mockResolvedValue(0);
      prisma.video.count.mockResolvedValue(0);
      prisma.comment.count.mockResolvedValue(0);
      prisma.futureLetter.count.mockResolvedValue(0);

      const result = await controller.stats();

      expect(result.users).toBe(0);
      expect(result.photos).toBe(0);
      expect(result.videos).toBe(0);
      expect(result.comments).toBe(0);
      expect(result.letters).toBe(0);
    });
  });

  describe('users', () => {
    it('should return all users with selected fields', async () => {
      const mockUsers = [
        { id: 'u1', username: 'alice', nickname: 'Alice', email: 'alice@test.com', role: 'MEMBER', createdAt: new Date() },
        { id: 'u2', username: 'bob', nickname: 'Bob', email: 'bob@test.com', role: 'ADMIN', createdAt: new Date() },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await controller.users();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('u1');
      expect(result[1].role).toBe('ADMIN');
    });

    it('should order users by creation date descending', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await controller.users();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should select only safe fields', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await controller.users();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            username: true,
            nickname: true,
            role: true,
          }),
        }),
      );
      // Password should NOT be selected
      const selectArg = prisma.user.findMany.mock.calls[0][0].select;
      expect(selectArg.password).toBeUndefined();
    });
  });
});
