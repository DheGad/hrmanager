// @ts-nocheck
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as handlebars from 'handlebars';

@Injectable()
export class DocumentEngineService {
  private readonly logger = new Logger(DocumentEngineService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Compiles a template using Handlebars and given payload
   */
  async generateDocumentHtml(tenantId: string, templateType: any, payload: Record<string, any>): Promise<string> {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { tenantId, type: templateType, isActive: true },
      orderBy: { version: 'desc' }
    });

    if (!template) {
      throw new NotFoundException(`Active template not found for type \${templateType}`);
    }

    // Validate variables
    const requiredVars = template.variables as string[];
    if (requiredVars && Array.isArray(requiredVars)) {
      const missing = requiredVars.filter(v => !(v in payload));
      if (missing.length > 0) {
        throw new BadRequestException(`Missing required variables: \${missing.join(', ')}`);
      }
    }

    try {
      const compiledTemplate = handlebars.compile(template.content);
      return compiledTemplate(payload);
    } catch (e) {
      this.logger.error('Template compilation failed', e);
      throw new Error('Failed to compile document template');
    }
  }

  /**
   * Creates a formal Document record in DRAFT status after generation
   */
  async createDocumentRecord(tenantId: string, companyId: string, employeeId: string | null, type: any, title: string, htmlContent: string, userId: string) {
    // In a real system, we would dispatch the HTML to the BullMQ pdf-generation worker here.
    // The worker would run Puppeteer, upload the PDF to MinIO, and update the Document with the pdfUrl.
    
    const doc = await this.prisma.document.create({
      data: {
        tenantId,
        companyId,
        employeeId,
        type,
        title,
        status: 'DRAFT',
        templateData: { compiledHtml: htmlContent }, // Storing generated HTML temporarily
        generatedBy: userId
      }
    });

    this.auditService.log({
      action: 'DOCUMENT_GENERATION_STARTED',
      resource: 'Document',
      resourceId: doc.id,
      tenantId,
      userId,
      description: `Started generation of \${type} document`
    });

    return doc;
  }
}
