import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { StorageService } from '../../common/storage/storage.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
  controllers: [PhotoController],
  providers: [PhotoService, StorageService],
})
export class PhotoModule {}
