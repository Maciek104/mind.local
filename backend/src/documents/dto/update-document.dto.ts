import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto.js';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalName?: string;
}
