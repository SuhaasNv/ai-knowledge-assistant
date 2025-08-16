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
import { diskStorage } from 'multer'; // <-- NEW IMPORT
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
  @UseInterceptors(
    FileInterceptor('file', {
      // Add the explicit storage configuration back here
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}-${file.originalname}`);
        },
      }),
    }),
  )
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