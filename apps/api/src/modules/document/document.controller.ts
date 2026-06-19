import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Documents')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'documents' })
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('generate')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  generate(@CurrentTenant() tenantId: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.documentService.generateDocument(tenantId, user.userId, dto);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.documentService.findAll(tenantId, { skip: 0, limit: 10, page: 1, ...query });
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.documentService.findOne(tenantId, id);
  }
}
