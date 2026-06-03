import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { VideoService } from './video.service';
import { PrismaService } from '../../common/prisma.service';
import { StorageService } from '../../common/storage/storage.service';

describe('VideoService', () => {
  let service: VideoService;
  let prisma: any;
  let storage: any;

  beforeEach(async () => {
    prisma = {
      video: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };
    storage = {
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  describe('create', () => {
    it('should save file and create video', async () => {
      const file = { originalname: 'test.mp4', buffer: Buffer.from('test') } as Express.Multer.File;
      const dto = { title: 'My Video' };
      storage.save.mockResolvedValue('/uploads/videos/uuid.mp4');
      prisma.video.create.mockResolvedValue({ id: 'video-1', videoUrl: '/uploads/videos/uuid.mp4', ...dto });

      const result = await service.create('user-1', file, dto as any);

      expect(storage.save).toHaveBeenCalledWith(file, 'videos');
      expect(prisma.video.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', videoUrl: '/uploads/videos/uuid.mp4', ...dto },
        include: expect.any(Object),
      });
      expect(result.id).toBe('video-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated videos', async () => {
      const videos = [{ id: 'video-1', title: 'Test' }];
      prisma.video.findMany.mockResolvedValue(videos);
      prisma.video.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result.items).toEqual(videos);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a video if found', async () => {
      const video = { id: 'video-1', title: 'Test' };
      prisma.video.findUnique.mockResolvedValue(video);

      const result = await service.findOne('video-1');

      expect(result).toEqual(video);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.video.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    const member = { id: 'user-1', role: 'MEMBER' };
    const other = { id: 'other-user', role: 'MEMBER' };

    it('should delete video and cleanup files', async () => {
      const video = { id: 'video-1', userId: 'user-1', videoUrl: '/uploads/videos/v.mp4', coverUrl: '/uploads/videos/c.jpg' };
      prisma.video.findUnique.mockResolvedValue(video);
      storage.delete.mockResolvedValue(undefined);

      await service.delete('video-1', member);

      expect(storage.delete).toHaveBeenCalledWith('/uploads/videos/v.mp4');
      expect(storage.delete).toHaveBeenCalledWith('/uploads/videos/c.jpg');
      expect(prisma.video.delete).toHaveBeenCalledWith({ where: { id: 'video-1' } });
    });

    it('should delete video without coverUrl', async () => {
      const video = { id: 'video-1', userId: 'user-1', videoUrl: '/uploads/videos/v.mp4', coverUrl: null };
      prisma.video.findUnique.mockResolvedValue(video);

      await service.delete('video-1', member);

      expect(storage.delete).toHaveBeenCalledTimes(1);
      expect(storage.delete).toHaveBeenCalledWith('/uploads/videos/v.mp4');
    });

    it('should throw NotFoundException if video does not exist', async () => {
      prisma.video.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent', member)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      prisma.video.findUnique.mockResolvedValue({ id: 'video-1', userId: 'owner-id' });

      await expect(service.delete('video-1', other)).rejects.toThrow(ForbiddenException);
    });
  });
});
