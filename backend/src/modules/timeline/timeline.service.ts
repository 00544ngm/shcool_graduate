import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async getTimeline() {
    const [photos, videos, moments] = await Promise.all([
      this.prisma.photo.findMany({
        select: {
          id: true, title: true, imageUrl: true, takenAt: true, createdAt: true, tags: true,
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { takenAt: 'asc' },
      }),
      this.prisma.video.findMany({
        select: {
          id: true, title: true, videoUrl: true, coverUrl: true, duration: true, createdAt: true,
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.moment.findMany({
        select: {
          id: true, content: true, images: true, createdAt: true,
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const typedPhotos = photos.map((p) => ({ ...p, type: 'PHOTO' as const }));
    const typedVideos = videos.map((v) => ({ ...v, type: 'VIDEO' as const }));
    const typedMoments = moments.map((m) => ({ ...m, type: 'MOMENT' as const }));

    const allItems = [...typedPhotos, ...typedVideos, ...typedMoments];

    const timeline: Record<string, unknown[]> = {};
    const getYear = (date: Date | null | undefined) =>
      date ? date.getFullYear().toString() : '未知';

    for (const item of allItems) {
      const date = 'takenAt' in item && item.takenAt
        ? item.takenAt
        : item.createdAt;
      const year = getYear(date);
      if (!timeline[year]) timeline[year] = [];
      timeline[year].push(item);
    }

    return Object.entries(timeline)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, items]) => ({
        year: parseInt(year),
        title: this.getYearLabel(parseInt(year)),
        items,
        count: items.length,
      }));
  }

  private getYearLabel(year: number): string {
    const labels: Record<number, string> = {
      2022: '入学',
      2023: '军训 / 大二',
      2024: '竞赛 / 大三',
      2025: '实习 / 大四',
      2026: '毕业',
    };
    return labels[year] || `${year}`;
  }
}
