import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: any;

  beforeEach(async () => {
    service = {
      stats: jest.fn(),
      getUsers: jest.fn(),
      updateRole: jest.fn(),
      resetPassword: jest.fn(),
      deleteUser: jest.fn(),
      getPhotos: jest.fn(),
      deletePhoto: jest.fn(),
      getVideos: jest.fn(),
      deleteVideo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: service },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  describe('stats', () => {
    it('should return aggregated statistics', async () => {
      service.stats.mockResolvedValue({ users: 10, photos: 50, videos: 5, comments: 100, letters: 20, moments: 30 });

      const result = await controller.stats();

      expect(result.users).toBe(10);
      expect(result.photos).toBe(50);
      expect(result.videos).toBe(5);
      expect(result.comments).toBe(100);
      expect(result.letters).toBe(20);
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 'u1', username: 'alice', nickname: 'Alice', email: 'alice@test.com', role: 'MEMBER', createdAt: new Date() },
      ];
      service.getUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('u1');
    });
  });

  describe('deleteUser', () => {
    it('should delegate to service', async () => {
      service.deleteUser.mockResolvedValue({ message: '用户 alice 已删除' });
      const result = await controller.deleteUser('u1');
      expect(service.deleteUser).toHaveBeenCalledWith('u1');
      expect(result.message).toContain('已删除');
    });
  });
});
