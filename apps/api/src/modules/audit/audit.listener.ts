import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from './audit.service';

@Injectable()
export class AuditListener {
  private readonly logger = new Logger(AuditListener.name);

  constructor(private readonly auditService: AuditService) {}

  @OnEvent('audit.log')
  handleAuditLog(payload: any) {
    this.logger.log(`Received audit event: \${payload.action}`);
    // Convert payload into expected AuditLog data
    this.auditService.log({
      action: payload.action,
      resource: payload.resource || 'System',
      resourceId: payload.resourceId || null,
      tenantId: payload.tenantId,
      userId: payload.actorId || payload.userId,
      description: payload.description || `Action \${payload.action} performed`,
      metadata: payload.metadata || {},
    });
  }
}
