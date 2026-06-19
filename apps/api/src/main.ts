import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  // ---------------------------------------------------------------------------
  // Sentry Initialization
  // ---------------------------------------------------------------------------
  Sentry.init({
    dsn: configService.get<string>('SENTRY_DSN'),
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  // ---------------------------------------------------------------------------
  // Security Middleware
  // ---------------------------------------------------------------------------
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // ---------------------------------------------------------------------------
  // CORS
  // ---------------------------------------------------------------------------
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
    maxAge: 86400,
  });

  // ---------------------------------------------------------------------------
  // API Versioning
  // ---------------------------------------------------------------------------
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ---------------------------------------------------------------------------
  // Global Pipes, Filters, Interceptors
  // ---------------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(app.get(ConfigService)));
  Sentry.setupExpressErrorHandler(app);

  // ---------------------------------------------------------------------------
  // Swagger API Documentation (non-production only)
  // ---------------------------------------------------------------------------
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('HRManager4U.ai API')
      .setDescription(
        'Enterprise AI HR Operating System API — Malaysia & Australia SME Edition',
      )
      .setVersion('1.0')
      .setContact(
        'HRManager4U Support',
        'https://hrmanager4u.ai',
        'support@hrmanager4u.ai',
      )
      .setLicense('Proprietary', 'https://hrmanager4u.ai/license')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'JWT-Auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Tenant-ID',
          in: 'header',
          description: 'Tenant identifier UUID',
        },
        'Tenant-ID',
      )
      .addTag('Authentication', 'User authentication and session management')
      .addTag('Tenants', 'Multi-tenant management (super admin only)')
      .addTag('Companies', 'Company profile and structure management')
      .addTag('Employees', 'Employee profile and contract management')
      .addTag('Documents', 'HR document generation (PDF/DOCX)')
      .addTag('Knowledge Base', 'AI document ingestion and RAG pipeline')
      .addTag('AI Assistant', 'AI-powered HR Q&A with citations')
      .addTag('Handbook', 'Employee handbook and code of conduct generator')
      .addTag('Compliance', 'Compliance scoring and audit reports')
      .addTag('Audit', 'Immutable audit trail viewer')
      .addServer('http://localhost:4000', 'Development')
      .addServer('https://api.hrmanager4u.ai', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    console.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
  }

  // ---------------------------------------------------------------------------
  // Start Server
  // ---------------------------------------------------------------------------
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 HRManager4U.ai API running on port ${port}`);
  console.log(`🌍 Environment: ${nodeEnv}`);
  console.log(`🔗 API Base: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});

