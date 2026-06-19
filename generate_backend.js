const fs = require('fs');
const path = require('path');

const API_SRC = '/Users/DEERU/.gemini/antigravity/scratch/hrmanager4u/apps/api/src';

function writeFile(filePath, content) {
  const fullPath = path.join(API_SRC, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Created: ${filePath}`);
}

// -----------------------------------------------------------------------------
// MODULES: TENANT (finish)
// -----------------------------------------------------------------------------
writeFile('modules/tenant/tenant.controller.ts', `
import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Tenants')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'tenants' })
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get tenant details' })
  findOne(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Update tenant details' })
  update(@Param('id') id: string, @Body() updateTenantDto: any) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Get(':id/stats')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Get tenant statistics' })
  getStats(@Param('id') id: string) {
    return this.tenantService.getStats(id);
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: COMPANY
// -----------------------------------------------------------------------------
writeFile('modules/company/company.module.ts', `
import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
`);

writeFile('modules/company/company.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: any) {
    return this.prisma.company.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string, options: any) {
    const { skip, limit } = options;
    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where: { tenantId, isActive: true },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where: { tenantId, isActive: true } }),
    ]);
    return { data, meta: { total, page: options.page, limit } };
  }

  async findOne(tenantId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId },
      include: { branches: true, departments: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id); // verify ownership
    return this.prisma.company.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
