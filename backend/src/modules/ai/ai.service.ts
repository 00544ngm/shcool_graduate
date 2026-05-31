import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private apiKey: string;

  constructor(private prisma: PrismaService) {
    this.apiKey = process.env.DEEPSEEK_API_KEY || this.loadKeyFromFile();
  }

  private loadKeyFromFile(): string {
    const paths = [
      resolve(__dirname, '..', '..', '..', '..', 'apikey.txt'),
      resolve(__dirname, '..', '..', '..', 'apikey.txt'),
    ];
    for (const p of paths) {
      if (existsSync(p)) {
        return readFileSync(p, 'utf-8').trim();
      }
    }
    this.logger.warn('DEEPSEEK_API_KEY not found, AI search will fallback to keyword mode');
    return '';
  }

  async search(query: string) {
    // Always search DB for relevant content
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

    const photos = results[0];
    const moments = results[1];

    // Try AI summarization, fallback to simple text
    let summary: string;
    if (this.apiKey) {
      summary = await this.aiSummarize(query, photos, moments);
    } else {
      summary = `找到 ${photos.length} 张相关照片和 ${moments.length} 条相关动态`;
    }

    return { query, photos, moments, summary };
  }

  private async aiSummarize(query: string, photos: any[], moments: any[]): Promise<string> {
    const photoDesc = photos.map((p) => `[照片] "${p.title || '无标题'}"${p.description ? ': ' + p.description : ''} — ${p.user?.nickname || '未知'}`).join('\n');
    const momentDesc = moments.map((m) => `[动态] "${m.content}" — ${m.user?.nickname || '未知'}`).join('\n');

    const systemPrompt = '你是一个毕业班级时光馆的AI回忆助手。你的任务是根据用户搜索的关键词，结合数据库中找到的相关照片和动态，生成一段温暖、有感情的回忆总结。使用中文，语气亲切。';
    const userPrompt = `用户搜索关键词: "${query}"\n\n找到的相关内容:\n${photoDesc}\n${momentDesc}\n\n请根据以上内容为用户生成一段回忆总结。`;

    try {
      const res = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`DeepSeek API error ${res.status}: ${errText}`);
        return `找到 ${photos.length} 张相关照片和 ${moments.length} 条相关动态`;
      }

      const json = await res.json();
      return json.choices?.[0]?.message?.content || `找到 ${photos.length} 张相关照片和 ${moments.length} 条相关动态`;
    } catch (err) {
      this.logger.error('DeepSeek API call failed', err);
      return `找到 ${photos.length} 张相关照片和 ${moments.length} 条相关动态`;
    }
  }
}
