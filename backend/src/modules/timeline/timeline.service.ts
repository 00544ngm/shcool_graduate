import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async getTimeline() {
    const [photos, videos, moments, yearRange] = await Promise.all([
      this.prisma.photo.findMany({
        take: 200,
        select: {
          id: true, title: true, imageUrl: true, takenAt: true, createdAt: true, tags: true,
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { takenAt: 'asc' },
      }),
      this.prisma.video.findMany({
        take: 200,
        select: {
          id: true, title: true, videoUrl: true, coverUrl: true, duration: true, createdAt: true,
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.moment.findMany({
        take: 200,
        select: {
          id: true, content: true, images: true, createdAt: true,
          user: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      // Get total date range for dynamic year labels
      this.prisma.photo.aggregate({ _min: { takenAt: true }, _max: { takenAt: true } }),
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

    // Build dynamic year labels
    const range = this.getYearRange(yearRange);

    return Object.entries(timeline)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, items]) => ({
        year: parseInt(year),
        title: this.getYearLabel(parseInt(year), range),
        items,
        count: items.length,
      }));
  }

  private getYearRange(agg: { _min: { takenAt: Date | null }; _max: { takenAt: Date | null } }): { start: number; end: number } {
    const start = agg._min.takenAt?.getFullYear() ?? new Date().getFullYear();
    const end = agg._max.takenAt?.getFullYear() ?? new Date().getFullYear();
    return { start, end };
  }

  private getYearLabel(year: number, range: { start: number; end: number }): string {
    if (year === range.start && range.end - range.start <= 4) {
      const idx = year - range.start;
      const phaseLabels = ['入学', '探索 / 大二', '竞赛 / 大三', '实习 / 大四'];
      return phaseLabels[idx] || `${year}`;
    }
    if (year === range.end && year > range.start) return '毕业';
    return `${year}`;
  }
}
