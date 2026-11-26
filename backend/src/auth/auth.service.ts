
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';

import * as bcrypt from 'bcrypt';

import { randomUUID } from 'crypto';

const SESSION_DURATION = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = this.database.connection
      .prepare(`
        SELECT
          id,
          email,
          password_hash,
          display_name,
          bio,
          profile_image_path,
          plan,
          role,
          is_active
        FROM users
        WHERE email = ?
        LIMIT 1
      `)
      .get(normalizedEmail) as
      | {
          id: string;
          email: string;
          password_hash: string;
          display_name: string | null;
          bio: string | null;
          profile_image_path: string | null;
          plan: string;
          role: string;
          is_active: number;
        }
      | undefined;

    if (!user || user.is_active !== 1) {
      throw new UnauthorizedException(
        'Nieprawidłowy e-mail lub hasło',
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Nieprawidłowy e-mail lub hasło',
      );
    }

    const sessionId = randomUUID();

    const expiresAt =
      Math.floor(Date.now() / 1000) + SESSION_DURATION;

    this.database.connection
      .prepare(`
        INSERT INTO auth_sessions (
          id,
          user_id,
          expires_at
        )
        VALUES (?, ?, ?)
      `)
      .run(sessionId, user.id, expiresAt);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      jti: sessionId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        bio: user.bio,
        profile_image_path: user.profile_image_path,
        plan: user.plan,
        role: user.role,
      },
      expiresAt,
    };
  }

  getUserById(userId: string) {
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
      .get(userId);

    return user;
  }

  logout(sessionId: string) {
    this.database.connection
      .prepare(`
        DELETE FROM auth_sessions
        WHERE id = ?
      `)
      .run(sessionId);
  }
}
