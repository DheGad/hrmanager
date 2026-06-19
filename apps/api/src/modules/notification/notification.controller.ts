// @ts-nocheck
import { Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'notifications' })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.SUPER_ADMIN)
  findAll(@CurrentTenant() tenantId: string, @CurrentUser() user: any) {
    return this.notificationService.findAll(tenantId, user?.userId);
  }

  @Patch(':id/read')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.SUPER_ADMIN)
  markRead(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.notificationService.markRead(tenantId, id);
  }

  @Post('mark-all-read')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.SUPER_ADMIN)
  markAllRead(@CurrentTenant() tenantId: string, @CurrentUser() user: any) {
    return this.notificationService.markAllRead(tenantId, user?.userId);
  }
}
