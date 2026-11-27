
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly db: Database.Database;

  constructor() {
    const dataDirectory = path.join(process.cwd(), 'data');

    fs.mkdirSync(dataDirectory, { recursive: true });

    const databasePath = path.join(
      dataDirectory,
      'local-mind.sqlite',
    );

    const schemaPath = path.join(
      process.cwd(),
      '..',
      'database',
      'schema.sql',
    );

    console.log('Database directory:', dataDirectory);
    console.log('Database path:', databasePath);
    console.log('Schema path:', schemaPath);

    if (!fs.existsSync(schemaPath)) {
      throw new Error(
        `Nie znaleziono schematu bazy danych: ${schemaPath}`,
      );
    }

    this.db = new Database(databasePath);

    this.db.pragma('foreign_keys = ON');
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');

    const usersTable = this.db
      .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name = 'users'
      `)
      .get();

    if (!usersTable) {
      console.log('Database schema not found. Initializing...');

      const schema = fs.readFileSync(schemaPath, 'utf8');

      this.db.exec(schema);

      console.log('Database initialized successfully!');
    } else {
      console.log('Database schema already exists.');
      this.ensureUserColumns();
    }

    this.ensurePlans();
    this.ensureModels();

    console.log(`SQLite connected: ${databasePath}`);
  }

  private ensureUserColumns(): void {
    const columns = this.db
      .prepare('PRAGMA table_info(users)')
      .all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((column) => column.name));

    if (!columnNames.has('display_name')) {
      this.db.exec('ALTER TABLE users ADD COLUMN display_name TEXT');
    }
    if (!columnNames.has('bio')) {
      this.db.exec('ALTER TABLE users ADD COLUMN bio TEXT');
    }
    if (!columnNames.has('profile_image_path')) {
      this.db.exec(
        'ALTER TABLE users ADD COLUMN profile_image_path TEXT',
      );
    }
    if (!columnNames.has('plan')) {
      this.db.exec(
        "ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'FREE'",
      );
    }
  }

  private ensurePlans(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS plans (
        code TEXT PRIMARY KEY NOT NULL
          CHECK (code IN ('FREE', 'PRO', 'ULTRA')),
        name TEXT NOT NULL,
        storage_limit_bytes INTEGER NOT NULL
          CHECK (storage_limit_bytes >= 0),
        allowed_models TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TRIGGER IF NOT EXISTS trg_plans_updated_at
      AFTER UPDATE ON plans
      FOR EACH ROW
      BEGIN
        UPDATE plans
        SET updated_at = CURRENT_TIMESTAMP
        WHERE code = NEW.code;
      END;
    `);

    const insertPlan = this.db.prepare(`
      INSERT OR IGNORE INTO plans (code, name, storage_limit_bytes)
      VALUES (?, ?, ?)
    `);
    insertPlan.run('FREE', 'FREE', 1_073_741_824);
    insertPlan.run('PRO', 'PRO', 10_737_418_240);
    insertPlan.run('ULTRA', 'ULTRA', 107_374_182_400);

    this.db.exec(`
      UPDATE plans
      SET storage_limit_bytes = CASE code
        WHEN 'FREE' THEN 1073741824
        WHEN 'PRO' THEN 10737418240
        WHEN 'ULTRA' THEN 107374182400
      END
      WHERE storage_limit_bytes IS NULL;
    `);
  }

  private ensureModels(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS models (
        name TEXT PRIMARY KEY NOT NULL,
        model TEXT NOT NULL,
        modified_at TEXT,
        size INTEGER NOT NULL DEFAULT 0 CHECK (size >= 0),
        digest TEXT NOT NULL DEFAULT '',
        details TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TRIGGER IF NOT EXISTS trg_models_updated_at
      AFTER UPDATE ON models
      FOR EACH ROW
      BEGIN
        UPDATE models
        SET updated_at = CURRENT_TIMESTAMP
        WHERE name = NEW.name;
      END;
    `);
  }

  get connection(): Database.Database {
    return this.db;
  }

  onModuleDestroy(): void {
    this.db.close();
    console.log('SQLite connection closed.');
  }
}
