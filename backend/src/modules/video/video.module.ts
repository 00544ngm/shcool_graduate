import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { StorageService } from '../../common/storage/storage.service';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } }),
  ],
  controllers: [VideoController],
  providers: [VideoService, StorageService],
})
export class VideoModule {}
