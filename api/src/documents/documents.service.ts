// api/src/documents/documents.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

// LangChain Imports
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { formatDocumentsAsString } from 'langchain/util/document';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Document } from 'langchain/document';

@Injectable()
export class DocumentsService {
  private embeddings: GoogleGenerativeAIEmbeddings;
  private chatModel: ChatGoogleGenerativeAI;
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('file-processing') private fileQueue: Queue,
    private configService: ConfigService,
  ) {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      modelName: 'text-embedding-004',
    });
    this.chatModel = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      model: 'gemini-1.5-flash-latest',
      temperature: 0.3,
    });
  }

  async findAll() {
    return this.prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) { // <-- Ensures 'id' is defined
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    return document;
  }

  async createAndQueueDocument(file: Express.Multer.File) {
    const document = await this.prisma.document.create({
      data: {
        name: file.originalname,
        status: 'PENDING',
      },
    });
    // For this simple project, we're not storing the random filename.
    // In a production app, you'd save file.filename to the DB to delete it later.
    await this.fileQueue.add('process-pdf', {
      documentId: document.id,
      filePath: file.path,
    });
    return {
      message: 'File uploaded successfully and is now queued for processing.',
      documentId: document.id,
    };
  }

  async remove(id: string) { // <-- Ensures 'id' is defined
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    // Note: The logic to delete the file from disk is complex because we aren't
    // storing the unique filename. For this project, we will just delete the DB record.
    await this.prisma.document.delete({ where: { id } });
    return { message: 'Document deleted successfully.' };
  }

  async removeAll() {
    // Note: Similar to remove(), we are just deleting the DB records.
    // In a production app, you would loop through and delete each file from disk.
    await this.prisma.document.deleteMany();
    return { message: 'All documents deleted successfully.' };
  }

  async getAnswer(documentId: string, question: string) {
    this.logger.log(`Starting chat for document ${documentId}...`);
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document || document.status !== 'DONE') {
      throw new NotFoundException(
        'Document not found or is not yet processed.',
      );
    }

    this.logger.log('Step 1: Embedding the user question...');
    const questionEmbedding = await this.embeddings.embedQuery(question);

    this.logger.log('Step 2: Searching for relevant chunks in the database...');
    const relevantChunks = await this.prisma.$queryRaw<
      { content: string }[]
    >`
      SELECT content
      FROM "DocumentChunk"
      WHERE "documentId" = ${documentId}
      ORDER BY embedding <=> ${'[' + questionEmbedding.join(',') + ']'}::vector
      LIMIT 5;
    `;
    this.logger.log(`Found ${relevantChunks.length} relevant chunks.`);

    const relevantChunksAsDocuments = relevantChunks.map(
      (chunk) => new Document({ pageContent: chunk.content, metadata: {} }),
    );

    const prompt = PromptTemplate.fromTemplate(`
      Answer the user's question based ONLY on the following context.
      If the answer is not in the context, say "I don't have enough information to answer that."

      Context:
      {context}

      Question:
      {question}
    `);

    const chain = RunnableSequence.from([
      {
        context: () => formatDocumentsAsString(relevantChunksAsDocuments),
        question: new RunnablePassthrough(),
      },
      prompt,
      this.chatModel,
      new StringOutputParser(),
    ]);

    this.logger.log('Step 3: Invoking the AI model. This can be the slow part...');
    const answer = await chain.invoke(question);
    this.logger.log('Step 4: AI model returned an answer!');

    return { answer };
  }
}