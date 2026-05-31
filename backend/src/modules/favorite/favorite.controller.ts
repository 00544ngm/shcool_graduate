import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Post('toggle')
  toggle(
    @CurrentUser() user: { id: string },
    @Body() dto: { targetType: string; targetId: string },
  ) {
    return this.favoriteService.toggle(user.id, dto.targetType, dto.targetId);
  }

  @Get()
  findMy(@CurrentUser() user: { id: string }) {
    return this.favoriteService.findMy(user.id);
  }
}
