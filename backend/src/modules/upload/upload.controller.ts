import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../../common/storage/storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private storage: StorageService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 9))
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await Promise.all(
      files.map((f) => this.storage.save(f, 'moments')),
    );
    return { urls };
  }
}
