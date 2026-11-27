import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { AdminGuard } from '../auth/admin.guard.js';

function getMethodGuards(methodName: string): unknown[] {
  const method = Object.getOwnPropertyDescriptor(
    UsersController.prototype,
    methodName,
  )?.value;
  return Reflect.getMetadata('__guards__', method) ?? [];
}

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    updateAvatar: vi.fn(),
    findAvatar: vi.fn(),
    removeAvatar: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('lets admins upload an avatar for a user', () => {
    const avatar = {
      buffer: Buffer.from('image'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const updatedUser = { id: 'user-id' };
    usersService.updateAvatar.mockReturnValue(updatedUser);

    expect(controller.uploadUserAvatar('user-id', avatar)).toBe(updatedUser);
    expect(usersService.updateAvatar.mock.calls[0]).toEqual(['user-id', avatar]);
    expect(getMethodGuards('uploadUserAvatar')).toContain(AdminGuard);
  });

  it('rejects an avatar upload when no file is provided', () => {
    expect(() => controller.uploadUserAvatar('user-id', undefined))
      .toThrow(BadRequestException);
  });

  it('lets admins remove a user avatar', () => {
    const updatedUser = { id: 'user-id', profile_image_path: null };
    usersService.removeAvatar.mockReturnValue(updatedUser);

    expect(controller.removeUserAvatar('user-id')).toBe(updatedUser);
    expect(usersService.removeAvatar.mock.calls[0]).toEqual(['user-id']);
    expect(getMethodGuards('removeUserAvatar')).toContain(AdminGuard);
  });
});
