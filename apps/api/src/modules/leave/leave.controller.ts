// @ts-nocheck
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Leaves')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'leaves' })
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.SUPER_ADMIN)
  create(@CurrentTenant() tenantId: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.leaveService.requestLeave(
      tenantId,
      dto.employeeId || user.userId,
      dto.leaveTypeId,
      dto.days,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.reason
    );
  }

  /** Returns available leave types for this tenant */
  @Get('types')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.SUPER_ADMIN)
  findTypes(@CurrentTenant() tenantId: string) {
    return this.leaveService.findTypes(tenantId);
  }

  /** Seeds default Malaysian leave types (call once during tenant setup) */
  @Post('types/seed')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN)
  seedTypes(@CurrentTenant() tenantId: string) {
    return this.leaveService.seedDefaultTypes(tenantId);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.SUPER_ADMIN)
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.leaveService.findAll(tenantId, { page: 1, limit: 10, ...query });
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.SUPER_ADMIN)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.leaveService.findOne(tenantId, id);
  }

  @Patch(':id/approve')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN)
  approve(@CurrentTenant() tenantId: string, @CurrentUser() user: any, @Param('id') id: string) {
    return this.leaveService.approveLeave(tenantId, user.userId, id);
  }

  @Patch(':id/reject')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.SUPER_ADMIN)
  reject(@CurrentTenant() tenantId: string, @CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.leaveService.rejectLeave(tenantId, user.userId, id, dto.reason);
  }
}
