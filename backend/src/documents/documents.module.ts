import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { DocumentsController } from './documents.controller.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, AdminGuard],
})
export class DocumentsModule {}
