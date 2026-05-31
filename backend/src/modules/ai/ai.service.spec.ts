import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../../common/prisma.service';

describe('AiService', () => {
  let service: AiService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      photo: {
        findMany: jest.fn(),
      },
      moment: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AiService>(AiService);

    // Clear apikey so we don't hit real DeepSeek API
    (service as any).apiKey = '';
  });

  describe('search', () => {
    const mockPhotos = [
      { id: 'photo-1', title: '军训合影', description: '烈日下的我们', tags: ['军训'], userId: 'u1', user: { id: 'u1', nickname: '张三' } },
      { id: 'photo-2', title: '拔河比赛', description: null, tags: ['运动会'], userId: 'u2', user: { id: 'u2', nickname: '李四' } },
    ];
    const mockMoments = [
      { id: 'moment-1', content: '军训太累了但是很开心', userId: 'u1', user: { id: 'u1', nickname: '张三' } },
    ];

    it('should search photos and moments by keyword', async () => {
      prisma.photo.findMany.mockResolvedValue(mockPhotos);
      prisma.moment.findMany.mockResolvedValue(mockMoments);

      const result = await service.search('军训');

      expect(prisma.photo.findMany).toHaveBeenCalled();
      expect(prisma.moment.findMany).toHaveBeenCalled();
      expect(result.photos).toEqual(mockPhotos);
      expect(result.moments).toEqual(mockMoments);
      expect(result.query).toBe('军训');
    });

    it('should return fallback summary when no api key', async () => {
      prisma.photo.findMany.mockResolvedValue(mockPhotos);
      prisma.moment.findMany.mockResolvedValue(mockMoments);

      const result = await service.search('军训');

      expect(result.summary).toContain('2 张相关照片');
      expect(result.summary).toContain('1 条相关动态');
    });

    it('should handle empty results', async () => {
      prisma.photo.findMany.mockResolvedValue([]);
      prisma.moment.findMany.mockResolvedValue([]);

      const result = await service.search('不存在的关键词');

      expect(result.photos).toEqual([]);
      expect(result.moments).toEqual([]);
      expect(result.summary).toContain('0 张相关照片');
    });

    it('should handle DB errors gracefully', async () => {
      prisma.photo.findMany.mockRejectedValue(new Error('DB connection failed'));

      await expect(service.search('军训')).rejects.toThrow();
    });

    it('should search by title, description and tags', async () => {
      prisma.photo.findMany.mockResolvedValue(mockPhotos);
      prisma.moment.findMany.mockResolvedValue(mockMoments);

      await service.search('运动会');

      expect(prisma.photo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ tags: { has: '运动会' } }),
            ]),
          }),
        }),
      );
    });
  });
});
