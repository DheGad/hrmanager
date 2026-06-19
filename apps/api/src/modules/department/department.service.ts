// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.department.findMany({
      where: { tenantId },
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const dept = await this.prisma.department.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { employees: true } } },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(tenantId: string, companyId: string, dto: { name: string; code?: string; managerId?: string; parentDepartmentId?: string }) {
    return this.prisma.department.create({
      data: {
        tenantId,
        companyId,
        name: dto.name,
        code: dto.code || dto.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 10),
        managerId: dto.managerId || null,
        parentDepartmentId: dto.parentDepartmentId || null,
      },
      include: { _count: { select: { employees: true } } },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    const dept = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!dept) throw new NotFoundException('Department not found');
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const dept = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!dept) throw new NotFoundException('Department not found');
    return this.prisma.department.delete({ where: { id } });
  }
}
