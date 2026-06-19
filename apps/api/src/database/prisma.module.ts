import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule
 *
 * Marked as @Global so every module in the application can inject PrismaService
 * without needing to import PrismaModule explicitly. This is intentional —
 * database access is infrastructure-level and ubiquitous.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
