import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { VideoFilePipe } from '../../common/pipes/file-validation.pipe';

@Controller('videos')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(VideoFilePipe) file: Express.Multer.File,
    @Body() dto: CreateVideoDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.videoService.create(user.id, file, dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto, @Query('q') q?: string) {
    return this.videoService.findAll(pagination.page!, pagination.limit!, q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.videoService.delete(id, user);
  }
}
