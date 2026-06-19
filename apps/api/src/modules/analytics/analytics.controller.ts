// @ts-nocheck
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'analytics' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN)
  getDashboard(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getDashboardMetrics(tenantId);
  }

  @Get('metrics')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN)
  getMetrics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getAnalyticsData(tenantId);
  }

  @Get('pending-approvals')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN)
  getPendingApprovals(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getPendingApprovals(tenantId);
  }
}
