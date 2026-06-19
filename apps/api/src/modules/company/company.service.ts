import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: any) {
    return this.prisma.company.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string, options: any) {
    const { skip, limit } = options;
    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where: { tenantId, isActive: true },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where: { tenantId, isActive: true } }),
    ]);
    return { data, meta: { total, page: options.page, limit } };
  }

  async findOne(tenantId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId },
      include: { branches: true, departments: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(tenantId: string, id: string, dto: any) {
    const result = await this.prisma.company.updateMany({
      where: { id, tenantId },
      data: dto,
    });
    if (result.count === 0) throw new NotFoundException('Company not found');
    return this.findOne(tenantId, id);
  }

  async delete(tenantId: string, id: string) {
    const result = await this.prisma.company.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });
    if (result.count === 0) throw new NotFoundException('Company not found');
    return this.findOne(tenantId, id);
  }
}
