import { Test, TestingModule } from '@nestjs/testing';
import Database from 'better-sqlite3';
import { DatabaseService } from '../database/database.service.js';
import { PlanService } from './plan.service.js';

describe('PlanService', () => {
  let service: PlanService;
  let database: Database.Database;

  beforeEach(async () => {
    database = new Database(':memory:');
    database.exec(`
      CREATE TABLE plans (
        code TEXT PRIMARY KEY CHECK (code IN ('FREE', 'PRO', 'ULTRA')),
        name TEXT NOT NULL,
        storage_limit_bytes INTEGER,
        allowed_models TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO plans (code, name)
      VALUES ('FREE', 'FREE'), ('PRO', 'PRO'), ('ULTRA', 'ULTRA');
    `);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        {
          provide: DatabaseService,
          useValue: { connection: database },
        },
      ],
    }).compile();

    service = module.get<PlanService>(PlanService);
  });

  afterEach(() => {
    database.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updates storage limits and allowed models', () => {
    expect(
      service.update('PRO', {
        storage_limit_bytes: 10_000,
        allowed_models: ['model-a', 'model-b'],
      }),
    ).toMatchObject({
      code: 'PRO',
      storage_limit_bytes: 10_000,
      allowed_models: ['model-a', 'model-b'],
    });
  });

  it('lists the three built-in plans', () => {
    expect(service.findAll().map((plan) => plan.code)).toEqual([
      'FREE',
      'PRO',
      'ULTRA',
    ]);
  });
});
