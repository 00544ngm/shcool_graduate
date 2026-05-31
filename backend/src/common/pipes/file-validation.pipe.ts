import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly options?: { allowedMimeTypes?: string[]; maxSize?: number },
  ) {}

  transform(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowed = this.options?.allowedMimeTypes
      ? new Set(this.options.allowedMimeTypes)
      : ALLOWED_MIME_TYPES;

    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Accepted: ${[...allowed].join(', ')}`,
      );
    }

    const maxSize = this.options?.maxSize ?? MAX_FILE_SIZE;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
    }

    return file;
  }
}

// Pre-configured pipes for common use cases
export const PhotoFilePipe = new FileValidationPipe({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 20 * 1024 * 1024, // 20MB for photos
});

export const VideoFilePipe = new FileValidationPipe({
  allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  maxSize: 500 * 1024 * 1024, // 500MB for videos
});
