import { Controller, Get, Put, Post, Body, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ControlCenterService } from './control-center.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Controller('control-center')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
export class ControlCenterController {
  constructor(
    private readonly controlCenterService: ControlCenterService,
    private readonly configService: ConfigService,
  ) {}

  private checkFeatureFlag() {
    const enabled = this.configService.get<string>('ENABLE_CONTROL_CENTER') === 'true';
    if (!enabled) {
      throw new NotFoundException('Control Center is disabled');
    }
  }

  @Get('config')
  async getConfig(@Req() req: any) {
    this.checkFeatureFlag();
    // Super admin gets global config, Company Admin gets tenant config
    const tenantId = req.user.role === Role.SUPER_ADMIN ? null : req.user.tenantId;
    return this.controlCenterService.getConfig(tenantId);
  }

  @Put('config')
  async updateConfig(@Req() req: any, @Body() body: { category: string, config: Record<string, string> }) {
    this.checkFeatureFlag();
    const tenantId = req.user.role === Role.SUPER_ADMIN ? null : req.user.tenantId;
    await this.controlCenterService.updateConfig(body.category, body.config, tenantId, req.user.id);
    return { success: true };
  }

  @Post('test/ai')
  async testAiConnection() {
    this.checkFeatureFlag();
    return this.controlCenterService.testAiConnection();
  }

  @Get('health')
  async getHealth() {
    this.checkFeatureFlag();
    return this.controlCenterService.getHealth();
  }

  @Get('costs')
  @Roles(Role.SUPER_ADMIN)
  async getCosts() {
    this.checkFeatureFlag();
    return this.controlCenterService.getCosts();
  }
}
