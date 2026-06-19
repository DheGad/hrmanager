// @ts-nocheck
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Departments')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'departments' })
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  findAll(@CurrentTenant() tenantId: string) {
    return this.departmentService.findAll(tenantId);
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.departmentService.findOne(tenantId, id);
  }

  @Post()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    // Get companyId from body or derive from tenant's default company
    return this.departmentService.create(tenantId, dto.companyId, dto);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.departmentService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.departmentService.remove(tenantId, id);
  }
}
