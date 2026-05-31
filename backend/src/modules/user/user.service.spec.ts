import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../common/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: any;

  const mockProfile = {
    id: 'user-1',
    username: 'testuser',
    nickname: 'Test',
    avatar: null,
    email: 'test@example.com',
    role: 'MEMBER',
    bio: null,
    dormitory: null,
    city: 'Beijing',
    graduationPhoto: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      prisma.user.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-1');

      expect(result?.id).toBe('user-1');
      expect(result?.username).toBe('testuser');
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      const update = { nickname: 'NewName' };
      prisma.user.update.mockResolvedValue({ ...mockProfile, nickname: 'NewName' });

      const result = await service.updateProfile('user-1', update);

      expect(result.nickname).toBe('NewName');
    });
  });

  describe('getCityMap', () => {
    it('should return city distribution', async () => {
      prisma.user.findMany.mockResolvedValue([
        { nickname: 'A', city: 'Beijing' },
        { nickname: 'B', city: 'Beijing' },
        { nickname: 'C', city: 'Shanghai' },
      ]);

      const result = await service.getCityMap();

      expect(result.total).toBe(3);
      expect(result.distribution.Beijing.count).toBe(2);
      expect(result.distribution.Shanghai.count).toBe(1);
    });
  });
});
