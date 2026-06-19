import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private transporter!: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    const host = this.configService.get<string>('smtp.host');
    if (host && host !== 'smtp.mailtrap.io') {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('smtp.port') || 587,
        auth: {
          user: this.configService.get<string>('smtp.user'),
          pass: this.configService.get<string>('smtp.pass'),
        },
      });
      this.logger.log(`SMTP configured for ${host}`);
    } else {
      this.logger.log('No valid SMTP config found. Creating Ethereal test account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log('Ethereal Email account configured successfully.');
      } catch (err: any) {
        this.logger.error('Failed to create ethereal account', err);
      }
    }
  }

  @OnEvent('auth.forgot-password')
  async handleForgotPassword(payload: { userId: string; email: string; firstName: string; resetToken: string }) {
    this.logger.log(`Handling auth.forgot-password for ${payload.email}`);
    const resetUrl = `https://staging.hrmanager4u.ai/reset-password?token=${payload.resetToken}`;
    const body = `Hello ${payload.firstName},\n\nPlease reset your password by clicking the link below:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    
    await this.dispatchEmail(payload.userId, payload.email, 'Password Reset Request', body);
  }

  @OnEvent('leave.request.created')
  async handleLeaveRequested(payload: { tenantId: string; employeeId: string; leaveId: string }) {
    this.logger.log(`Handling leave.request.created for employee ${payload.employeeId}`);
    const employee = await this.prisma.employee.findUnique({
      where: { id: payload.employeeId },
      include: { user: true }
    });
    if (employee && employee.user) {
      const body = `Your leave request has been submitted and is pending approval.`;
      await this.dispatchEmail(employee.userId, employee.user.email, 'Leave Request Submitted', body);
    }
  }

  @OnEvent('workflow.started')
  async handleWorkflowStarted(payload: { instanceId: string; tenantId: string; currentLevel: number }) {
    this.logger.log(`Handling workflow.started for ${payload.instanceId}`);
  }

  @OnEvent('workflow.completed')
  async handleWorkflowCompleted(payload: { instanceId: string; tenantId: string }) {
    this.logger.log(`Handling workflow.completed for ${payload.instanceId}`);
  }

  async dispatchEmail(userId: string | null, email: string, subject: string, body: string) {
    if (!this.transporter) return;

    try {
      const info = await this.transporter.sendMail({
        from: '"HRManager4U" <noreply@hrmanager4u.ai>',
        to: email,
        subject,
        text: body
      });
      
      this.logger.log(`Email sent to ${email}: ${info.messageId}`);
      if (info.messageId && nodemailer.getTestMessageUrl(info)) {
        this.logger.log(`Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (e: any) {
      this.logger.error(`Email dispatch failed to ${email}`, e);
    }
  }

  async findAll(tenantId: string, userId?: string) {
    const page = 1;
    const limit = 25;
    const where: any = { tenantId };
    if (userId) where.userId = userId;
    
    const [logs, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    // Map log records to notification shape expected by frontend
    const data = logs.map(log => ({
      id: log.id,
      type: log.type,
      channel: log.channel,
      status: log.status,
      read: log.status === 'SENT',
      createdAt: log.createdAt,
      sentAt: log.sentAt,
    }));

    return { data, meta: { total, page, limit } };
  }

  async markRead(tenantId: string, notificationId: string) {
    return this.prisma.notificationLog.updateMany({
      where: { id: notificationId, tenantId },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  async markAllRead(tenantId: string, userId: string) {
    return this.prisma.notificationLog.updateMany({
      where: { tenantId, userId, status: 'PENDING' },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }
}

