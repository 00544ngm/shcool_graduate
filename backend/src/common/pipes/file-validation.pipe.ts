import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Magic bytes signature: array of { offset, bytes } checks per mime type
// All checks must pass for the type to be valid.
const MAGIC_BYTES: Record<string, { offset: number; bytes: number[] }[]> = {
  'image/jpeg':    [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  'image/png':     [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  'image/gif':     [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }], // 37 61 or 39 61
  'image/webp':    [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
  ],
  'video/mp4':     [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }], // ftyp box
  'video/webm':    [{ offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] }],
  'video/quicktime': [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }], // ftyp box
};

function validateMagicBytes(file: Express.Multer.File): boolean {
  const checks = MAGIC_BYTES[file.mimetype];
  if (!checks) return true;

  const buf = file.buffer;
  return checks.every(({ offset, bytes }) => {
    const end = offset + bytes.length;
    if (buf.length < end) return false;
    return bytes.every((byte, i) => buf[offset + i] === byte);
  });
}

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

    if (!validateMagicBytes(file)) {
      throw new BadRequestException(
        `File content does not match declared type ${file.mimetype}`,
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
