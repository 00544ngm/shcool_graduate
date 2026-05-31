import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile, UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PhotoFilePipe } from '../../common/pipes/file-validation.pipe';

@Controller('photos')
export class PhotoController {
  constructor(private photoService: PhotoService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(PhotoFilePipe) file: Express.Multer.File,
    @Body() dto: CreatePhotoDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.photoService.create(user.id, file, dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.photoService.findAll(pagination.page!, pagination.limit!);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.photoService.search(query, pagination.page!, pagination.limit!);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.photoService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.photoService.delete(id, user);
  }
}
