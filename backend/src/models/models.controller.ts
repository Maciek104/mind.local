import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { ModelsService } from './models.service.js';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  findAll() {
    return this.modelsService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.modelsService.findOne(name);
  }

  @Post('sync')
  @UseGuards(AdminGuard)
  syncFromOllama() {
    return this.modelsService.syncFromOllama();
  }
}
