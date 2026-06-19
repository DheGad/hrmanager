import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

/**
 * RedisModule — Global infrastructure module.
 *
 * Provides a single, application-scoped RedisService backed by ioredis.
 * Exported globally so every domain module can inject RedisService without
 * re-importing this module.
 *
 * Connection lifecycle:
 *  - Created lazily on first use by RedisService constructor.
 *  - Torn down gracefully via OnModuleDestroy inside RedisService.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
