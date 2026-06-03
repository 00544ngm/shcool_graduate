import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private uploadDir = path.resolve(process.env.STORAGE_PATH || './uploads');

  async save(file: Express.Multer.File, subDir = 'photos'): Promise<string> {
    const dir = path.join(this.uploadDir, subDir);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(dir, filename);

    await fs.writeFile(filepath, file.buffer);
    return `/uploads/${subDir}/${filename}`;
  }

  async saveThumbnail(file: Express.Multer.File, subDir = 'photos'): Promise<string | null> {
    if (!file.mimetype.startsWith('image/')) return null;
    const dir = path.join(this.uploadDir, subDir);
    await fs.mkdir(dir, { recursive: true });
    const thumbFilename = `${randomUUID()}-thumb.webp`;
    const thumbPath = path.join(dir, thumbFilename);
    await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'centre' })
      .webp({ quality: 75 })
      .toFile(thumbPath);
    return `/uploads/${subDir}/${thumbFilename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const filepath = path.join(this.uploadDir, fileUrl.replace('/uploads/', ''));
    try {
      await fs.unlink(filepath);
    } catch (e) {
      this.logger.warn(`Failed to delete file: ${filepath}`, e);
    }
  }
}
