import { Controller, Get, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { HomeMessageService } from './home-message.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('home-messages')
export class HomeMessageController {
  constructor(private homeMessageService: HomeMessageService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.homeMessageService.findAll(limit ? Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200) : 50);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: { id: string },
    @Body('content') content: string,
  ) {
    if (!content || content.trim().length === 0) {
      return { message: '内容不能为空' };
    }
    if (content.length > 100) {
      return { message: '内容不能超过100字' };
    }
    return this.homeMessageService.create(user.id, content.trim());
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.homeMessageService.delete(id, user.id);
  }
}
