import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  log(entry: any): void {
    // Non-blocking fire and forget
    setImmediate(async () => {
      try {
        await this.prisma.auditLog.create({
          data: {
            ...entry,
            severity: entry.severity || 'INFO',
          },
        });
      } catch (error) {
        this.logger.error('Failed to write audit log', error);
      }
    });
  }

  async findAll(tenantId: string, options: any) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 25;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
