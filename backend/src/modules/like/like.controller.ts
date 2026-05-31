import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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
  async getLikes(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    const [count, users] = await Promise.all([
      this.likeService.count(targetType, targetId),
      this.likeService.findByTarget(targetType, targetId),
    ]);
    return { count, users };
  }
}
