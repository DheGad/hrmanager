// @ts-nocheck
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import configuration from './config/configuration';
import { validationSchema } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';

import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './shared/redis/redis.module';
import { BullModule } from '@nestjs/bull';

import { TenantModule } from './modules/tenant/tenant.module';
import { CompanyModule } from './modules/company/company.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { LeaveModule } from './modules/leave/leave.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { DocumentModule } from './modules/document/document.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { HandbookModule } from './modules/handbook/handbook.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationModule } from './modules/notification/notification.module';
import { LifecycleModule } from './modules/lifecycle/lifecycle.module';
import { VaultModule } from './modules/vault/vault.module';
import { DocumentEngineModule } from './modules/document-engine/document-engine.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ConfigProviderModule } from './shared/config-provider/config-provider.module';
import { ControlCenterModule } from './modules/control-center/control-center.module';
import { DepartmentModule } from './modules/department/department.module';

@Module({
  imports: [
    // ─── Core Config ──────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
      cache: true,
      expandVariables: true,
    }),

    // ─── Rate Limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('throttle.ttl', 60) * 1000,
            limit: config.get<number>('throttle.limit', 100),
          },
        ],
      }),
    }),

    // ─── Scheduling ───────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Event Bus ────────────────────────────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),

    // ─── Infrastructure ───────────────────────────────────────────────────────
    PrismaModule,
    RedisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password'),
          db: config.get<number>('redis.db', 0),
        },
      }),
    }),

    // ─── Domain Modules ───────────────────────────────────────────────────────
    
    AuthModule,
    TenantModule,
    CompanyModule,
    EmployeeModule,
    LeaveModule,
    WorkflowModule,
    DocumentModule,
    KnowledgeBaseModule,
    AiAssistantModule,
    HandbookModule,
    ComplianceModule,
    AuditModule,
    NotificationModule,
    LifecycleModule,
    VaultModule,
    DocumentEngineModule,
    SchedulerModule,
    AnalyticsModule,
    ConfigProviderModule,
    ControlCenterModule,
    DepartmentModule,
  ],
  providers: [
    // ─── Global Exception Filter ──────────────────────────────────────────────
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // ─── Global Interceptors (order matters) ──────────────────────────────────
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },

    // ─── Global Guards (order matters) ────────────────────────────────────────
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // Public auth routes — tenant context not yet established
        { path: 'api/v1/auth/(.*)', method: RequestMethod.ALL },
        // Health & Swagger
        { path: 'health', method: RequestMethod.GET },
        { path: 'api-docs/(.*)', method: RequestMethod.ALL },
        { path: 'api-docs', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
