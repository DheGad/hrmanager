import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LifecycleService } from './lifecycle.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Lifecycle')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'lifecycle' })
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  @Get(':employeeId')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  getEvents(@CurrentTenant() tenantId: string, @Param('employeeId') employeeId: string) {
    return this.lifecycleService.getTimeline(tenantId, employeeId);
  }

  @Post(':employeeId/transition')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  transitionStatus(
    @CurrentTenant() tenantId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: any,
    @Req() req: any
  ) {
    return this.lifecycleService.transitionStatus(
      tenantId,
      employeeId,
      dto.newStatus,
      dto.reason,
      req.user.userId
    );
  }
}
