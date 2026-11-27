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
        storage_limit_bytes INTEGER NOT NULL,
        allowed_models TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO plans (code, name, storage_limit_bytes)
      VALUES
        ('FREE', 'FREE', 1073741824),
        ('PRO', 'PRO', 10737418240),
        ('ULTRA', 'ULTRA', 107374182400);
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

  it('uses the default storage limits for each built-in plan', () => {
    expect(
      service.findAll().map((plan) => plan.storage_limit_bytes),
    ).toEqual([1073741824, 10737418240, 107374182400]);
  });
});
