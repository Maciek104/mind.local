
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { SetupService } from './setup.service.js';
import { InitializeSetupDto } from './dto/initialize-setup.dto.js';
import { Public } from '../auth/public.decorator.js';

@Controller('setup')
export class SetupController {
  constructor(
    private readonly setupService: SetupService,
  ) {}

  @Get('status')
  @Public()
  getStatus() {
    return this.setupService.getStatus();
  }

  @Post('initialize')
  @Public()
  initialize(@Body() dto: InitializeSetupDto) {
    return this.setupService.initialize(dto);
  }
}
