import { Controller, Get, Delete, Param, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private prisma: PrismaService) {}

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

  @Get('users')
  async users() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, nickname: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role === 'ADMIN') throw new BadRequestException('不能删除管理员账号');

    await Promise.all([
      this.prisma.like.deleteMany({ where: { userId: id } }),
      this.prisma.comment.deleteMany({ where: { userId: id } }),
      this.prisma.moment.deleteMany({ where: { userId: id } }),
      this.prisma.photo.deleteMany({ where: { userId: id } }),
      this.prisma.video.deleteMany({ where: { userId: id } }),
      this.prisma.favorite.deleteMany({ where: { userId: id } }),
      this.prisma.homeMessage.deleteMany({ where: { userId: id } }),
      this.prisma.notification.deleteMany({ where: { OR: [{ userId: id }, { fromUserId: id }] } }),
      this.prisma.chatQuota.deleteMany({ where: { userId: id } }),
      this.prisma.futureLetter.deleteMany({ where: { userId: id } }),
    ]);

    await this.prisma.user.delete({ where: { id } });
    return { message: `用户 ${user.username} 已删除` };
  }
}
