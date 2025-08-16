// api/src/documents/documents.module.ts
import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { DocumentsProcessor } from './documents.processor';
import { MulterModule } from '@nestjs/platform-express'; // <-- NEW IMPORT

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'file-processing',
    }),
    // Add this MulterModule configuration
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsProcessor],
})
export class DocumentsModule {}