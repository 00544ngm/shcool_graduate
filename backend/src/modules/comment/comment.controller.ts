import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: { id: string }) {
    return this.commentService.create(user.id, dto);
  }

  @Get()
  findByTarget(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.commentService.findByTarget(targetType, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.commentService.delete(id, user);
  }
}
