import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import 'multer';
import { AdminGuard } from '../auth/admin.guard.js';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: string };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  findMe(@Req() request: AuthenticatedRequest) {
    return this.usersService.findOne(request.user.id);
  }

  @Patch('me')
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto.is_active !== undefined) {
      throw new BadRequestException(
        'Nie możesz zmieniać statusu własnego konta przez profil',
      );
    }
    return this.usersService.update(request.user.id, updateUserDto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadAvatar(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() avatar: Express.Multer.File | undefined,
  ) {
    if (!avatar) {
      throw new BadRequestException('No avatar was uploaded');
    }
    return this.usersService.updateAvatar(request.user.id, avatar);
  }

  @Get('me/avatar')
  getAvatar(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const avatarPath = this.usersService.findAvatar(request.user.id);
    if (!avatarPath) {
      throw new BadRequestException('The user has no avatar');
    }
    response.sendFile(avatarPath);
  }

  @Delete('me/avatar')
  removeAvatar(@Req() request: AuthenticatedRequest) {
    return this.usersService.removeAvatar(request.user.id);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (id === request.user.id && updateUserDto.is_active === false) {
      throw new BadRequestException(
        'Nie możesz dezaktywować własnego konta administratora',
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (id === request.user.id) {
      throw new BadRequestException(
        'Nie możesz usunąć własnego konta administratora',
      );
    }
    return this.usersService.remove(id);
  }
}
