import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../../common/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return ok status when db is connected', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.db).toBe('connected');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return db disconnected when query fails', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.db).toBe('disconnected');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
