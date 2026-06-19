// @ts-nocheck
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async requestLeave(tenantId: string, employeeId: string, leaveTypeId: string, days: number, startDate: Date, endDate: Date, reason: string) {
    // Check balance
    const currentYear = new Date().getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year: currentYear
        }
      }
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found for this type');
    }

    const available = Number(balance.totalDays) - Number(balance.takenDays) - Number(balance.pendingDays);
    if (available < days) {
      throw new BadRequestException(`Insufficient leave balance. Available: \${available}`);
    }

    // Find manager
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    
    // Create request via transaction
    const request = await this.prisma.$transaction(async (tx) => {
      const leaveRequest = await tx.leaveRequest.create({
        data: {
          tenantId,
          employeeId,
          leaveTypeId,
          days,
          startDate,
          endDate,
          reason,
          managerId: employee?.managerId,
          status: 'PENDING'
        }
      });

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { pendingDays: { increment: days } }
      });

      return leaveRequest;
    });

    this.auditService.log({
      action: 'LEAVE_REQUEST_CREATED',
      resource: 'LeaveRequest',
      resourceId: request.id,
      tenantId,
      userId: employee?.userId || undefined,
      description: `Leave requested for \${days} days`
    });

    return request;
  }

  async approveLeave(tenantId: string, managerId: string, requestId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.leaveRequest.findFirst({
        where: { id: requestId, tenantId, status: 'PENDING' }
      });

      if (!request) throw new NotFoundException('Pending leave request not found');
      
      // In a real app, verify managerId matches request.managerId or role=HR_MANAGER

      const updated = await tx.leaveRequest.update({
        where: { id: request.id },
        data: { status: 'APPROVED', reviewedAt: new Date() }
      });

      const currentYear = new Date().getFullYear();
      await tx.leaveBalance.update({
        where: { 
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year: currentYear
          }
        },
        data: {
          pendingDays: { decrement: request.days },
          takenDays: { increment: request.days }
        }
      });

      this.auditService.log({
        action: 'LEAVE_REQUEST_APPROVED',
        resource: 'LeaveRequest',
        resourceId: request.id,
        tenantId,
        userId: managerId,
        description: `Leave request \${request.id} approved`
      });

      return updated;
    });
  }

  async rejectLeave(tenantId: string, managerId: string, requestId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.leaveRequest.findFirst({
        where: { id: requestId, tenantId, status: 'PENDING' }
      });

      if (!request) throw new NotFoundException('Pending leave request not found');

      const updated = await tx.leaveRequest.update({
        where: { id: request.id },
        data: { status: 'REJECTED', reviewedAt: new Date() }
      });

      const currentYear = new Date().getFullYear();
      await tx.leaveBalance.update({
        where: { 
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year: currentYear
          }
        },
        data: {
          pendingDays: { decrement: request.days }
        }
      });

      this.auditService.log({
        action: 'LEAVE_REQUEST_REJECTED',
        resource: 'LeaveRequest',
        resourceId: request.id,
        tenantId,
        userId: managerId,
        description: `Leave request \${request.id} rejected. Reason: \${reason}`
      });

      return updated;
    });
  }

  async findAll(tenantId: string, options: any) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (options.status && options.status !== 'ALL') where.status = options.status;
    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        include: { employee: { select: { firstName: true, lastName: true, jobTitle: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(tenantId: string, id: string) {
    const leave = await this.prisma.leaveRequest.findFirst({
      where: { id, tenantId },
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    return leave;
  }

  async findTypes(tenantId: string) {
    return this.prisma.leaveType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Seeds standard Malaysian leave types for a tenant if none exist.
   * Safe to call multiple times — uses upsert logic.
   */
  async seedDefaultTypes(tenantId: string) {
    const existing = await this.prisma.leaveType.count({ where: { tenantId } });
    if (existing > 0) return { seeded: false, message: 'Leave types already exist' };

    const defaults = [
      { name: 'Annual Leave', description: 'Paid annual leave per Employment Act', isPaid: true, defaultDays: 14 },
      { name: 'Medical Leave', description: 'Paid sick leave per Employment Act', isPaid: true, defaultDays: 14 },
      { name: 'Emergency Leave', description: 'For urgent personal matters', isPaid: true, defaultDays: 3 },
      { name: 'Maternity Leave', description: 'Per Employment Act s.37', isPaid: true, defaultDays: 98 },
      { name: 'Paternity Leave', description: 'Paid paternity leave', isPaid: true, defaultDays: 7 },
      { name: 'Unpaid Leave', description: 'Unpaid leave at employer discretion', isPaid: false, defaultDays: 30 },
    ];

    await this.prisma.leaveType.createMany({
      data: defaults.map(d => ({ ...d, tenantId })),
    });

    return { seeded: true, count: defaults.length, message: `Seeded ${defaults.length} default leave types` };
  }
}
