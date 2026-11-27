import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';

interface PlanRow {
  code: string;
  name: string;
  storage_limit_bytes: number;
  allowed_models: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PlanService {
  constructor(private readonly database: DatabaseService) {}

  findAll() {
    const rows = this.database.connection
      .prepare('SELECT * FROM plans ORDER BY code')
      .all() as PlanRow[];

    return rows.map((row) => this.toResponse(row));
  }

  findOne(code: string) {
    const row = this.database.connection
      .prepare('SELECT * FROM plans WHERE code = ? LIMIT 1')
      .get(code.trim().toUpperCase()) as PlanRow | undefined;

    if (!row) {
      throw new NotFoundException('Plan not found');
    }

    return this.toResponse(row);
  }

  update(code: string, updatePlanDto: UpdatePlanDto) {
    const planCode = code.trim().toUpperCase();
    this.findOne(planCode);

    const fields: string[] = [];
    const values: Array<string | number> = [];

    if (updatePlanDto.name !== undefined) {
      const name = updatePlanDto.name.trim();
      if (!name) {
        throw new BadRequestException('Plan name cannot be empty');
      }
      fields.push('name = ?');
      values.push(name);
    }
    if (updatePlanDto.storage_limit_bytes !== undefined) {
      fields.push('storage_limit_bytes = ?');
      values.push(updatePlanDto.storage_limit_bytes);
    }
    if (updatePlanDto.allowed_models !== undefined) {
      fields.push('allowed_models = ?');
      values.push(JSON.stringify(updatePlanDto.allowed_models));
    }

    if (fields.length === 0) {
      throw new BadRequestException('No plan fields were provided');
    }

    values.push(planCode);
    this.database.connection
      .prepare(`UPDATE plans SET ${fields.join(', ')} WHERE code = ?`)
      .run(...values);

    return this.findOne(planCode);
  }

  private toResponse(row: PlanRow) {
    return {
      code: row.code,
      name: row.name,
      storage_limit_bytes: row.storage_limit_bytes,
      allowed_models: JSON.parse(row.allowed_models) as string[],
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