`);

writeFile('modules/company/company.controller.ts', `
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Companies')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'companies' })
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN)
  create(@CurrentTenant() tenantId: string, @Body() createCompanyDto: any) {
    return this.companyService.create(tenantId, createCompanyDto);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.companyService.findAll(tenantId, { skip: 0, limit: 10, page: 1, ...query });
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.companyService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() updateCompanyDto: any) {
    return this.companyService.update(tenantId, id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.companyService.delete(tenantId, id);
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: EMPLOYEE
// -----------------------------------------------------------------------------
writeFile('modules/employee/employee.module.ts', `
import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

@Module({
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
`);

writeFile('modules/employee/employee.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, companyId: string, dto: any) {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const employeeNumber = \`EMP-\${new Date().getFullYear()}-\${String(count + 1).padStart(5, '0')}\`;
    
    return this.prisma.employee.create({
      data: {
        ...dto,
        tenantId,
        companyId,
        employeeNumber,
        noticePeriodDays: dto.noticePeriodDays || 30,
      },
    });
  }

  async findAll(tenantId: string, options: any) {
    const { skip, limit } = options;
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId },
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page: options.page, limit } };
  }

  async findOne(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: { contracts: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.employee.update({
      where: { id },
      data: dto,
    });
  }

  async terminate(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        employmentStatus: 'TERMINATED',
        terminationDate: dto.terminationDate,
      },
    });
  }
}
`);

writeFile('modules/employee/employee.controller.ts', `
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Employees')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'employees' })
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  create(@CurrentTenant() tenantId: string, @Body() createDto: any) {
    return this.employeeService.create(tenantId, createDto.companyId, createDto);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.employeeService.findAll(tenantId, { skip: 0, limit: 10, page: 1, ...query });
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeeService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() updateDto: any) {
    return this.employeeService.update(tenantId, id, updateDto);
  }

  @Post(':id/terminate')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  terminate(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() terminateDto: any) {
    return this.employeeService.terminate(tenantId, id, terminateDto);
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: DOCUMENT
// -----------------------------------------------------------------------------
writeFile('modules/document/document.module.ts', `
import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  providers: [DocumentService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
`);

writeFile('modules/document/document.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async generateDocument(tenantId: string, dto: any) {
    // Placeholder for real generation
    return this.prisma.document.create({
      data: {
        ...dto,
        tenantId,
        status: 'GENERATED',
        pdfUrl: \`https://cdn.hrmanager4u.ai/tenant/\${tenantId}/docs/\${uuidv4()}.pdf\`,
      },
    });
  }

  async findAll(tenantId: string, options: any) {
    const { skip, limit } = options;
    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where: { tenantId },
        skip,
        take: limit,
      }),
      this.prisma.document.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page: options.page, limit } };
  }

  async findOne(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }
}
`);

writeFile('modules/document/document.controller.ts', `
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Documents')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'documents' })
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('generate')
  generate(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return this.documentService.generateDocument(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.documentService.findAll(tenantId, { skip: 0, limit: 10, page: 1, ...query });
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.documentService.findOne(tenantId, id);
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: KNOWLEDGE BASE
// -----------------------------------------------------------------------------
writeFile('modules/knowledge-base/knowledge-base.module.ts', `
import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';

@Module({
  providers: [KnowledgeBaseService],
  controllers: [KnowledgeBaseController],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
`);

writeFile('modules/knowledge-base/knowledge-base.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class KnowledgeBaseService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument(tenantId: string, file: any, dto: any) {
    return this.prisma.knowledgeBase.create({
      data: {
        ...dto,
        tenantId,
        status: 'PROCESSING',
        fileUrl: 's3://...',
        fileSize: 1024,
        mimeType: 'application/pdf',
        chunkCount: 0,
      },
    });
  }

  async findAll(tenantId: string, options: any) {
    const { skip, limit } = options;
    const [data, total] = await Promise.all([
      this.prisma.knowledgeBase.findMany({
        where: { OR: [{ tenantId }, { isSystemDocument: true }] },
        skip,
        take: limit,
      }),
      this.prisma.knowledgeBase.count({ 
        where: { OR: [{ tenantId }, { isSystemDocument: true }] } 
      }),
    ]);
    return { data, meta: { total, page: options.page, limit } };
  }
}
`);

writeFile('modules/knowledge-base/knowledge-base.controller.ts', `
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Knowledge Base')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'knowledge-base' })
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Post('upload')
  upload(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return this.kbService.uploadDocument(tenantId, null, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.kbService.findAll(tenantId, { skip: 0, limit: 10, page: 1, ...query });
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: AI ASSISTANT
// -----------------------------------------------------------------------------
writeFile('modules/ai-assistant/ai-assistant.module.ts', `
import { Module } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';

@Module({
  providers: [AiAssistantService],
  controllers: [AiAssistantController],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
`);

writeFile('modules/ai-assistant/ai-assistant.service.ts', `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiAssistantService {
  constructor(private prisma: PrismaService) {}

  async createConversation(tenantId: string, userId: string, title?: string) {
    return this.prisma.aiConversation.create({
      data: { tenantId, userId, title: title || 'New Conversation' },
    });
  }

  async getConversations(tenantId: string, userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { tenantId, userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async *queryStream(tenantId: string, userId: string, conversationId: string, question: string) {
    // Save user message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        tenantId,
        userId,
        role: 'USER',
        content: question,
      },
    });

    // Mock streaming response
    const chunks = question.split(' ');
    let fullResponse = '';
    
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 100));
      fullResponse += chunk + ' ';
      yield { data: JSON.stringify({ type: 'content', content: chunk + ' ' }) };
    }

    // Save AI message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        tenantId,
        userId,
        role: 'ASSISTANT',
        content: fullResponse.trim(),
        citations: [{ sourceName: 'Employment Act 1955', clause: 'Section 60', similarity: 0.95 }],
      },
    });

    yield { data: JSON.stringify({ type: 'done' }) };
  }
}
`);

writeFile('modules/ai-assistant/ai-assistant.controller.ts', `
import { Controller, Get, Post, Body, Param, Req, Sse, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('AI Assistant')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'ai' })
export class AiAssistantController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Post('conversations')
  createConversation(@CurrentTenant() tenantId: string, @Req() req: any, @Body() dto: any) {
    return this.aiService.createConversation(tenantId, req.user.id, dto.title);
  }

  @Get('conversations')
  getConversations(@CurrentTenant() tenantId: string, @Req() req: any) {
    return this.aiService.getConversations(tenantId, req.user.id);
  }

  @Sse('conversations/:id/stream')
  streamResponse(
    @CurrentTenant() tenantId: string,
    @Req() req: any,
    @Param('id') conversationId: string,
    @Query('question') question: string,
  ) {
    return this.aiService.queryStream(tenantId, req.user.id, conversationId, question);
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: HANDBOOK
// -----------------------------------------------------------------------------
writeFile('modules/handbook/handbook.module.ts', `
import { Module } from '@nestjs/common';
import { HandbookService } from './handbook.service';
import { HandbookController } from './handbook.controller';

@Module({
  providers: [HandbookService],
  controllers: [HandbookController],
  exports: [HandbookService],
})
export class HandbookModule {}
`);

writeFile('modules/handbook/handbook.service.ts', `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HandbookService {
  constructor(private prisma: PrismaService) {}

  async createDraft(tenantId: string, companyId: string, userId: string, dto: any) {
    return this.prisma.handbookPolicy.create({
      data: {
        tenantId,
        companyId,
        name: dto.name,
        country: dto.country,
        version: '1.0',
        policies: dto,
        status: 'DRAFT',
        createdBy: userId,
      },
    });
  }

  async getWizardDefaults(country: string) {
    if (country === 'AU') {
      return { annualLeaveWeeks: 4, personalLeaveWeeks: 2, probationMonths: 6, workingHoursPerWeek: 38 };
    }
    // Default to MY
    return { annualLeaveDays: 8, sickLeaveDays: 14, probationMonths: 3, workingHoursPerWeek: 45 };
  }
}
`);

writeFile('modules/handbook/handbook.controller.ts', `
import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HandbookService } from './handbook.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Handbook')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'handbooks' })
export class HandbookController {
  constructor(private readonly handbookService: HandbookService) {}

  @Post('wizard')
  createDraft(@CurrentTenant() tenantId: string, @Req() req: any, @Body() dto: any) {
    return this.handbookService.createDraft(tenantId, dto.companyId, req.user.id, dto);
  }

  @Get('defaults/:country')
  getDefaults(@Param('country') country: string) {
    return this.handbookService.getWizardDefaults(country);
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: COMPLIANCE
// -----------------------------------------------------------------------------
writeFile('modules/compliance/compliance.module.ts', `
import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';

@Module({
  providers: [ComplianceService],
  controllers: [ComplianceController],
  exports: [ComplianceService],
})
export class ComplianceModule {}
`);

writeFile('modules/compliance/compliance.service.ts', `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async calculateScore(tenantId: string, companyId: string, userId: string) {
    // Mock score calculation
    const score = 85;
    const riskLevel = score >= 90 ? 'LOW' : score >= 70 ? 'MEDIUM' : score >= 50 ? 'HIGH' : 'CRITICAL';
    
    return this.prisma.complianceRecord.create({
      data: {
        tenantId,
        companyId,
        score,
        riskLevel,
        checklist: [],
        missingPolicies: ['Code of Conduct'],
        createdBy: userId,
        assessedAt: new Date(),
      },
    });
  }

  async getLatestScore(tenantId: string, companyId: string) {
    return this.prisma.complianceRecord.findFirst({
      where: { tenantId, companyId },
      orderBy: { assessedAt: 'desc' },
    });
  }
}
`);

writeFile('modules/compliance/compliance.controller.ts', `
import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Compliance')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'compliance' })
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post(':companyId/assess')
  assess(@CurrentTenant() tenantId: string, @Req() req: any, @Param('companyId') companyId: string) {
    return this.complianceService.calculateScore(tenantId, companyId, req.user.id);
  }

  @Get(':companyId/score')
  getScore(@CurrentTenant() tenantId: string, @Param('companyId') companyId: string) {
    return this.complianceService.getLatestScore(tenantId, companyId);
  }
}
`);

// -----------------------------------------------------------------------------
// MODULES: AUDIT
// -----------------------------------------------------------------------------
writeFile('modules/audit/audit.module.ts', `
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global()
@Module({
  providers: [
    AuditService,
    {
      provide: 'AUDIT_SERVICE_TOKEN',
      useExisting: AuditService,
    },
  ],
  controllers: [AuditController],
  exports: [AuditService, 'AUDIT_SERVICE_TOKEN'],
})
export class AuditModule {}
`);

writeFile('modules/audit/audit.service.ts', `
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  log(entry: any): void {
    // Non-blocking fire and forget
    setImmediate(async () => {
      try {
        await this.prisma.auditLog.create({
          data: {
            ...entry,
            severity: entry.severity || 'INFO',
          },
        });
      } catch (error) {
        this.logger.error('Failed to write audit log', error);
      }
    });
  }

  async findAll(tenantId: string, options: any) {
    const { skip, limit } = options;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page: options.page, limit } };
  }
}
`);

writeFile('modules/audit/audit.controller.ts', `
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Audit')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'audit' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.AUDITOR)
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.auditService.findAll(tenantId, { skip: 0, limit: 20, page: 1, ...query });
  }
}
`);
