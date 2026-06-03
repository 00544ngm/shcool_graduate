import { Test, TestingModule } from '@nestjs/testing';
import { TimelineService } from './timeline.service';
import { PrismaService } from '../../common/prisma.service';

describe('TimelineService', () => {
  let service: TimelineService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      photo: {
        findMany: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({
          _min: { takenAt: new Date('2022-09-01') },
          _max: { takenAt: new Date('2026-06-01') },
        }),
      },
      video: { findMany: jest.fn() },
      moment: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TimelineService>(TimelineService);
  });

  describe('getTimeline', () => {
    const mockPhotos = [
      { id: 'p1', title: '开学典礼', imageUrl: '/img1.jpg', takenAt: new Date('2022-09-01'), createdAt: new Date(), tags: [], user: { id: 'u1', nickname: '张三', avatar: null } },
    ];
    const mockVideos = [
      { id: 'v1', title: '毕业视频', videoUrl: '/vid1.mp4', coverUrl: null, duration: 120, createdAt: new Date('2026-06-01'), user: { id: 'u2', nickname: '李四', avatar: null } },
    ];
    const mockMoments = [
      { id: 'm1', content: '毕业快乐！', images: [], createdAt: new Date('2026-06-15'), user: { id: 'u3', nickname: '王五', avatar: null } },
    ];

    it('should merge photos, videos and moments into timeline', async () => {
      prisma.photo.findMany.mockResolvedValue(mockPhotos);
      prisma.video.findMany.mockResolvedValue(mockVideos);
      prisma.moment.findMany.mockResolvedValue(mockMoments);

      const result = await service.getTimeline();

      expect(Array.isArray(result)).toBe(true);
      // Should have 2 years: 2022 and 2026
      const years = result.map((r: any) => r.year);
      expect(years).toContain(2022);
      expect(years).toContain(2026);
    });

    it('should sort years in descending order', async () => {
      prisma.photo.findMany.mockResolvedValue(mockPhotos);
      prisma.video.findMany.mockResolvedValue(mockVideos);
      prisma.moment.findMany.mockResolvedValue(mockMoments);

      const result = await service.getTimeline();

      const years = result.map((r: any) => r.year);
      for (let i = 1; i < years.length; i++) {
        expect(years[i - 1]).toBeGreaterThan(years[i]);
      }
    });

    it('should assign correct types to items', async () => {
      prisma.photo.findMany.mockResolvedValue(mockPhotos);
      prisma.video.findMany.mockResolvedValue(mockVideos);
      prisma.moment.findMany.mockResolvedValue(mockMoments);

      const result = await service.getTimeline();

      const items2026 = result.find((r: any) => r.year === 2026)!.items as any[];
      const videoItem = items2026.find((i: any) => i.type === 'VIDEO');
      const momentItem = items2026.find((i: any) => i.type === 'MOMENT');
      expect(videoItem).toBeDefined();
      expect(momentItem).toBeDefined();
    });

    it('should return year labels', async () => {
      prisma.photo.findMany.mockResolvedValue(mockPhotos);
      prisma.video.findMany.mockResolvedValue(mockVideos);
      prisma.moment.findMany.mockResolvedValue(mockMoments);

      const result = await service.getTimeline();

      expect(result.find((r: any) => r.year === 2022)!.title).toBe('入学');
      expect(result.find((r: any) => r.year === 2026)!.title).toBe('毕业');
    });

    it('should handle empty data', async () => {
      prisma.photo.findMany.mockResolvedValue([]);
      prisma.video.findMany.mockResolvedValue([]);
      prisma.moment.findMany.mockResolvedValue([]);

      const result = await service.getTimeline();

      expect(result).toEqual([]);
    });
  });
});
