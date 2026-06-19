// @ts-nocheck
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
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.AUDITOR, Role.HR_MANAGER)
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.auditService.findAll(tenantId, { page: 1, limit: 25, ...query });
  }

  /** Alias for useDashboard hook — returns last N audit events */
  @Get('recent')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.AUDITOR, Role.HR_MANAGER)
  findRecent(@CurrentTenant() tenantId: string, @Query('limit') limit?: string) {
    const take = parseInt(limit || '10', 10);
    return this.auditService.findAll(tenantId, { page: 1, limit: take });
  }
}
