import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { PrismaService } from '../../common/prisma.service';
import { CreateLetterDto } from './dto/create-letter.dto';

describe('MailboxService', () => {
  let service: MailboxService;
  let prisma: any;

  const mockLetter = {
    id: 'letter-1',
    userId: 'user-1',
    title: 'Future Letter',
    content: 'Hello future me!',
    status: 'SEALED',
    unlockTime: new Date('2099-01-01'),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      futureLetter: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailboxService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MailboxService>(MailboxService);
  });

  describe('create', () => {
    it('should create a sealed letter', async () => {
      const dto: CreateLetterDto = { title: 'My Letter', content: 'Content', unlockType: '1y' };
      prisma.futureLetter.create.mockResolvedValue(mockLetter);

      const result = await service.create('user-1', dto);

      expect(prisma.futureLetter.create).toHaveBeenCalled();
      expect(result.id).toBe('letter-1');
    });

    it('should create a letter with custom unlock date', async () => {
      const futureDate = '2030-06-01';
      const dto: CreateLetterDto = { title: 'Custom', content: 'Content', unlockType: 'custom', unlockDate: futureDate };
      const customLetter = { ...mockLetter, unlockTime: new Date(futureDate) };
      prisma.futureLetter.create.mockResolvedValue(customLetter);

      const result = await service.create('user-1', dto);

      expect(prisma.futureLetter.create).toHaveBeenCalled();
      expect(result.unlockTime).toEqual(new Date(futureDate));
    });
  });

  describe('findMyLetters', () => {
    it('should return all letters for user', async () => {
      prisma.futureLetter.findMany.mockResolvedValue([mockLetter]);

      const result = await service.findMyLetters('user-1');

      expect(prisma.futureLetter.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOpened', () => {
    it('should return opened letters past unlock time', async () => {
      prisma.futureLetter.findMany.mockResolvedValue([]);

      const result = await service.findOpened('user-1');

      expect(prisma.futureLetter.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', unlockTime: { lte: expect.any(Date) }, status: 'OPENED' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('openLetter', () => {
    it('should open a letter if unlock time has passed', async () => {
      const pastDate = new Date('2020-01-01');
      const openableLetter = { ...mockLetter, unlockTime: pastDate };
      prisma.futureLetter.findUnique.mockResolvedValue(openableLetter);
      prisma.futureLetter.update.mockResolvedValue({ ...openableLetter, status: 'OPENED' });

      const result = await service.openLetter('letter-1', 'user-1');

      expect(prisma.futureLetter.update).toHaveBeenCalledWith({
        where: { id: 'letter-1' },
        data: { status: 'OPENED' },
      });
      expect(result.status).toBe('OPENED');
    });

    it('should throw NotFoundException if letter not found', async () => {
      prisma.futureLetter.findUnique.mockResolvedValue(null);

      await expect(service.openLetter('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not owner', async () => {
      prisma.futureLetter.findUnique.mockResolvedValue(mockLetter);

      await expect(service.openLetter('letter-1', 'other-user')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if letter is still sealed', async () => {
      const futureDate = new Date('2099-01-01');
      const sealedLetter = { ...mockLetter, unlockTime: futureDate };
      prisma.futureLetter.findUnique.mockResolvedValue(sealedLetter);

      await expect(service.openLetter('letter-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
