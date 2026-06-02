import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';

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

  async delete(fileUrl: string): Promise<void> {
    const filepath = path.join(this.uploadDir, fileUrl.replace('/uploads/', ''));
    try {
      await fs.unlink(filepath);
    } catch (e) {
      this.logger.warn(`Failed to delete file: ${filepath}`, e);
    }
  }
}
