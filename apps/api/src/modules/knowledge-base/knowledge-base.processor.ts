import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import type { Job as JobType } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { LlmService } from '../../shared/llm/llm.service';
import pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as Tesseract from 'tesseract.js';

@Processor('document-processing')
export class KnowledgeBaseProcessor {
  private readonly logger = new Logger(KnowledgeBaseProcessor.name);

  constructor(
    private prisma: PrismaService,
    private llm: LlmService,
  ) {}

  @Process('process-document')
  async handleProcessDocument(job: JobType) {
    const { documentId, tenantId, fileUrl, mimeType } = job.data;
    this.logger.log(`Processing document \${documentId} for tenant \${tenantId}`);

    try {
      // 1. Mark as processing
      await this.prisma.knowledgeBase.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' },
      });

      // 2. Extract Text from real file
      let rawText = '';
      if (fs.existsSync(fileUrl)) {
        const fileBuffer = fs.readFileSync(fileUrl);
        try {
          const pdfData = await pdfParse(fileBuffer);
          rawText = pdfData.text;
        } catch (e) {
          this.logger.warn('pdf-parse failed, attempting OCR with tesseract...');
          const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
          rawText = text;
        }
      } else {
        throw new Error(`File not found: \${fileUrl}`);
      }

      if (!rawText.trim()) {
        this.logger.warn('Extracted text is empty, attempting OCR with tesseract...');
        const { data: { text } } = await Tesseract.recognize(fs.readFileSync(fileUrl), 'eng');
        rawText = text;
      }

      // 3. Chunk Text
      const chunks = this.chunkText(rawText, 512, 50);

      // 4. Generate Embeddings & Extract Metadata
      let chunkIndex = 0;
      for (const chunk of chunks) {
        // Extract metadata for this chunk using LLM
        let meta = { page: null, section: null, clause: null };
        try {
          const metaJson = await this.llm.generateText(
            chunk,
            'Extract the following metadata from this legal text excerpt as JSON: { "page": number | null, "section": string | null, "clause": string | null }. If not found, return null for that field. Return ONLY valid JSON.'
          );
          meta = JSON.parse(metaJson);
        } catch (e) {}

        const embedding = await this.llm.generateEmbedding(chunk);

        await this.prisma.$executeRaw`
          INSERT INTO document_chunks (
            id, knowledge_base_id, tenant_id, chunk_index, content, 
            content_tokens, page_number, section_title, metadata, embedding, created_at
          ) VALUES (
            gen_random_uuid(), \${documentId}, \${tenantId}, \${chunkIndex}, \${chunk}, 
            \${Math.ceil(chunk.length / 4)}, \${meta.page}, \${meta.clause || meta.section}, 
            \${JSON.stringify({ documentType: mimeType, version: '1.0' })}, \${embedding}::vector, NOW()
          )
        `;
        
        chunkIndex++;
      }

      // 5. Mark as Ready
      await this.prisma.knowledgeBase.update({
        where: { id: documentId },
        data: { 
          status: 'READY', 
          chunkCount: chunks.length,
          processedAt: new Date()
        },
      });

      this.logger.log(`Successfully processed document \${documentId}`);

    } catch (error: any) {
      this.logger.error(`Failed to process document \${documentId}`, error.stack);
      await this.prisma.knowledgeBase.update({
        where: { id: documentId },
        data: { 
          status: 'ERROR', 
          errorMessage: error.message 
        },
      });
      throw error;
    }
  }

  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const words = text.split(/\\s+/);
    const chunks: string[] = [];
    
    let i = 0;
    while (i < words.length) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
      i += (chunkSize - overlap);
    }
    
    return chunks;
  }


}
