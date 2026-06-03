import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let tx: any;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    nickname: 'Test',
    role: 'MEMBER',
    passwordHash: 'salt:hash',
  };

  beforeEach(async () => {
    tx = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    prisma = {
      $transaction: jest.fn().mockImplementation((cb: any) => cb(tx)),
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const dto: RegisterDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      nickname: 'New User',
    };

    it('should register a new user and return token', async () => {
      tx.user.findFirst.mockResolvedValue(null);
      tx.user.create.mockResolvedValue(mockUser);

      const result = await service.register(dto);

      expect(tx.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ username: dto.username }, { email: dto.email }] },
      });
      expect(tx.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.username).toBe('testuser');
    });

    it('should throw ConflictException if username or email exists', async () => {
      tx.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(tx.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto: LoginDto = { username: 'testuser', password: 'password123' };

    it('should login and return token', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(service as any, 'verifyPassword').mockReturnValue(true);

      const result = await service.login(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: dto.username },
      });
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(service as any, 'verifyPassword').mockReturnValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('password hashing', () => {
    it('should hash and verify password correctly', () => {
      const password = 'test-password';
      const stored = (service as any).hashPassword(password);
      const [salt, hash] = stored.split(':');

      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
      expect(stored.split(':').length).toBe(2);
      expect((service as any).verifyPassword(password, stored)).toBe(true);
      expect((service as any).verifyPassword('wrong-password', stored)).toBe(false);
    });
  });
});
