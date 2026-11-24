
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';

import type { Request } from 'express';

interface AuthenticatedUser {
  id: string;
  email: string;
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
    private readonly jwtService: JwtService,
    private readonly database: DatabaseService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthRequest>();

    const token = request.cookies?.local_mind_session;

    if (!token) {
      throw new UnauthorizedException(
        'Musisz się zalogować',
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
          'Sesja wygasła lub została unieważniona',
        );
      }

      const user = this.database.connection
        .prepare(`
          SELECT id, email, role
          FROM users
          WHERE id = ?
            AND is_active = 1
          LIMIT 1
        `)
        .get(payload.sub) as
        | {
            id: string;
            email: string;
            role: string;
          }
        | undefined;

      if (!user) {
        throw new UnauthorizedException(
          'Konto użytkownika jest nieaktywne',
        );
      }

      request.user = {
        ...user,
        sessionId: payload.jti,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Nieprawidłowa lub wygasła sesja',
      );
    }
  }
}
