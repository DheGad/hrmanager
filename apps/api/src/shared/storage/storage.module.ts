import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';

/**
 * StorageModule — Global infrastructure module.
 *
 * Provides a single, application-scoped StorageService backed by the AWS SDK v3.
 * Configured for S3-compatible storage (AWS S3 in production, MinIO in
 * development) via the STORAGE_* environment variables surfaced through
 * ConfigService.
 *
 * Exported globally so every domain module can inject StorageService without
 * re-importing this module.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
