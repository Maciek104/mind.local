import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { DocumentsController } from './documents.controller.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { DocumentProcessor } from './document-processor.service.js';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentProcessor, AdminGuard],
})
export class DocumentsModule {}
