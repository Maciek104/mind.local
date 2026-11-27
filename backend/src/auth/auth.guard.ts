
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

import type { Request } from 'express';

interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_path: string | null;
  plan: string;
  role: string;
  sessionId: string;
}

interface AuthRequest extends Request {
  cookies: Record<string, string>;
  user?: AuthenticatedUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly database: DatabaseService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthRequest>();

    const token = request.cookies?.local_mind_session;

    if (!token) {
      throw new UnauthorizedException(
        'You must sign in',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        jti: string;
      }>(token);

      if (!payload.sub || !payload.jti) {
        throw new UnauthorizedException();
      }

      const now = Math.floor(Date.now() / 1000);

      const session = this.database.connection
        .prepare(`
          SELECT id
          FROM auth_sessions
          WHERE id = ?
            AND user_id = ?
            AND expires_at > ?
          LIMIT 1
        `)
        .get(
          payload.jti,
          payload.sub,
          now,
        );

      if (!session) {
        throw new UnauthorizedException(
          'The session has expired or been revoked',
        );
      }

      const user = this.database.connection
        .prepare(`
          SELECT
            id,
            email,
            display_name,
            bio,
            profile_image_path,
            plan,
            role
          FROM users
          WHERE id = ?
            AND is_active = 1
          LIMIT 1
        `)
        .get(payload.sub) as
        | {
            id: string;
            email: string;
            display_name: string | null;
            bio: string | null;
            profile_image_path: string | null;
            plan: string;
            role: string;
          }
        | undefined;

      if (!user) {
        throw new UnauthorizedException(
          'The user account is inactive',
        );
      }

      request.user = {
        ...user,
        sessionId: payload.jti,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'The session is invalid or has expired',
      );
    }
  }
}
