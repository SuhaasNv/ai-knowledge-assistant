// api/src/documents/documents.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Body,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { ChatDto } from './dto/chat.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.documentsService.createAndQueueDocument(file);
  }

  @Post(':id/chat')
  async chatWithDocument(
    @Param('id') id: string,
    @Body() chatDto: ChatDto,
  ) {
    return this.documentsService.getAnswer(id, chatDto.question);
  }

  @Delete()
  async removeAll() {
    return this.documentsService.removeAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}