import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditListener } from './audit.listener';
import { AuditController } from './audit.controller';

@Global()
@Module({
  providers: [
    AuditService,
    AuditListener,
    {
      provide: 'AUDIT_SERVICE_TOKEN',
      useExisting: AuditService,
    },
  ],
  controllers: [AuditController],
  exports: [AuditService, 'AUDIT_SERVICE_TOKEN'],
})
export class AuditModule {}
