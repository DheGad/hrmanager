// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, companyId: string, dto: any) {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const employeeNumber = `EMP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    
    // Normalise all required fields — apply safe defaults for fields the form may omit
    const normalised = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      workEmail: dto.workEmail,
      personalEmail: dto.personalEmail || dto.workEmail,
      phone: dto.phone || '',
      jobTitle: dto.jobTitle || '',
      employmentType: dto.employmentType || 'FULL_TIME',
      employmentStatus: dto.employmentStatus || 'ACTIVE',
      hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : new Date('1990-01-01'),
      gender: dto.gender || 'PREFER_NOT_TO_SAY',
      nationality: dto.nationality || '',
      nricPassport: dto.nricPassport || '',
      address: dto.address || '',
      city: dto.city || '',
      state: dto.state || '',
      postcode: dto.postcode || '',
      country: dto.country || 'MY',
      emergencyContactName: dto.emergencyContactName || '',
      emergencyContactPhone: dto.emergencyContactPhone || '',
      emergencyContactRelation: dto.emergencyContactRelation || '',
      departmentId: dto.departmentId || null,
      managerId: dto.managerId || null,
      noticePeriodDays: dto.noticePeriodDays || 30,
    };
    
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          ...normalised,
          tenantId,
          companyId,
          employeeNumber,
        },
      });

      // Auto-provision leave balances based on tenant's leave types
      const leaveTypes = await tx.leaveType.findMany({
        where: { tenantId },
      });

      if (leaveTypes.length > 0) {
        await tx.leaveBalance.createMany({
          data: leaveTypes.map(lt => ({
            tenantId,
            employeeId: employee.id,
            leaveTypeId: lt.id,
            year: new Date().getFullYear(),
            totalDays: lt.defaultDays || 14,
            takenDays: 0,
            pendingDays: 0,
          })),
        });
      }

      return employee;
    });
  }

  async findAll(tenantId: string, options: any) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId },
        skip,
        take: limit,
        include: { department: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: { contracts: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(tenantId: string, id: string, dto: any) {
    const result = await this.prisma.employee.updateMany({
      where: { id, tenantId },
      data: dto,
    });
    if (result.count === 0) throw new NotFoundException('Employee not found');
    return this.findOne(tenantId, id);
  }

  async terminate(tenantId: string, id: string, dto: any) {
    const result = await this.prisma.employee.updateMany({
      where: { id, tenantId },
      data: {
        employmentStatus: 'TERMINATED',
        terminationDate: dto.terminationDate,
      },
    });
    if (result.count === 0) throw new NotFoundException('Employee not found');
    return this.findOne(tenantId, id);
  }
}
