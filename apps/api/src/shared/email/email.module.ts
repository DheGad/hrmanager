import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

/**
 * EmailModule — Global infrastructure module.
 *
 * Provides a single, application-scoped EmailService backed by nodemailer.
 * SMTP credentials are read from ConfigService (SMTP_* environment variables).
 *
 * Email failures are intentionally swallowed — they are logged but never
 * propagate exceptions to callers so that transient SMTP issues do not break
 * the main business flow.
 *
 * Exported globally so every domain module can inject EmailService without
 * re-importing this module.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
