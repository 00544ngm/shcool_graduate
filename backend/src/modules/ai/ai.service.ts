import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private apiKey: string;

  constructor(private prisma: PrismaService) {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY not set, AI features will be limited');
    }
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

  /* ─── Tree Hole Chat ─── */
  async chat(userId: string, message: string) {
    if (!this.apiKey) {
      throw new HttpException('AI 服务未配置', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const now = new Date();

    // Find or create quota record
    let quota = await this.prisma.chatQuota.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!quota) {
      quota = await this.prisma.chatQuota.create({
        data: { userId, date: today, count: 0 },
      });
    }

    // Check ban
    if (quota.bannedUntil && new Date(quota.bannedUntil) > now) {
      const remainingMs = new Date(quota.bannedUntil).getTime() - now.getTime();
      const remainingHours = Math.ceil(remainingMs / 3600000);
      throw new HttpException(
        `倾诉次数已用尽，请 ${remainingHours} 小时后再来`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check daily limit
    if (quota.count >= 5) {
      const bannedUntil = new Date(now.getTime() + 5 * 3600000);
      await this.prisma.chatQuota.update({
        where: { id: quota.id },
        data: { bannedUntil },
      });
      throw new HttpException(
        '今日倾诉次数已用尽，5 小时后自动解封',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Call DeepSeek
    const reply = await this.treeHoleChat(message);

    // Increment count
    await this.prisma.chatQuota.update({
      where: { id: quota.id },
      data: { count: quota.count + 1 },
    });

    return {
      reply,
      remaining: 4 - quota.count,
      totalQuota: 5,
    };
  }

  private async treeHoleChat(message: string): Promise<string> {
    const systemPrompt =
      '你是一个温暖贴心的同窗好友，也是班级时光馆里的情感树洞。你的性格：温柔、善解人意、从不评判。用朋友般的语气倾听和回应对方的烦恼、心事或日常分享。\n\n' +
      '规则：\n' +
      '1. 始终用中文，语气亲切自然，像老朋友聊天一样\n' +
      '2. 不要评判或说教，多倾听、多共情\n' +
      '3. 可以适当分享"自己"（作为同学）类似经历和感受\n' +
      '4. 回答控制在 200 字以内，简洁温暖\n' +
      '5. 绝对不要提及你是 AI 或语言模型\n' +
      '6. 如果对方提到班级回忆相关的话题，可以自然地融入一些温暖的回忆视角';

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
            { role: 'user', content: message },
          ],
          max_tokens: 400,
          temperature: 0.85,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`DeepSeek API error ${res.status}: ${errText}`);
        throw new HttpException('AI 响应失败', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const json = await res.json();
      return json.choices?.[0]?.message?.content || '抱歉，我现在不知道说什么好……';
    } catch (err) {
      this.logger.error('TreeHole chat call failed', err);
      throw new HttpException('AI 响应失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
