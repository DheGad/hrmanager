// @ts-nocheck
import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LlmService } from '../../shared/llm/llm.service';
import { AuditService } from '../audit/audit.service';
import * as puppeteer from 'puppeteer-core';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class HandbookService {
  private readonly logger = new Logger(HandbookService.name);
  private s3Client: S3Client;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private configService: ConfigService,
    private llm: LlmService,
  ) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin_secret',
      },
      forcePathStyle: true,
    });
  }

  async getWizardDefaults(country: string) {
    if (country === 'AU') {
      return { 
        annualLeaveWeeks: 4, 
        personalLeaveWeeks: 2, 
        probationMonths: 6, 
        workingHoursPerWeek: 38,
        noticePeriodWeeks: 4
      };
    }
    // Default to MY (Employment Act 1955)
    return { 
      annualLeaveDays: 8, 
      sickLeaveDays: 14, 
      maternityLeaveDays: 98,
      paternityLeaveDays: 7,
      probationMonths: 3, 
      workingHoursPerWeek: 45,
      noticePeriodWeeks: 4
    };
  }

  async findOne(tenantId: string, id: string) {
    const handbook = await this.prisma.handbookPolicy.findFirst({
      where: { id, tenantId },
    });
    if (!handbook) throw new NotFoundException('Handbook not found');
    return handbook;
  }

  async generateHandbook(tenantId: string, companyId: string, userId: string, dto: any) {
    this.logger.log(`Generating handbook for tenant \${tenantId}`);

    try {
      const prompt = `
        You are an expert HR Lawyer for \${dto.country === 'MY' ? 'Malaysia' : 'Australia'}.
        Generate a comprehensive Employee Handbook based on the following company policies:
        Company Name: \${dto.companyName}
        Industry: \${dto.industry}
        Working Hours per week: \${dto.workingHoursPerWeek}
        Probation Period: \${dto.probationMonths} months
        Annual Leave: \${dto.annualLeaveDays || dto.annualLeaveWeeks + ' weeks'}
        Sick Leave: \${dto.sickLeaveDays || dto.personalLeaveWeeks + ' weeks'}
        
        Format the output in strict Markdown with the following sections:
        1. Welcome & Introduction
        2. Code of Conduct
        3. Working Hours & Attendance
        4. Leave Entitlements
        5. Disciplinary & Termination Policy (Ensure strict compliance with \${dto.country === 'MY' ? 'Employment Act 1955' : 'Fair Work Act 2009'})

        DO NOT include placeholder text. Make it read like a professional legal document.
      `;

      const generatedContent = await this.llm.generateText(prompt);

      const handbook = await this.prisma.handbookPolicy.create({
        data: {
          tenantId,
          companyId,
          name: dto.name || 'Employee Handbook 2024',
          country: dto.country || 'MY',
          version: '1.0',
          policies: dto,
          status: 'DRAFT',
          createdBy: userId,
          // Since there is no 'content' field in the schema, we store it in the JSON
        },
      });

      // To store the markdown, we will update the JSON policies field to include it.
      const updatedPolicies = { ...dto, markdownContent: generatedContent };
      await this.prisma.handbookPolicy.update({
        where: { id: handbook.id },
        data: { policies: updatedPolicies }
      });

      this.auditService.log({
        action: 'HANDBOOK_GENERATED',
        resource: 'HandbookPolicy',
        tenantId,
        userId,
        description: `Generated handbook for \${dto.companyName}`,
      });

      return { ...handbook, markdownContent: generatedContent };
    } catch (error: any) {
      this.logger.error('Failed to generate handbook', error);
      throw new InternalServerErrorException('Failed to generate handbook via AI');
    }
  }

  async exportToPdf(tenantId: string, handbookId: string, htmlContent: string) {
    this.logger.log(`Exporting handbook \${handbookId} to PDF`);
    let browser;
    try {
      // Note: In production Docker, executablePath must point to the installed chromium
      // e.g., '/usr/bin/chromium-browser'
      browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
        printBackground: true,
      });

      const bucket = 'hrmanager';
      const key = `tenant/\${tenantId}/handbooks/\${handbookId}.pdf`;

      await this.s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(pdfBuffer),
        ContentType: 'application/pdf',
      }));

      const pdfUrl = `\${process.env.STORAGE_PUBLIC_URL || 'http://localhost:9000'}/\${bucket}/\${key}`;

      await this.prisma.handbookPolicy.update({
        where: { id: handbookId },
        data: { handbookUrl: pdfUrl, status: 'FINALIZED' }
      });

      return { pdfUrl };
    } catch (error) {
      this.logger.error('Failed to export PDF', error);
      throw new InternalServerErrorException('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
