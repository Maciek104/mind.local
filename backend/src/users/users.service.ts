import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import 'multer';

export interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_path: string | null;
  plan: string;
  role: 'USER' | 'ADMIN';
  is_active: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const plan = dto.plan?.trim().toUpperCase() ?? 'FREE';
    this.assertPlanExists(plan);

    const existing = this.database.connection
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const id = randomUUID();

    this.database.connection
      .prepare(`
        INSERT INTO users (
          id,
          email,
          password_hash,
          display_name,
          bio,
          profile_image_path,
          plan,
          role
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'USER')
      `)
      .run(
        id,
        email,
        passwordHash,
        dto.display_name ?? null,
        dto.bio ?? null,
        dto.profile_image_path ?? null,
        plan,
      );

    return this.findOne(id);
  }

  findAll() {
    return this.database.connection
      .prepare(`
        SELECT
          id,
          email,
          display_name,
          bio,
          profile_image_path,
          plan,
          role,
          is_active,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC
      `)
      .all() as UserRow[];
  }

  findOne(id: string) {
    const user = this.database.connection
      .prepare(`
        SELECT
          id,
          email,
          display_name,
          bio,
          profile_image_path,
          plan,
          role,
          is_active,
          created_at,
          updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `)
      .get(id) as UserRow | undefined;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = this.findOne(id);

    if (dto.plan !== undefined) {
      dto.plan = dto.plan.trim().toUpperCase();
      this.assertPlanExists(dto.plan);
    }

    if (
      user.role === 'ADMIN' &&
      user.is_active === 1 &&
      dto.is_active === false
    ) {
      this.assertNotLastActiveAdmin(id);
    }

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const existing = this.database.connection
        .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .get(email, id);

      if (existing) {
        throw new ConflictException('A user with this email already exists');
      }
      dto.email = email;
    }

    const fields: string[] = [];
    const values: Array<string | number | null | bigint | Buffer> = [];

    for (const key of [
      'email',
      'display_name',
      'bio',
      'profile_image_path',
      'plan',
    ] as const) {
      if (dto[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(dto[key]);
      }
    }

    if (dto.password) {
      fields.push('password_hash = ?');
      values.push(await bcrypt.hash(dto.password, 12));
    }

    if (dto.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(dto.is_active ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    values.push(id);
    this.database.connection
      .prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      .run(...values);

    return this.findOne(id);
  }

  remove(id: string) {
    const user = this.findOne(id);
    if (user.role === 'ADMIN' && user.is_active === 1) {
      this.assertNotLastActiveAdmin(id);
    }
    this.database.connection
      .prepare('DELETE FROM users WHERE id = ?')
      .run(id);
    return { success: true };
  }

  private assertNotLastActiveAdmin(id: string): void {
    const activeAdmins = this.database.connection
      .prepare(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE role = 'ADMIN' AND is_active = 1 AND id != ?
      `)
      .get(id) as { count: number };

    if (activeAdmins.count === 0) {
      throw new BadRequestException(
        'The last active administrator cannot be deactivated or deleted',
      );
    }
  }

  private assertPlanExists(code: string): void {
    const plan = this.database.connection
      .prepare('SELECT code FROM plans WHERE code = ? LIMIT 1')
      .get(code);

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }
  }

  updateAvatar(userId: string, avatar: Express.Multer.File) {
    if (!avatar.mimetype.startsWith('image/')) {
      throw new BadRequestException('Avatar must be an image');
    }

    const avatarsDirectory = path.join(
      process.cwd(),
      'data',
      'avatars',
    );
    fs.mkdirSync(avatarsDirectory, { recursive: true });

    const oldPath = this.findAvatar(userId);
    const extension = path.extname(avatar.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const storedExtension = allowedExtensions.includes(extension)
      ? extension
      : '.jpg';
    const avatarPath = path.join(
      avatarsDirectory,
      `${randomUUID()}${storedExtension}`,
    );

    fs.writeFileSync(avatarPath, avatar.buffer);

    try {
      this.database.connection
        .prepare('UPDATE users SET profile_image_path = ? WHERE id = ?')
        .run(avatarPath, userId);
    } catch (error) {
      fs.rmSync(avatarPath, { force: true });
      throw error;
    }

    if (oldPath) {
      fs.rmSync(oldPath, { force: true });
    }

    return this.findOne(userId);
  }

  findAvatar(userId: string): string | null {
    const user = this.findOne(userId);
    return user.profile_image_path;
  }

  removeAvatar(userId: string) {
    const avatarPath = this.findAvatar(userId);
    if (avatarPath) {
      fs.rmSync(avatarPath, { force: true });
    }

    this.database.connection
      .prepare('UPDATE users SET profile_image_path = NULL WHERE id = ?')
      .run(userId);

    return this.findOne(userId);
  }
}
