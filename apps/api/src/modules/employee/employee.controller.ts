// @ts-nocheck
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
