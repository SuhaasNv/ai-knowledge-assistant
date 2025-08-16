// api/src/documents/documents.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import pdf from 'pdf-parse'; // <-- THE ONLY CHANGE IS ON THIS LINE

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

@Processor('file-processing')
export class DocumentsProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
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

    try {
      // 1. Update document status to PROCESSING
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' },
      });

      // 2. Load the PDF from the file path
      const fileBuffer = await fs.readFile(filePath);
      const pdfData = await pdf(fileBuffer); // <-- This line will now work correctly

      // 3. Split the text into manageable chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await textSplitter.splitText(pdfData.text);
      this.logger.log(`Document split into ${chunks.length} chunks.`);

      // 4. Initialize the Google AI Embedding model
      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
        modelName: 'text-embedding-004',
      });

      // 5. Create an embedding for each chunk and save it to the database
      for (const chunk of chunks) {
        const chunkEmbedding = await embeddings.embedQuery(chunk);

        await this.prisma.$executeRaw`
            INSERT INTO "DocumentChunk" (id, content, "embedding", "documentId", "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid(), 
                ${chunk}, 
                ${'[' + chunkEmbedding.join(',') + ']'}::vector, 
                ${documentId}, 
                NOW(), 
                NOW()
            );
        `;
      }

      // 6. Update document status to DONE
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'DONE' },
      });

      this.logger.log(`Successfully processed job ${job.id}.`);
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}`, error);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }
}