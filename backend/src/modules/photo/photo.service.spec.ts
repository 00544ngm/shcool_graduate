import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PrismaService } from '../../common/prisma.service';
import { StorageService } from '../../common/storage/storage.service';

describe('PhotoService', () => {
  let service: PhotoService;
  let prisma: any;
  let storage: any;

  const mockPhoto = {
    id: 'photo-1',
    userId: 'user-1',
    imageUrl: 'photos/test.jpg',
    title: 'Test Photo',
    description: 'A test photo',
    location: 'Test Location',
    tags: ['test', 'photo'],
    takenAt: null,
    createdAt: new Date(),
    user: { id: 'user-1', nickname: 'Test', avatar: null },
  };

  beforeEach(async () => {
    prisma = {
      photo: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
    };
    storage = {
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotoService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<PhotoService>(PhotoService);
  });

  describe('create', () => {
    it('should create a photo', async () => {
      const file = { originalname: 'test.jpg', buffer: Buffer.from(''), mimetype: 'image/jpeg' } as Express.Multer.File;
      const dto = { title: 'Test', description: 'Desc', location: 'Loc', tags: ['tag1'] };

      storage.save.mockResolvedValue('photos/uuid-test.jpg');
      prisma.photo.create.mockResolvedValue(mockPhoto);

      const result = await service.create('user-1', file, dto);

      expect(storage.save).toHaveBeenCalledWith(file, 'photos');
      expect(prisma.photo.create).toHaveBeenCalled();
      expect(result.id).toBe('photo-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated photos', async () => {
      prisma.photo.findMany.mockResolvedValue([mockPhoto]);
      prisma.photo.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should compute totalPages correctly', async () => {
      prisma.photo.findMany.mockResolvedValue([]);
      prisma.photo.count.mockResolvedValue(25);

      const result = await service.findAll(1, 10);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a photo by id', async () => {
      prisma.photo.findUnique.mockResolvedValue(mockPhoto);

      const result = await service.findOne('photo-1');

      expect(result.id).toBe('photo-1');
    });

    it('should throw NotFoundException if photo not found', async () => {
      prisma.photo.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      prisma.photo.findMany.mockResolvedValue([mockPhoto]);
      prisma.photo.count.mockResolvedValue(1);

      const result = await service.search('test');

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('delete', () => {
    const member = { id: 'user-1', role: 'MEMBER' };
    const other = { id: 'other-user', role: 'MEMBER' };

    it('should delete own photo', async () => {
      prisma.photo.findUnique.mockResolvedValue(mockPhoto);

      await service.delete('photo-1', member);

      expect(storage.delete).toHaveBeenCalledWith(mockPhoto.imageUrl);
      expect(prisma.photo.delete).toHaveBeenCalledWith({ where: { id: 'photo-1' } });
    });

    it('should throw NotFoundException if photo not found', async () => {
      prisma.photo.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent', member)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not owner', async () => {
      prisma.photo.findUnique.mockResolvedValue(mockPhoto);

      await expect(service.delete('photo-1', other)).rejects.toThrow(NotFoundException);
    });
  });
});
