// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LifecycleService {
  private readonly logger = new Logger(LifecycleService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Transitions an employee's lifecycle status (e.g., Probation -> Active)
   */
  async transitionStatus(tenantId: string, employeeId: string, newStatus: any, reason: string, changedBy: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee || employee.tenantId !== tenantId) {
      throw new Error('Employee not found');
    }

    const previousStatus = employee.employmentStatus;

    if (previousStatus === newStatus) {
      return employee; // No change
    }

    // 1. Update Employee
    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: { employmentStatus: newStatus }
    });

    // 2. Log Lifecycle Event
    const event = await this.prisma.lifecycleEvent.create({
      data: {
        tenantId,
        employeeId,
        previousStatus,
        newStatus,
        reason,
        changedBy,
        effectiveDate: new Date()
      }
    });

    // 3. Emit global event for other modules
    this.eventEmitter.emit('lifecycle.changed', {
      tenantId,
      employeeId,
      previousStatus,
      newStatus
    });

    this.auditService.log({
      action: 'LIFECYCLE_TRANSITION',
      resource: 'Employee',
      resourceId: employeeId,
      tenantId,
      userId: changedBy,
      description: `Employee transitioned from \${previousStatus} to \${newStatus}`
    });

    return updated;
  }

  async getTimeline(tenantId: string, employeeId: string) {
    return this.prisma.lifecycleEvent.findMany({
      where: { tenantId, employeeId },
      orderBy: { effectiveDate: 'desc' }
    });
  }
}
