
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
    }

    console.log(`SQLite connected: ${databasePath}`);
  }

  get connection(): Database.Database {
    return this.db;
  }

  onModuleDestroy(): void {
    this.db.close();
    console.log('SQLite connection closed.');
  }
}
