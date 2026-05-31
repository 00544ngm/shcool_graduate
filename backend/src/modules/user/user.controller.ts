import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: { id: string }) {
    return this.userService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() data: { nickname?: string; bio?: string; city?: string; dormitory?: string },
  ) {
    return this.userService.updateProfile(user.id, data);
  }

  @Get('map')
  getMap() {
    return this.userService.getCityMap();
  }
}
