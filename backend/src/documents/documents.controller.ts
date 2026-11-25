import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import 'multer';
import { DocumentsService } from './documents.service.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  upload(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Nie przesłano pliku');
    }

    return this.documentsService.create(request.user.id, file);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.documentsService.findAll(request.user.id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const document = this.documentsService.findForDownload(
      request.user.id,
      id,
    );

    response.download(document.storagePath, document.originalName);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.documentsService.findOne(request.user.id, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(
      request.user.id,
      id,
      updateDocumentDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.documentsService.remove(request.user.id, id);
  }
}
