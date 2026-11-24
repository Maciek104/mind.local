
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';
import { InitializeSetupDto } from './dto/initialize-setup.dto.js';

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class SetupService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  getStatus() {
    const result = this.database.connection
      .prepare(
        "SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'",
      )
      .get() as { count: number };

    return {
      initialized: result.count > 0,
    };
  }

  async initialize(dto: InitializeSetupDto) {
    const email = dto.email.trim().toLowerCase();

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Hasła nie są identyczne');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const db = this.database.connection;

    const createAdmin = db.transaction(() => {
      const existingAdmin = db
        .prepare(
          "SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1",
        )
        .get();

      if (existingAdmin) {
        throw new ConflictException(
          'Konfiguracja aplikacji została już zakończona',
        );
      }

      const existingUser = db
        .prepare(
          'SELECT id FROM users WHERE email = ? LIMIT 1',
        )
        .get(email);

      if (existingUser) {
        throw new ConflictException(
          'Użytkownik z tym adresem e-mail już istnieje',
        );
      }

      db.prepare(`
        INSERT INTO users (
          id,
          email,
          password_hash,
          role
        )
        VALUES (?, ?, ?, 'ADMIN')
      `).run(
        randomUUID(),
        email,
        passwordHash,
      );
    });

    createAdmin.immediate();

    return {
      success: true,
      message: 'Konto administratora zostało utworzone',
    };
  }
}
