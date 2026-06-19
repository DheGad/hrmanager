// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Daily cron job: Runs every midnight
   * Checks for Vault documents expiring in 30 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkDocumentExpirations() {
    this.logger.log('Running checkDocumentExpirations cron job');
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    // Find documents expiring strictly on that target day
    const expiringFiles = await this.prisma.employeeFile.findMany({
      where: {
        expiryDate: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999))
        }
      }
    });

    for (const file of expiringFiles) {
      this.eventEmitter.emit('document.expiring', {
        tenantId: file.tenantId,
        employeeId: file.employeeId,
        fileId: file.id,
        category: file.category
      });
    }

    this.logger.log(`Found \${expiringFiles.length} documents expiring in 30 days.`);
  }

  /**
   * Daily cron job: Checks probation end dates
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkProbationEndDates() {
    this.logger.log('Running checkProbationEndDates cron job');

    const today = new Date();

    const employees = await this.prisma.employee.findMany({
      where: {
        employmentStatus: 'PROBATION',
        probationEndDate: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(23, 59, 59, 999))
        }
      }
    });

    for (const emp of employees) {
      this.eventEmitter.emit('lifecycle.probation_ending', {
        tenantId: emp.tenantId,
        employeeId: emp.id
      });
    }

    this.logger.log(`Found \${employees.length} employees ending probation today.`);
  }
}
