import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [users, photos, videos, comments, letters, moments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.photo.count(),
      this.prisma.video.count(),
      this.prisma.comment.count(),
      this.prisma.futureLetter.count(),
      this.prisma.moment.count(),
    ]);
    return { users, photos, videos, comments, letters, moments };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, nickname: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    if (!['MEMBER', 'MODERATOR', 'ADMIN'].includes(role)) throw new BadRequestException('无效的角色');
    return this.prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: { id: true, username: true, nickname: true, role: true },
    });
  }

  async resetPassword(id: string, password: string) {
    if (!password || password.length < 6) throw new BadRequestException('密码至少 6 位');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');

    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: `用户 ${user.username} 的密码已重置` };
  }

  async deleteUser(id: string) {
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

  async getPhotos(page = 1) {
    const take = 20;
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        skip, take, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true, nickname: true } } },
      }),
      this.prisma.photo.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / take) };
  }

  async deletePhoto(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('照片不存在');
    await Promise.all([
      this.prisma.like.deleteMany({ where: { targetType: 'photo', targetId: id } }),
      this.prisma.comment.deleteMany({ where: { targetType: 'photo', targetId: id } }),
      this.prisma.favorite.deleteMany({ where: { targetType: 'photo', targetId: id } }),
    ]);
    await this.prisma.photo.delete({ where: { id } });
    return { message: '照片已删除' };
  }

  async getVideos(page = 1) {
    const take = 20;
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        skip, take, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true, nickname: true } } },
      }),
      this.prisma.video.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / take) };
  }

  async deleteVideo(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('视频不存在');
    await Promise.all([
      this.prisma.like.deleteMany({ where: { targetType: 'video', targetId: id } }),
      this.prisma.comment.deleteMany({ where: { targetType: 'video', targetId: id } }),
      this.prisma.favorite.deleteMany({ where: { targetType: 'video', targetId: id } }),
    ]);
    await this.prisma.video.delete({ where: { id } });
    return { message: '视频已删除' };
  }
}
