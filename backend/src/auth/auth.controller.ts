
import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
} from '@nestjs/common';

import type { Response, Request } from 'express';

import { AuthService } from './auth.service.js';
import { Public } from './public.decorator.js';
import { LoginDto } from './dto/login.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    bio: string | null;
    profile_image_path: string | null;
    plan: string;
    role: string;
    sessionId: string;
  };
}

const COOKIE_NAME = 'local_mind_session';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @Public()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      dto.email,
      dto.password,
    );

    response.cookie(
      COOKIE_NAME,
      result.token,
      {
        ...cookieOptions,
        maxAge: COOKIE_MAX_AGE,
      },
    );

    return {
      success: true,
      user: result.user,
    };
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return {
      authenticated: true,
      user: {
        id: request.user.id,
        email: request.user.email,
        display_name: request.user.display_name,
        bio: request.user.bio,
        profile_image_path: request.user.profile_image_path,
        plan: request.user.plan,
        role: request.user.role,
      },
    };
  }

  @Post('logout')
  logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.authService.logout(request.user.sessionId);

    response.clearCookie(
      COOKIE_NAME,
      cookieOptions,
    );

    return {
      success: true,
      message: 'Wylogowano pomyślnie',
    };
  }
}
