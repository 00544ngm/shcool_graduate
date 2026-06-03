import { Controller, Get, Delete, Param, UseGuards, Query, Body, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateRole(id, role);
  }

  @Patch('users/:id/reset-password')
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.adminService.resetPassword(id, password);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('photos')
  getPhotos(@Query('page') pageStr?: string) {
    return this.adminService.getPhotos(Math.max(1, parseInt(pageStr || '1', 10)));
  }

  @Delete('photos/:id')
  deletePhoto(@Param('id') id: string) {
    return this.adminService.deletePhoto(id);
  }

  @Get('videos')
  getVideos(@Query('page') pageStr?: string) {
    return this.adminService.getVideos(Math.max(1, parseInt(pageStr || '1', 10)));
  }

  @Delete('videos/:id')
  deleteVideo(@Param('id') id: string) {
    return this.adminService.deleteVideo(id);
  }
}
