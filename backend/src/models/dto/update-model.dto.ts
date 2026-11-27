import { PartialType } from '@nestjs/mapped-types';
import { CreateModelDto } from './create-model.dto.js';

export class UpdateModelDto extends PartialType(CreateModelDto) {}
