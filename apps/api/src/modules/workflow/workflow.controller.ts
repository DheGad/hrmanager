// @ts-nocheck
import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Workflows')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'workflows' })
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.MANAGER)
  async startWorkflow(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: any
  ) {
    return this.workflowService.startWorkflow(
      tenantId,
      dto.type,
      dto.targetResource,
      dto.targetId,
      user.userId
    );
  }

  @Get('pending')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.MANAGER, Role.SUPER_ADMIN)
  async getPendingWorkflows(@CurrentTenant() tenantId: string) {
    return this.workflowService.getPendingWorkflows(tenantId);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.MANAGER, Role.SUPER_ADMIN)
  async getWorkflows(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.workflowService.getWorkflows(tenantId, query);
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.MANAGER, Role.SUPER_ADMIN)
  async getWorkflow(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.workflowService.getWorkflow(tenantId, id);
  }

  @Post(':id/approve')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.MANAGER)
  async approveWorkflow(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: any
  ) {
    return this.workflowService.approveStep(tenantId, id, user.userId, dto.comments);
  }

  @Post(':id/reject')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.MANAGER)
  async rejectWorkflow(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: any
  ) {
    return this.workflowService.rejectStep(tenantId, id, user.userId, dto.comments);
  }
}
