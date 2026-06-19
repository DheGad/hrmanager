// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1);

    const [
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      terminationsThisMonth,
      pendingLeaves,
      approvedLeaves,
      pendingWorkflows,
      documentsGenerated,
      aiQueriesToday,
      aiQueriesTotal,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId } }),
      this.prisma.employee.count({ where: { tenantId, isActive: true, employmentStatus: { not: 'TERMINATED' } } }),
      this.prisma.employee.count({ where: { tenantId, hireDate: { gte: monthStart } } }),
      this.prisma.employee.count({ where: { tenantId, terminationDate: { gte: monthStart } } }),
      this.prisma.leaveRequest.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.leaveRequest.count({ where: { tenantId, status: 'APPROVED' } }),
      this.prisma.workflowInstance.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.document.count({ where: { tenantId } }),
      this.prisma.aiMessage.count({
        where: { tenantId, role: 'USER', createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } }
      }),
      this.prisma.aiMessage.count({ where: { tenantId, role: 'USER' } }),
    ]);

    return {
      // Primary KPIs — matched to frontend useDashboard types
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      terminationsThisMonth,
      pendingApprovals: pendingLeaves + pendingWorkflows,
      aiQueriesToday,
      documentsGenerated,
      expiringDocuments: 0, // Vault files with expiry tracked separately
      // Nested for backward compat
      headcount: { total: totalEmployees, new: newHiresThisMonth },
      leaves: {
        active: approvedLeaves,
        pending: pendingLeaves,
      },
      ai: { queries: aiQueriesTotal },
    };
  }

  async getAnalyticsData(tenantId: string) {
    const [
      leaveBreakdownRows,
      complianceRecords,
      aiTotal,
    ] = await Promise.all([
      // Real leave breakdown from DB — groupBy leaveTypeId
      this.prisma.leaveRequest.groupBy({
        by: ['leaveTypeId'],
        where: { tenantId, status: { in: ['APPROVED', 'PENDING'] } },
        _count: { leaveTypeId: true },
      }),
      this.prisma.complianceRecord.findMany({
        where: { tenantId },
        orderBy: { assessedAt: 'desc' },
        take: 6,
      }),
      this.prisma.aiMessage.count({ where: { tenantId, role: 'USER' } }),
    ]);

    // Convert groupBy result to { leaveTypeId: count } map
    const leaveBreakdown: Record<string, number> = {};
    for (const row of leaveBreakdownRows) {
      const label = row.leaveTypeId || 'Other';
      leaveBreakdown[label] = row._count?.leaveTypeId ?? 0;
    }

    return {
      leaveBreakdown: Object.keys(leaveBreakdown).length > 0
        ? leaveBreakdown
        : { 'No Data': 0 },
      complianceTrend: complianceRecords.map(r => ({
        score: r.score,
        date: r.assessedAt,
        riskLevel: r.riskLevel,
      })),
      aiUsage: { queries: aiTotal },
    };
  }

  async getPendingApprovals(tenantId: string) {
    const [pendingLeaves, pendingWorkflows] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where: { tenantId, status: 'PENDING' },
        include: {
          employee: { select: { firstName: true, lastName: true, jobTitle: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
      this.prisma.workflowInstance.findMany({
        where: { tenantId, status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
    ]);

    const approvals = [
      ...pendingLeaves.map(l => ({
        id: l.id,
        type: 'LEAVE' as const,
        status: l.status,
        requesterId: l.employeeId,
        requester: l.employee
          ? { firstName: l.employee.firstName, lastName: l.employee.lastName, jobTitle: l.employee.jobTitle, avatarUrl: l.employee.avatarUrl ?? undefined }
          : undefined,
        targetResource: 'LeaveRequest',
        targetId: l.id,
        createdAt: l.createdAt.toISOString(),
      })),
      ...pendingWorkflows.map(w => ({
        id: w.id,
        type: 'DOCUMENT' as const,
        status: w.status,
        requesterId: w.requesterId,
        requester: undefined,
        targetResource: w.targetResource,
        targetId: w.targetId,
        createdAt: w.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return approvals;
  }
}
