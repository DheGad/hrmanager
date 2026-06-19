import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { HandbookService } from './handbook.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller({ version: '1', path: 'handbooks' })
export class HandbookController {
  constructor(private readonly handbookService: HandbookService) {}

  @Get('defaults')
  async getDefaults(@Query('country') country: string) {
    return this.handbookService.getWizardDefaults(country);
  }

  @Post('generate')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  async generateHandbook(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: any
  ) {
    const companyId = dto.companyId || 'default-company';
    return this.handbookService.generateHandbook(tenantId, companyId, user.userId, dto);
  }

  @Post(':id/export')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  async exportPdf(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('htmlContent') htmlContent: string
  ) {
    return this.handbookService.exportToPdf(tenantId, id, htmlContent);
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  async getHandbook(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.handbookService.findOne(tenantId, id);
  }
}
