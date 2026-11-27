import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import type { Model } from './entities/model.entity.js';

interface ModelRow extends Omit<Model, 'details'> {
  details: string;
}

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string | null;
  size: number;
  digest: string;
  details: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Injectable()
export class ModelsService {
  constructor(private readonly database: DatabaseService) {}

  findAll(): Model[] {
    const rows = this.database.connection
      .prepare('SELECT * FROM models ORDER BY name')
      .all() as ModelRow[];

    return rows.map((row) => this.toResponse(row));
  }

  findOne(name: string): Model {
    const row = this.database.connection
      .prepare('SELECT * FROM models WHERE name = ? LIMIT 1')
      .get(name) as ModelRow | undefined;

    if (!row) {
      throw new NotFoundException('Model not found');
    }

    return this.toResponse(row);
  }

  async syncFromOllama(): Promise<{ synced: number; models: Model[] }> {
    const baseUrl =
      process.env.OLLAMA_BASE_URL?.trim() || 'http://localhost:11434';
    let endpoint: URL;

    try {
      endpoint = new URL('/api/tags', baseUrl);
    } catch (error) {
      throw new ServiceUnavailableException(
        'OLLAMA_BASE_URL is not a valid URL',
        {
          cause: error,
        },
      );
    }

    if (endpoint.protocol !== 'http:' && endpoint.protocol !== 'https:') {
      throw new ServiceUnavailableException(
        'OLLAMA_BASE_URL must use HTTP or HTTPS',
      );
    }

    let response: Response;
    try {
      response = await fetch(endpoint, { signal: AbortSignal.timeout(10_000) });
    } catch (error) {
      throw new ServiceUnavailableException('Unable to connect to Ollama', {
        cause: error,
      });
    }

    if (!response.ok) {
      throw new BadGatewayException(`Ollama returned HTTP ${response.status}`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new BadGatewayException('Ollama returned invalid JSON', {
        cause: error,
      });
    }

    if (!isRecord(payload) || !Array.isArray(payload.models)) {
      throw new BadGatewayException('Ollama returned an invalid model list');
    }

    const models = payload.models.map((model) => this.parseOllamaModel(model));
    const database = this.database.connection;
    const upsertModel = database.prepare(`
      INSERT INTO models (name, model, modified_at, size, digest, details)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        model = excluded.model,
        modified_at = excluded.modified_at,
        size = excluded.size,
        digest = excluded.digest,
        details = excluded.details
    `);

    database.transaction((syncedModels: OllamaModel[]) => {
      for (const model of syncedModels) {
        upsertModel.run(
          model.name,
          model.model,
          model.modified_at,
          model.size,
          model.digest,
          JSON.stringify(model.details),
        );
      }

      if (syncedModels.length === 0) {
        database.prepare('DELETE FROM models').run();
      } else {
        const placeholders = syncedModels.map(() => '?').join(', ');
        database
          .prepare(`DELETE FROM models WHERE name NOT IN (${placeholders})`)
          .run(...syncedModels.map((model) => model.name));
      }
    })(models);

    return { synced: models.length, models: this.findAll() };
  }

  private parseOllamaModel(value: unknown): OllamaModel {
    if (!isRecord(value)) {
      throw new BadGatewayException('Ollama returned an invalid model');
    }

    const name = value.name;
    const model = value.model ?? name;
    const modifiedAt = value.modified_at ?? null;
    const size = value.size ?? 0;
    const digest = value.digest ?? '';
    const details = value.details ?? {};

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof model !== 'string' ||
      !model.trim() ||
      (modifiedAt !== null && typeof modifiedAt !== 'string') ||
      typeof size !== 'number' ||
      !Number.isSafeInteger(size) ||
      size < 0 ||
      typeof digest !== 'string' ||
      !isRecord(details)
    ) {
      throw new BadGatewayException('Ollama returned an invalid model');
    }

    return {
      name,
      model,
      modified_at: modifiedAt,
      size,
      digest,
      details,
    };
  }

  private toResponse(row: ModelRow): Model {
    return {
      ...row,
      details: JSON.parse(row.details) as Record<string, unknown>,
    };
  }
}
