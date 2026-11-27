import { Module } from '@nestjs/common';
import { PlanService } from './plan.service.js';
import { PlanController } from './plan.controller.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Module({
  controllers: [PlanController],
  providers: [PlanService, AdminGuard],
})
export class PlanModule {}
