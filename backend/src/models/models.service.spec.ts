import { Test, TestingModule } from '@nestjs/testing';
import Database from 'better-sqlite3';
import { DatabaseService } from '../database/database.service.js';
import { ModelsService } from './models.service.js';

describe('ModelsService', () => {
  let service: ModelsService;
  let database: Database.Database;

  beforeEach(async () => {
    database = new Database(':memory:');
    database.exec(`
      CREATE TABLE models (
        name TEXT PRIMARY KEY NOT NULL,
        model TEXT NOT NULL,
        modified_at TEXT,
        size INTEGER NOT NULL DEFAULT 0 CHECK (size >= 0),
        digest TEXT NOT NULL DEFAULT '',
        details TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelsService,
        {
          provide: DatabaseService,
          useValue: { connection: database },
        },
      ],
    }).compile();

    service = module.get<ModelsService>(ModelsService);
  });

  afterEach(() => {
    database.close();
    vi.unstubAllGlobals();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('synchronizes Ollama models to SQLite and removes models no longer present', async () => {
    database
      .prepare(
        "INSERT INTO models (name, model) VALUES ('old-model', 'old-model')",
      )
      .run();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            models: [
              {
                name: 'llama3.2:latest',
                model: 'llama3.2:latest',
                modified_at: '2025-01-01T00:00:00Z',
                size: 1_000,
                digest: 'abc123',
                details: { family: 'llama', parameter_size: '3B' },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(service.syncFromOllama()).resolves.toMatchObject({
      synced: 1,
      models: [
        {
          name: 'llama3.2:latest',
          size: 1_000,
          details: { family: 'llama', parameter_size: '3B' },
        },
      ],
    });
    expect(() => service.findOne('old-model')).toThrow('Model not found');
  });

  it('rejects invalid model data returned by Ollama without changing the catalog', async () => {
    database
      .prepare(
        "INSERT INTO models (name, model) VALUES ('existing-model', 'existing-model')",
      )
      .run();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ models: [{ name: '' }] }), {
          status: 200,
        }),
      ),
    );

    await expect(service.syncFromOllama()).rejects.toThrow(
      'Ollama returned an invalid model',
    );
    expect(service.findAll().map((model) => model.name)).toEqual([
      'existing-model',
    ]);
  });
});
