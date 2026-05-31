import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateLetterDto } from './dto/create-letter.dto';

@Injectable()
export class MailboxService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLetterDto) {
    const now = new Date();
    const unlockMap: Record<string, number> = { '1y': 1, '3y': 3, '5y': 5 };
    const unlockTime = dto.unlockType === 'custom' && dto.unlockDate
      ? new Date(dto.unlockDate)
      : new Date(now.getFullYear() + (unlockMap[dto.unlockType] || 1), now.getMonth(), now.getDate());

    return this.prisma.futureLetter.create({
      data: { userId, title: dto.title, content: dto.content, unlockTime },
    });
  }

  async findMyLetters(userId: string) {
    return this.prisma.futureLetter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOpened(userId: string) {
    const now = new Date();
    return this.prisma.futureLetter.findMany({
      where: { userId, unlockTime: { lte: now }, status: 'OPENED' },
    });
  }

  async openLetter(id: string, userId: string) {
    const letter = await this.prisma.futureLetter.findUnique({ where: { id } });
    if (!letter) throw new NotFoundException('Letter not found');
    if (letter.userId !== userId) throw new NotFoundException('Letter not found');
    if (new Date() < letter.unlockTime) throw new BadRequestException('Letter is still sealed');

    return this.prisma.futureLetter.update({
      where: { id },
      data: { status: 'OPENED' },
    });
  }
}
