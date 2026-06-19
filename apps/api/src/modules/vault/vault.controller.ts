import { Controller, Get, Param, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VaultService } from './vault.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Vault')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1', path: 'vault' })
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get(':employeeId/files/:fileId/presigned-url')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE)
  getPresignedUrl(
    @CurrentTenant() tenantId: string,
    @Param('employeeId') employeeId: string,
    @Param('fileId') fileId: string,
    @Req() req: any
  ) {
    if (req.user.role === Role.EMPLOYEE && req.user.employeeId !== employeeId) {
      throw new UnauthorizedException('You can only access your own files');
    }
    return this.vaultService.getPresignedUrl(tenantId, employeeId, fileId, req.user.sub);
  }

  @Post(':employeeId/files')
  @Roles(Role.COMPANY_ADMIN, Role.HR_MANAGER)
  recordFileUpload(
    @CurrentTenant() tenantId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: any,
    @Req() req: any
  ) {
    return this.vaultService.recordFileUpload(
      tenantId,
      employeeId,
      dto.category,
      dto.title,
      dto.fileUrl,
      dto.fileSize,
      dto.mimeType,
      dto.isEncrypted || false,
      req.user.sub
    );
  }
}
