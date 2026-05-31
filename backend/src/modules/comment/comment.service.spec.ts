import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PrismaService } from '../../common/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentService', () => {
  let service: CommentService;
  let prisma: any;
  let notificationService: any;

  const mockComment = {
    id: 'comment-1',
    userId: 'user-1',
    targetType: 'photo',
    targetId: 'target-1',
    content: 'Great photo!',
    parentId: null,
    createdAt: new Date(),
    user: { id: 'user-1', nickname: 'Test', avatar: null },
    replies: [],
  };

  beforeEach(async () => {
    prisma = {
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
      photo: {
        findUnique: jest.fn(),
      },
      video: {
        findUnique: jest.fn(),
      },
    };
    notificationService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const dto: CreateCommentDto = { targetType: 'photo', targetId: 'target-1', content: 'Great photo!' };
      prisma.comment.create.mockResolvedValue(mockComment);
      prisma.photo.findUnique.mockResolvedValue({ userId: 'owner-1' });

      const result = await service.create('user-1', dto);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', ...dto },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      });
      expect(result.id).toBe('comment-1');
    });

    it('should create a reply with parentId', async () => {
      const dto: CreateCommentDto = { targetType: 'photo', targetId: 'target-1', content: 'Reply!', parentId: 'comment-1' };
      const reply = { ...mockComment, id: 'reply-1', parentId: 'comment-1' };
      prisma.comment.create.mockResolvedValue(reply);
      prisma.photo.findUnique.mockResolvedValue({ userId: 'owner-1' });

      const result = await service.create('user-2', dto);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { userId: 'user-2', ...dto },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      });
      expect(result.parentId).toBe('comment-1');
    });
  });

  describe('findByTarget', () => {
    it('should return top-level comments with replies', async () => {
      const comments = [{
        ...mockComment,
        replies: [{
          id: 'reply-1',
          userId: 'user-2',
          content: 'Thanks!',
          user: { id: 'user-2', nickname: 'User2', avatar: null },
        }],
      }];
      prisma.comment.findMany.mockResolvedValue(comments);

      const result = await service.findByTarget('photo', 'target-1');

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { targetType: 'photo', targetId: 'target-1', parentId: null },
        orderBy: { createdAt: 'desc' },
        include: expect.objectContaining({
          replies: expect.objectContaining({ include: expect.any(Object) }),
        }),
      });
      expect(result).toHaveLength(1);
      expect(result[0].replies).toHaveLength(1);
    });
  });

  describe('delete', () => {
    const member = { id: 'user-1', role: 'MEMBER' };
    const other = { id: 'other-user', role: 'MEMBER' };

    it('should delete own comment with replies', async () => {
      prisma.comment.findUnique.mockResolvedValue(mockComment);

      await service.delete('comment-1', member);

      expect(prisma.comment.deleteMany).toHaveBeenCalledWith({
        where: { OR: [{ id: 'comment-1' }, { parentId: 'comment-1' }] },
      });
    });

    it('should throw if comment not found', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent', member)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      prisma.comment.findUnique.mockResolvedValue(mockComment);

      await expect(service.delete('comment-1', other)).rejects.toThrow(ForbiddenException);
    });
  });
});
