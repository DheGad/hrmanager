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
