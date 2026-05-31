import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    const results = await Promise.all([
      this.prisma.photo.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
        },
        take: 10,
        include: { user: { select: { id: true, nickname: true } } },
      }),
      this.prisma.moment.findMany({
        where: { content: { contains: query, mode: 'insensitive' } },
        take: 10,
        include: { user: { select: { id: true, nickname: true } } },
      }),
    ]);

    return {
      query,
      photos: results[0],
      moments: results[1],
      summary: `找到 ${results[0].length} 张相关照片和 ${results[1].length} 条相关动态`,
    };
  }
}
