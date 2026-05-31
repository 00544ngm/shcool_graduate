import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { PrismaService } from '../../common/prisma.service';

describe('MomentsService', () => {
  let service: MomentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      moment: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MomentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MomentsService>(MomentsService);
  });

  describe('create', () => {
    it('should create a moment', async () => {
      const dto = { content: 'Hello world', images: [] };
      const moment = { id: 'moment-1', userId: 'user-1', ...dto };
      prisma.moment.create.mockResolvedValue(moment);

      const result = await service.create('user-1', dto as any);

      expect(prisma.moment.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', ...dto },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      });
      expect(result.id).toBe('moment-1');
    });

    it('should create a moment with images', async () => {
      const dto = { content: 'With images', images: ['img1.jpg', 'img2.jpg'] };
      prisma.moment.create.mockResolvedValue({ id: 'moment-2', userId: 'user-1', ...dto });

      await service.create('user-1', dto as any);

      expect(prisma.moment.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', images: ['img1.jpg', 'img2.jpg'], content: 'With images' },
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated moments', async () => {
      const moments = [{ id: 'moment-1', content: 'Test' }];
      prisma.moment.findMany.mockResolvedValue(moments);
      prisma.moment.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.items).toEqual(moments);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty results', async () => {
      prisma.moment.findMany.mockResolvedValue([]);
      prisma.moment.count.mockResolvedValue(0);

      const result = await service.findAll(1, 20);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should compute skip correctly for page 2', async () => {
      prisma.moment.findMany.mockResolvedValue([]);
      prisma.moment.count.mockResolvedValue(0);

      await service.findAll(2, 10);

      expect(prisma.moment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('delete', () => {
    const member = { id: 'user-1', role: 'MEMBER' };
    const other = { id: 'other-user', role: 'MEMBER' };

    it('should delete a moment owned by user', async () => {
      prisma.moment.findUnique.mockResolvedValue({ id: 'moment-1', userId: 'user-1' });
      prisma.moment.delete.mockResolvedValue({ id: 'moment-1' });

      await service.delete('moment-1', member);

      expect(prisma.moment.delete).toHaveBeenCalledWith({ where: { id: 'moment-1' } });
    });

    it('should throw NotFoundException if moment does not exist', async () => {
      prisma.moment.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent', member)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not owner', async () => {
      prisma.moment.findUnique.mockResolvedValue({ id: 'moment-1', userId: 'owner-id' });

      await expect(service.delete('moment-1', other)).rejects.toThrow(NotFoundException);
    });
  });
});
