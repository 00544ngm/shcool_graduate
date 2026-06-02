import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  findMy(
    @CurrentUser() user: { id: string },
    @Query() pagination: PaginationDto,
  ) {
    return this.notificationService.findMy(user.id, pagination.page!, pagination.limit!);
  }

  @Get('unread')
  getUnreadCount(@CurrentUser() user: { id: string }) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Post(':id/read')
  markRead(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.notificationService.markRead(id, user.id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.notificationService.markAllRead(user.id);
  }

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  broadcast(
    @CurrentUser() user: { id: string },
    @Body('content') content: string,
  ) {
    if (!content || content.trim().length === 0) {
      return { message: '内容不能为空' };
    }
    if (content.length > 500) {
      return { message: '内容不能超过500字' };
    }
    return this.notificationService.broadcast(user.id, content.trim());
  }
}
