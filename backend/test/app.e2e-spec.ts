// Must be set before any module imports to ensure JwtStrategy sees it
process.env.JWT_SECRET = 'test-secret-for-e2e';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

const request = supertest;

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    nickname: 'Test',
    role: 'MEMBER',
    passwordHash: '', // will be set dynamically
    createdAt: new Date(),
  };

  beforeAll(async () => {
    // Mock PrismaService
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: any) => ({
        id: 'user-1',
        ...data,
        role: 'MEMBER',
        passwordHash: data.passwordHash,
      }));

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'new@test.com', password: 'password123', nickname: 'New' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.username).toBe('newuser');
      expect(res.body.user.role).toBe('MEMBER');
    });

    it('should return 409 if username already exists', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'other@test.com', password: 'password123', nickname: 'Test' })
        .expect(409);
    });

    it('should return 400 for invalid input', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'a', email: 'invalid', password: '12', nickname: '' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Simulate a user that was created with pbkdf2 hash
      const crypto = require('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync('password123', salt, 100000, 64, 'sha512').toString('hex');

      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: `${salt}:${hash}`,
        username: 'testuser',
      });

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.username).toBe('testuser');
    });

    it('should return 401 with wrong password', async () => {
      const crypto = require('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync('password123', salt, 100000, 64, 'sha512').toString('hex');

      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: `${salt}:${hash}`,
      });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' })
        .expect(401);
    });
  });

  describe('Protected route', () => {
    it('should access profile with valid token', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const token = jwtService.sign({ sub: 'user-1', username: 'testuser', role: 'MEMBER' });

      const res = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/user/profile')
        .expect(401);
    });
  });
});
