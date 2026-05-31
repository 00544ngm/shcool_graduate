import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ToggleLikeDto } from './dto/toggle-like.dto';

@Controller('likes')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  toggle(@CurrentUser() user: { id: string }, @Body() dto: ToggleLikeDto) {
    return this.likeService.toggle(user.id, dto.targetType, dto.targetId);
  }

  @Get(':targetType/:targetId')
  @UseGuards(OptionalJwtAuthGuard)
  async getLikes(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Req() req: Request,
  ) {
    const [count, users, userLiked] = await Promise.all([
      this.likeService.count(targetType, targetId),
      this.likeService.findByTarget(targetType, targetId),
      req.user ? this.likeService.userLiked((req.user as any).id, targetType, targetId) : Promise.resolve(false),
    ]);
    return { count, users, userLiked };
  }
}
