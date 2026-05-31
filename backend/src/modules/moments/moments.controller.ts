import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { CreateMomentDto } from './dto/create-moment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('moments')
export class MomentsController {
  constructor(private momentsService: MomentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateMomentDto, @CurrentUser() user: { id: string }) {
    return this.momentsService.create(user.id, dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.momentsService.findAll(pagination.page!, pagination.limit!);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.momentsService.delete(id, user);
  }
}
