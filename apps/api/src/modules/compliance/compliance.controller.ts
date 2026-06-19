// @ts-nocheck
import { Controller, Get, Post, Param, Req, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Compliance')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'compliance' })
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post(':companyId/assess')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.AUDITOR)
  assess(@CurrentTenant() tenantId: string, @Req() req: any, @Param('companyId') companyId: string) {
    return this.complianceService.calculateScore(tenantId, companyId, req.user.userId);
  }

  @Get(':companyId/score')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.AUDITOR, Role.SUPER_ADMIN)
  getScore(@CurrentTenant() tenantId: string, @Param('companyId') companyId: string) {
    return this.complianceService.getLatestScore(tenantId, companyId);
  }

  @Post('analyze')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.AUDITOR)
  analyze(@CurrentTenant() tenantId: string, @Req() req: any, @Body() dto: any) {
    return this.complianceService.analyze(tenantId, dto.country, dto.documents);
  }
}
