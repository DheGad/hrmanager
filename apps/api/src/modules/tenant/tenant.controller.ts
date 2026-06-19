// @ts-nocheck
import { Controller, Get, Patch, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== Role.SUPER_ADMIN && user.tenantId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.tenantService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Update tenant details' })
  update(@Param('id') id: string, @Body() updateTenantDto: any, @CurrentUser() user: any) {
    if (user.role !== Role.SUPER_ADMIN && user.tenantId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.tenantService.update(id, updateTenantDto);
  }

  @Get(':id/stats')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Get tenant statistics' })
  getStats(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== Role.SUPER_ADMIN && user.tenantId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.tenantService.getStats(id);
  }
}
