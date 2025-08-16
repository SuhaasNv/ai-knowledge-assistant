// api/src/documents/documents.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { EventsGateway } from '../events/events.gateway'; // <-- Import Gateway

@Processor('file-processing')
export class DocumentsProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventsGateway: EventsGateway, // <-- Inject Gateway
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    if (job.name === 'process-pdf') {
      await this.handlePdfProcessing(job);
    }
  }

  async handlePdfProcessing(job: Job<any>) {
    this.logger.log(`Starting processing for job ${job.id}...`);
    const { documentId, filePath } = job.data;

    const updateProgress = async (progress: number, status: 'PROCESSING' | 'DONE' | 'FAILED') => {
      await job.updateProgress(progress);
      await this.prisma.document.update({ where: { id: documentId }, data: { status, progress } });
      this.eventsGateway.sendToAll('documentUpdate', { id: documentId, status, progress });
    };

    try {
      await updateProgress(5, 'PROCESSING');
      
      const fileBuffer = await fs.readFile(filePath);
      await updateProgress(10, 'PROCESSING');

      const pdfData = await pdf(fileBuffer);
      await updateProgress(20, 'PROCESSING');
      
      const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
      const chunks = await textSplitter.splitText(pdfData.text);
      this.logger.log(`Document split into ${chunks.length} chunks.`);
      await updateProgress(30, 'PROCESSING');

      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
        modelName: 'text-embedding-004',
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkEmbedding = await embeddings.embedQuery(chunk);
        
        await this.prisma.$executeRaw`
            INSERT INTO "DocumentChunk" (id, content, "embedding", "documentId", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${chunk}, ${'[' + chunkEmbedding.join(',') + ']'}::vector, ${documentId}, NOW(), NOW());
        `;
        
        // Update progress after each chunk is embedded (from 30% to 95%)
        const progress = 30 + Math.floor((i + 1) / chunks.length * 65);
        await updateProgress(progress, 'PROCESSING');
      }

      await updateProgress(100, 'DONE');
      this.logger.log(`Successfully processed job ${job.id}.`);
      
      // Also delete the file from the uploads folder after processing is complete
      await fs.unlink(filePath);

    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}`, error);
      await updateProgress(100, 'FAILED');
      throw error;
    }
  }
}