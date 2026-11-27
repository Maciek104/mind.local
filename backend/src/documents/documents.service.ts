import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { DocumentProcessor } from './document-processor.service.js';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import 'multer';

interface DocumentRow {
  id: string;
  user_id: string;
  original_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number;
  status: string;
  extracted_text: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminDocumentRow extends DocumentRow {
  user_email: string;
  user_display_name: string | null;
}

interface UserStorageRow {
  storage_limit_bytes: number | null;
  used_bytes: number;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly documentProcessor: DocumentProcessor,
  ) {}

  async create(userId: string, file: Express.Multer.File) {
    const fileSize = file.buffer.byteLength;
    if (file.size === 0 || fileSize === 0) {
      throw new BadRequestException('The file is empty.');
    }

    this.assertStorageAvailable(userId, fileSize);
    const processedDocument = await this.documentProcessor.prepare(
      file.originalname,
      file.buffer,
    );
    const documentsDirectory = path.join(
      process.cwd(),
      'data',
      'documents',
    );
    fs.mkdirSync(documentsDirectory, { recursive: true });

    const id = randomUUID();
    const extension = path.extname(file.originalname);
    const storagePath = path.join(
      documentsDirectory,
      `${id}${extension}`,
    );

    const database = this.database.connection;

    try {
      fs.writeFileSync(storagePath, file.buffer);
      const persistDocument = database.transaction(() => {
        this.assertStorageAvailable(userId, fileSize);
        database
          .prepare(
            `
          INSERT INTO documents (
            id,
            user_id,
            original_name,
            storage_path,
            mime_type,
            file_size,
            status,
            extracted_text
          )
          VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)
        `,
          )
          .run(
            id,
            userId,
            file.originalname,
            storagePath,
            file.mimetype || null,
            fileSize,
            processedDocument.extractedText,
          );

        const insertChunk = database.prepare(`
          INSERT INTO document_chunks (
            id,
            document_id,
            chunk_index,
            content,
            page_number
          )
          VALUES (?, ?, ?, ?, ?)
        `);
        processedDocument.chunks.forEach((chunk, chunkIndex) => {
          insertChunk.run(
            randomUUID(),
            id,
            chunkIndex,
            chunk.content,
            chunk.pageNumber,
          );
        });
      });
      persistDocument.immediate();
    } catch (error) {
      fs.rmSync(storagePath, { force: true });
      throw error;
    }

    return this.toResponse(this.findRow(userId, id));
  }

  findAll(userId: string) {
    const rows = this.database.connection
      .prepare(`
        SELECT
          id,
          user_id,
          original_name,
          storage_path,
          mime_type,
          file_size,
          status,
          NULL AS extracted_text,
          error_message,
          created_at,
          updated_at
        FROM documents
        WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .all(userId) as DocumentRow[];

    return rows.map((row) => this.toResponse(row));
  }

  findAllForAdmin() {
    const rows = this.database.connection
      .prepare(`
        SELECT
          documents.id,
          documents.user_id,
          documents.original_name,
          documents.storage_path,
          documents.mime_type,
          documents.file_size,
          documents.status,
          NULL AS extracted_text,
          documents.error_message,
          documents.created_at,
          documents.updated_at,
          users.email AS user_email,
          users.display_name AS user_display_name
        FROM documents
        JOIN users ON users.id = documents.user_id
        ORDER BY documents.created_at DESC
      `)
      .all() as AdminDocumentRow[];

    return rows.map((row) => ({
      id: row.id,
      originalName: row.original_name,
      mimeType: row.mime_type,
      fileSize: row.file_size,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id,
      userEmail: row.user_email,
      userDisplayName: row.user_display_name,
    }));
  }

  findOne(userId: string, id: string) {
    return this.toResponse(this.findRow(userId, id), true);
  }

  update(
    userId: string,
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ) {
    const row = this.findRow(userId, id);

    if (updateDocumentDto.originalName) {
      this.database.connection
        .prepare(`
          UPDATE documents
          SET original_name = ?
          WHERE id = ? AND user_id = ?
        `)
        .run(
          updateDocumentDto.originalName.trim(),
          id,
          userId,
        );
    }

    return this.toResponse(this.findRow(userId, row.id));
  }

  remove(userId: string, id: string) {
    const row = this.findRow(userId, id);
    this.database.connection
      .prepare(`
        DELETE FROM documents
        WHERE id = ? AND user_id = ?
      `)
      .run(id, userId);

    fs.rmSync(row.storage_path, { force: true });

    return { success: true };
  }

  findForDownload(userId: string, id: string) {
    const row = this.findRow(userId, id);

    if (!fs.existsSync(row.storage_path)) {
      throw new NotFoundException('The file is no longer available on disk.');
    }

    return {
      storagePath: row.storage_path,
      originalName: row.original_name,
    };
  }

  findForAdminDownload(id: string) {
    const row = this.database.connection
      .prepare('SELECT * FROM documents WHERE id = ? LIMIT 1')
      .get(id) as DocumentRow | undefined;

    if (!row) {
      throw new NotFoundException('Document not found.');
    }
    if (!fs.existsSync(row.storage_path)) {
      throw new NotFoundException('The file is no longer available on disk.');
    }

    return {
      storagePath: row.storage_path,
      originalName: row.original_name,
    };
  }

  private findRow(userId: string, id: string): DocumentRow {
    const row = this.database.connection
      .prepare(`
        SELECT *
        FROM documents
        WHERE id = ? AND user_id = ?
        LIMIT 1
      `)
      .get(id, userId) as DocumentRow | undefined;

    if (!row) {
      throw new NotFoundException('Document not found.');
    }

    return row;
  }

  private assertStorageAvailable(userId: string, incomingBytes: number): void {
    const usage = this.database.connection
      .prepare(`
        SELECT
          plans.storage_limit_bytes,
          COALESCE(SUM(documents.file_size), 0) AS used_bytes
        FROM users
        JOIN plans ON plans.code = users.plan
        LEFT JOIN documents ON documents.user_id = users.id
        WHERE users.id = ?
        GROUP BY users.id, plans.storage_limit_bytes
        LIMIT 1
      `)
      .get(userId) as UserStorageRow | undefined;

    if (!usage) {
      throw new NotFoundException('User plan not found.');
    }
    if (usage.storage_limit_bytes === null) {
      throw new InternalServerErrorException(
        'The user plan has no configured storage limit.',
      );
    }

    const remainingBytes = Math.max(
      0,
      usage.storage_limit_bytes - usage.used_bytes,
    );
    if (incomingBytes > remainingBytes) {
      throw new PayloadTooLargeException(
        `Storage limit exceeded. ${remainingBytes} bytes remain on your plan, but this file is ${incomingBytes} bytes.`,
      );
    }
  }

  private toResponse(row: DocumentRow, includeExtractedText = false) {
    return {
      id: row.id,
      originalName: row.original_name,
      mimeType: row.mime_type,
      fileSize: row.file_size,
      status: row.status,
      extractedText: includeExtractedText ? row.extracted_text : null,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
