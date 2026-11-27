import { Test, TestingModule } from '@nestjs/testing';
import Database from 'better-sqlite3';
import { DatabaseService } from '../database/database.service.js';
import { DocumentProcessor } from './document-processor.service.js';
import { DocumentsService } from './documents.service.js';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let database: Database.Database;
  let createdDocumentId: string | undefined;

  beforeEach(async () => {
    database = new Database(':memory:');
    database.exec(`
      CREATE TABLE plans (
        code TEXT PRIMARY KEY NOT NULL,
        storage_limit_bytes INTEGER
      );
      INSERT INTO plans (code, storage_limit_bytes) VALUES ('FREE', 1000000);
      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        plan TEXT NOT NULL
      );
      INSERT INTO users (id, plan) VALUES ('user-1', 'FREE');
      CREATE TABLE documents (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        original_name TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        mime_type TEXT,
        file_size INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        extracted_text TEXT,
        error_message TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE TABLE document_chunks (
        id TEXT PRIMARY KEY NOT NULL,
        document_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        embedding BLOB,
        page_number INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        UNIQUE (document_id, chunk_index)
      );
    `);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        DocumentProcessor,
        {
          provide: DatabaseService,
          useValue: { connection: database },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    if (createdDocumentId) {
      service.remove('user-1', createdDocumentId);
      createdDocumentId = undefined;
    }
    database.close();
  });

  it('extracts, normalizes, and stores overlapping chunks when a document is uploaded', async () => {
    const content = `  First  paragraph.\r\n\r\n\r\n${'Useful LLM context. '.repeat(450)}  `;
    const file = createUpload('notes.txt', content);

    const uploaded = await service.create('user-1', file);
    createdDocumentId = uploaded.id;

    expect(uploaded.status).toBe('COMPLETED');
    expect(uploaded.extractedText).toBeNull();
    expect(service.findOne('user-1', uploaded.id).extractedText).toContain(
      'First paragraph.\n\nUseful LLM context.',
    );
    expect(service.findAll('user-1')[0].extractedText).toBeNull();

    const chunks = database
      .prepare(
        `
        SELECT chunk_index, content, page_number
        FROM document_chunks
        WHERE document_id = ?
        ORDER BY chunk_index
      `,
      )
      .all(uploaded.id) as Array<{
      chunk_index: number;
      content: string;
      page_number: number | null;
    }>;

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.map((chunk) => chunk.chunk_index)).toEqual(
      chunks.map((_, index) => index),
    );
    expect(chunks.every((chunk) => chunk.content.length <= 4_001)).toBe(true);
    expect(chunks.every((chunk) => chunk.page_number === null)).toBe(true);
  });

  it('rejects unsupported files before storing them', async () => {
    await expect(
      service.create('user-1', createUpload('image.png', 'not an image')),
    ).rejects.toThrow('Unsupported document type');
    expect(
      database.prepare('SELECT COUNT(*) AS count FROM documents').get(),
    ).toEqual({ count: 0 });
  });

  it('rejects uploads that exceed the remaining plan storage allowance', async () => {
    database
      .prepare('UPDATE plans SET storage_limit_bytes = ? WHERE code = ?')
      .run(8, 'FREE');

    const firstUpload = await service.create(
      'user-1',
      createUpload('first.txt', '12345'),
    );
    createdDocumentId = firstUpload.id;
    await expect(
      service.create('user-1', createUpload('second.txt', '6789')),
    ).rejects.toThrow('Storage limit exceeded');
    expect(service.findAll('user-1')).toHaveLength(1);
  });
});

function createUpload(
  originalname: string,
  content: string,
): Express.Multer.File {
  const buffer = Buffer.from(content);
  return {
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype: 'text/plain',
    size: buffer.length,
    destination: '',
    filename: '',
    path: '',
    buffer,
  };
}
