import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../../common/storage/storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private storage: StorageService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 9))
  async upload(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_SIZE })],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const urls = await Promise.all(
      files.map((f) => this.storage.save(f, 'moments')),
    );
    return { urls };
  }
}
