import { Module } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { ModelsService } from './models.service.js';
import { ModelsController } from './models.controller.js';

@Module({
  controllers: [ModelsController],
  providers: [ModelsService, AdminGuard],
})
export class ModelsModule {}
