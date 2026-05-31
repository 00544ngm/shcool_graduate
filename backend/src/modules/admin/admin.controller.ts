import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  async stats() {
    const [users, photos, videos, comments, letters] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.photo.count(),
      this.prisma.video.count(),
      this.prisma.comment.count(),
      this.prisma.futureLetter.count(),
    ]);
    return { users, photos, videos, comments, letters };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  async users() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, nickname: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
