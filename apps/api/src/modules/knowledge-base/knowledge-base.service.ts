// @ts-nocheck
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('document-processing') private documentQueue: Queue,
  ) {}

  async uploadDocument(tenantId: string, file: any, dto: any) {
    const fileUrl = file ? file.path : `uploads/\${Date.now()}-mock.pdf`;
    const mimeType = file?.mimetype || 'application/pdf';
    const fileSize = file?.size || 1024;

    const doc = await this.prisma.knowledgeBase.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type || 'CUSTOM',
        country: dto.country || 'MY',
        status: 'PENDING',
        fileUrl,
        fileSize,
        mimeType,
        chunkCount: 0,
      },
    });

    // Queue document for text extraction and embedding generation
    await this.documentQueue.add('process-document', {
      documentId: doc.id,
      tenantId: doc.tenantId,
      fileUrl: doc.fileUrl,
      mimeType: doc.mimeType,
    });

    this.logger.log(`Queued document \${doc.id} for processing`);

    return doc;
  }

  async findAll(tenantId: string, options: any) {
    const skip = Number(options.skip || 0);
    const limit = Number(options.limit || 10);
    const page = Number(options.page || 1);

    const [data, total] = await Promise.all([
      this.prisma.knowledgeBase.findMany({
        where: { OR: [{ tenantId }, { isSystemDocument: true }] },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.knowledgeBase.count({ 
        where: { OR: [{ tenantId }, { isSystemDocument: true }] } 
      }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async getStatus(tenantId: string, id: string) {
    const doc = await this.prisma.knowledgeBase.findFirst({
      where: { id, tenantId },
      select: { id: true, status: true, chunkCount: true, errorMessage: true }
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
}
