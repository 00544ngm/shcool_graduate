import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.userService.findAll(pagination.page!, pagination.limit!);
  }

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
  getCityMap() {
    return this.userService.getCityMap();
  }

  @Get('dormitory-groups')
  getDormitoryGroups() {
    return this.userService.getDormitoryGroups();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }
}
