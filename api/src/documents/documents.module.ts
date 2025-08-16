// api/src/documents/documents.module.ts
import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { DocumentsProcessor } from './documents.processor';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'file-processing',
    }),
    EventsModule,
    // The MulterModule has been removed from here
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsProcessor],
})
export class DocumentsModule {}