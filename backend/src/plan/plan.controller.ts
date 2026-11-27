import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { PlanService } from './plan.service.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  findAll() {
    return this.planService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.planService.findOne(code);
  }

  @Patch(':code')
  @UseGuards(AdminGuard)
  update(
    @Param('code') code: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planService.update(code, updatePlanDto);
  }
}
