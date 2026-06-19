// @ts-nocheck
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Triggers a new workflow instance based on a template
   */
  async startWorkflow(tenantId: string, type: any, targetResource: string, targetId: string, requesterId: string) {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { tenantId_type: { tenantId, type } }
    });

    if (!template || !template.isActive) {
      throw new NotFoundException(`Active workflow template for \${type} not found`);
    }

    const instance = await this.prisma.workflowInstance.create({
      data: {
        tenantId,
        templateId: template.id,
        targetResource,
        targetId,
        requesterId,
        status: 'PENDING',
        currentLevel: 1
      }
    });

    this.auditService.log({
      action: 'WORKFLOW_STARTED',
      resource: 'WorkflowInstance',
      resourceId: instance.id,
      tenantId,
      userId: requesterId,
      description: `Started \${type} workflow for \${targetResource} \${targetId}`
    });

    // Fire event so notifications can be sent to the first approver
    this.eventEmitter.emit('workflow.started', { instanceId: instance.id, tenantId, currentLevel: 1 });

    return instance;
  }

  /**
   * Approves a workflow step and advances or completes the workflow
   */
  async approveStep(tenantId: string, instanceId: string, approverId: string, comments?: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { template: true }
    });

    if (!instance || instance.tenantId !== tenantId) {
      throw new NotFoundException('Workflow instance not found');
    }

    if (instance.status !== 'PENDING' && instance.status !== 'ESCALATED') {
      throw new BadRequestException(`Workflow is already \${instance.status}`);
    }

    // Record the step
    await this.prisma.workflowStepLog.create({
      data: {
        instanceId,
        level: instance.currentLevel,
        status: 'APPROVED',
        approverId,
        comments
      }
    });

    const steps = instance.template.steps as any[];
    const isFinalLevel = instance.currentLevel >= steps.length;

    const newStatus = isFinalLevel ? 'APPROVED' : 'PENDING';
    const newLevel = isFinalLevel ? instance.currentLevel : instance.currentLevel + 1;

    const updatedInstance = await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: newStatus,
        currentLevel: newLevel
      }
    });

    this.auditService.log({
      action: 'WORKFLOW_APPROVED',
      resource: 'WorkflowInstance',
      resourceId: instance.id,
      tenantId,
      userId: approverId,
      description: `Approved workflow step \${instance.currentLevel}\${isFinalLevel ? ' (Final)' : ''}`
    });

    if (isFinalLevel) {
      this.eventEmitter.emit('workflow.completed', { instanceId: instance.id, tenantId, targetResource: instance.targetResource, targetId: instance.targetId });
    } else {
      this.eventEmitter.emit('workflow.advanced', { instanceId: instance.id, tenantId, currentLevel: newLevel });
    }

    return updatedInstance;
  }

  async rejectStep(tenantId: string, instanceId: string, approverId: string, comments?: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { template: true }
    });

    if (!instance || instance.tenantId !== tenantId) {
      throw new NotFoundException('Workflow instance not found');
    }

    if (instance.status !== 'PENDING' && instance.status !== 'ESCALATED') {
      throw new BadRequestException(`Workflow is already \${instance.status}`);
    }

    await this.prisma.workflowStepLog.create({
      data: {
        instanceId,
        level: instance.currentLevel,
        status: 'REJECTED',
        approverId,
        comments
      }
    });

    const updatedInstance = await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: 'REJECTED'
      }
    });

    this.auditService.log({
      action: 'WORKFLOW_REJECTED',
      resource: 'WorkflowInstance',
      resourceId: instance.id,
      tenantId,
      userId: approverId,
      description: `Rejected workflow step \${instance.currentLevel}`
    });

    this.eventEmitter.emit('workflow.rejected', { instanceId: instance.id, tenantId });

    return updatedInstance;
  }

  async getWorkflows(tenantId: string, options?: any) {
    const page = parseInt(options?.page, 10) || 1;
    const limit = parseInt(options?.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (options?.status) where.status = options.status;

    const [instances, total] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        where,
        include: { template: { select: { name: true, type: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.workflowInstance.count({ where }),
    ]);
    return { data: instances, meta: { total, page, limit } };
  }

  async getPendingWorkflows(tenantId: string) {
    const instances = await this.prisma.workflowInstance.findMany({
      where: { tenantId, status: 'PENDING' },
      include: { template: { select: { name: true, type: true } } },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
    return instances;
  }

  async getWorkflow(tenantId: string, id: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { id, tenantId },
      include: { template: true }
    });
    if (!instance) throw new NotFoundException('Workflow instance not found');
    return instance;
  }
}
