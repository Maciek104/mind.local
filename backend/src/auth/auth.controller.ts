
import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Response, Request } from 'express';

import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { LoginDto } from './dto/login.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
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
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return {
      authenticated: true,
      user: {
        id: request.user.id,
        email: request.user.email,
        role: request.user.role,
      },
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
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
