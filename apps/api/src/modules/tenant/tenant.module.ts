// =============================================================================
// Tenant Module
// Provides TenantService + TenantController for tenant management operations.
// This module is global — PrismaModule and RedisModule are already global.
// =============================================================================

import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';

@Module({
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
