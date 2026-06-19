import { PrismaClient, RiskLevel } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

async function main() {
  console.log('🌱 Starting Roy Demo Tenant Seed...');

  const passwordHash = await argon2.hash('Demo123!@#', ARGON2_OPTIONS);

  // 0. Wipe existing demo tenant to avoid unique constraint errors
  const oldTenant = await prisma.tenant.findUnique({ where: { slug: 'tech-innovators' } });
  if (oldTenant) {
    await prisma.auditLog.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.document.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.complianceRecord.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.knowledgeBase.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.leaveRequest.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.leaveBalance.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.employee.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.user.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.department.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.leaveType.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.company.deleteMany({ where: { tenantId: oldTenant.id } });
    await prisma.tenant.delete({ where: { id: oldTenant.id } });
  }

  // 1. Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      id: randomUUID(),
      name: 'Tech Innovators Sdn Bhd',
      slug: 'tech-innovators',
      plan: 'ENTERPRISE',
      country: 'MY',
      isActive: true,
    }
  });

  // 2. Create Companies
  const companyA = await prisma.company.upsert({
    where: { id: randomUUID() },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Tech Innovators HQ (Company A)',
      country: 'MY',
      size: 'LARGE',
      industry: 'Technology',
      isActive: true,
      address: 'Level 42, Cyber Tower',
      city: 'Cyberjaya',
      state: 'Selangor',
      postcode: '63000',
      phone: '+60311112222',
      email: 'hq@techinnovators.my',
    },
  });

  const companyB = await prisma.company.upsert({
    where: { id: randomUUID() },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Tech Innovators Penang (Company B)',
      country: 'MY',
      size: 'MEDIUM',
      industry: 'Technology',
      isActive: true,
      address: 'Bayan Lepas FTZ',
      city: 'Penang',
      state: 'Penang',
      postcode: '11900',
      phone: '+60422223333',
      email: 'penang@techinnovators.my',
    },
  });

  const companyC = await prisma.company.upsert({
    where: { id: randomUUID() },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Tech Innovators Johor (Company C)',
      country: 'MY',
      size: 'SMALL',
      industry: 'Technology',
      isActive: true,
      address: 'Medini Iskandar',
      city: 'Johor Bahru',
      state: 'Johor',
      postcode: '79250',
      phone: '+60733334444',
      email: 'johor@techinnovators.my',
    },
  });

  // 3. Create Users (Roy, Manager, Sarah)
  const royUser = await prisma.user.upsert({
    where: { tenantId_email: { email: 'roy@demo.hrmanager4u.ai', tenantId: tenant.id } },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      email: 'roy@demo.hrmanager4u.ai',
      passwordHash,
      firstName: 'Roy',
      lastName: 'Director',
      role: 'COMPANY_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { tenantId_email: { email: 'manager@demo.hrmanager4u.ai', tenantId: tenant.id } },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      email: 'manager@demo.hrmanager4u.ai',
      passwordHash,
      firstName: 'Alan',
      lastName: 'Manager',
      role: 'HR_MANAGER',
      isActive: true,
      emailVerified: true,
    },
  });

  const sarahUser = await prisma.user.upsert({
    where: { tenantId_email: { email: 'sarah@demo.hrmanager4u.ai', tenantId: tenant.id } },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      email: 'sarah@demo.hrmanager4u.ai',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Lim',
      role: 'EMPLOYEE',
      isActive: true,
      emailVerified: true,
    },
  });

  // 4. Create Departments
  const deptEngineering = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      companyId: companyA.id,
      name: 'Engineering',
    }
  });

  const deptHR = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      companyId: companyA.id,
      name: 'Human Resources',
    }
  });

  // 5. Create Employees (Roy, Manager, Sarah)
  const royEmployee = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      companyId: companyA.id,
      userId: royUser.id,
      departmentId: deptHR.id,
      employeeNumber: 'EMP-001',
      firstName: 'Roy',
      lastName: 'Director',
      dateOfBirth: new Date('1980-05-10'),
      gender: 'MALE',
      nationality: 'Malaysian',
      nricPassport: '800510-14-1234',
      personalEmail: 'roy.personal@example.com',
      workEmail: 'roy@demo.hrmanager4u.ai',
      phone: '+60123456780',
      jobTitle: 'HR Director',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2020-01-01'),
      address: '123 Main Street',
      city: 'Kuala Lumpur',
      state: 'Kuala Lumpur',
      postcode: '50000',
      country: 'MY',
      emergencyContactName: 'Jane Director',
      emergencyContactPhone: '+60123456788',
      emergencyContactRelation: 'Spouse'
    }
  });

  const managerEmployee = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      companyId: companyA.id,
      userId: managerUser.id,
      departmentId: deptHR.id,
      managerId: royEmployee.id,
      employeeNumber: 'EMP-002',
      firstName: 'Alan',
      lastName: 'Manager',
      dateOfBirth: new Date('1985-08-15'),
      gender: 'MALE',
      nationality: 'Malaysian',
      nricPassport: '850815-14-2345',
      personalEmail: 'alan.personal@example.com',
      workEmail: 'manager@demo.hrmanager4u.ai',
      phone: '+60123456781',
      jobTitle: 'HR Manager',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2021-03-01'),
      address: '456 Subang Jaya',
      city: 'Subang Jaya',
      state: 'Selangor',
      postcode: '47500',
      country: 'MY',
      emergencyContactName: 'Mrs Manager',
      emergencyContactPhone: '+60123456789',
      emergencyContactRelation: 'Spouse'
    }
  });

  const sarahEmployee = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      companyId: companyA.id,
      userId: sarahUser.id,
      departmentId: deptEngineering.id,
      managerId: managerEmployee.id,
      employeeNumber: 'EMP-003',
      firstName: 'Sarah',
      lastName: 'Lim',
      dateOfBirth: new Date('1995-12-20'),
      gender: 'FEMALE',
      nationality: 'Malaysian',
      nricPassport: '951220-14-3456',
      personalEmail: 'sarah.personal@example.com',
      workEmail: 'sarah@demo.hrmanager4u.ai',
      phone: '+60123456782',
      jobTitle: 'Software Engineer',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      hireDate: new Date('2023-06-15'),
      address: '789 Petaling Jaya',
      city: 'Petaling Jaya',
      state: 'Selangor',
      postcode: '46000',
      country: 'MY',
      emergencyContactName: 'Mr Lim',
      emergencyContactPhone: '+60123456790',
      emergencyContactRelation: 'Parent'
    }
  });

  // Create 9 more realistic employees (Total 10 excluding Roy and Manager)
  const names = [
    { first: 'John', last: 'Tan', title: 'QA Engineer', gender: 'MALE', nric: '900101-14-5555' },
    { first: 'David', last: 'Wong', title: 'Frontend Dev', gender: 'MALE', nric: '920202-14-6666' },
    { first: 'Lisa', last: 'Ong', title: 'Product Manager', gender: 'FEMALE', nric: '880303-14-7777' },
    { first: 'Michael', last: 'Lee', title: 'Backend Dev', gender: 'MALE', nric: '940404-14-8888' },
    { first: 'Rachel', last: 'Ng', title: 'UX Designer', gender: 'FEMALE', nric: '960505-14-9999' },
    { first: 'Kevin', last: 'Low', title: 'DevOps Engineer', gender: 'MALE', nric: '910606-14-0000' },
    { first: 'Farah', last: 'Ahmad', title: 'Data Scientist', gender: 'FEMALE', nric: '930707-14-1111' },
    { first: 'Amir', last: 'Hassan', title: 'Business Analyst', gender: 'MALE', nric: '890808-14-2222' },
    { first: 'Priya', last: 'Kumar', title: 'Support Engineer', gender: 'FEMALE', nric: '970909-14-3333' }
  ];

  const employees = [];
  employees.push(sarahEmployee);

  for (let i = 0; i < names.length; i++) {
    const p = names[i];
    const u = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: `${p.first.toLowerCase()}.${p.last.toLowerCase()}@demo.hrmanager4u.ai`,
        passwordHash,
        firstName: p.first,
        lastName: p.last,
        role: 'EMPLOYEE',
        isActive: true,
        emailVerified: true,
      }
    });

    const e = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        companyId: companyA.id,
        userId: u.id,
        departmentId: deptEngineering.id,
        managerId: managerEmployee.id,
        employeeNumber: `EMP-0${i + 4}`, // 004 to 012
        firstName: p.first,
        lastName: p.last,
        dateOfBirth: new Date('1990-01-01'),
        gender: p.gender as any,
        nationality: 'Malaysian',
        nricPassport: p.nric,
        personalEmail: `${p.first.toLowerCase()}@example.com`,
        workEmail: `${p.first.toLowerCase()}.${p.last.toLowerCase()}@demo.hrmanager4u.ai`,
        phone: `+6012345600${i}`,
        jobTitle: p.title,
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        hireDate: new Date(`202${i % 4}-0${(i % 9) + 1}-01`),
        address: `12${i} Tech Street`,
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        postcode: '50000',
        country: 'MY',
        emergencyContactName: `${p.last} Contact`,
        emergencyContactPhone: `+6012345900${i}`,
        emergencyContactRelation: 'Sibling'
      }
    });
    employees.push(e);
  }

  // 6. Create Leave Types & Balances
  const annualLeave = await prisma.leaveType.create({
    data: {
      tenantId: tenant.id,
      name: 'Annual Leave',
      defaultDays: 14,
    }
  });

  const sickLeave = await prisma.leaveType.create({
    data: {
      tenantId: tenant.id,
      name: 'Sick Leave',
      defaultDays: 14,
    }
  });

  for (const emp of [royEmployee, managerEmployee, ...employees]) {
    await prisma.leaveBalance.createMany({
      data: [
        {
          tenantId: tenant.id,
          employeeId: emp.id,
          leaveTypeId: annualLeave.id,
          year: new Date().getFullYear(),
          totalDays: 14,
          takenDays: emp.id === sarahEmployee.id ? 2 : 0,
          pendingDays: emp.id === sarahEmployee.id ? 1 : 0,
        },
        {
          tenantId: tenant.id,
          employeeId: emp.id,
          leaveTypeId: sickLeave.id,
          year: new Date().getFullYear(),
          totalDays: 14,
          takenDays: 0,
          pendingDays: 0,
        }
      ]
    });
  }

  // 7. Seed Leave Requests
  await prisma.leaveRequest.create({
    data: {
      tenantId: tenant.id,
      employeeId: sarahEmployee.id,
      leaveTypeId: annualLeave.id,
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-11'),
      days: 2,
      reason: 'Family trip',
      status: 'APPROVED',
      managerId: managerEmployee.id,
      reviewedAt: new Date('2026-05-01'),
    }
  });

  await prisma.leaveRequest.create({
    data: {
      tenantId: tenant.id,
      employeeId: employees[1].id,
      leaveTypeId: annualLeave.id,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-01'),
      days: 1,
      reason: 'Personal errands',
      status: 'APPROVED',
      managerId: managerEmployee.id,
      reviewedAt: new Date('2026-05-15'),
    }
  });

  await prisma.leaveRequest.create({
    data: {
      tenantId: tenant.id,
      employeeId: employees[2].id,
      leaveTypeId: sickLeave.id,
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-04-11'),
      days: 2,
      reason: 'Fever',
      status: 'APPROVED',
      managerId: managerEmployee.id,
      reviewedAt: new Date('2026-04-10'),
    }
  });

  await prisma.leaveRequest.create({
    data: {
      tenantId: tenant.id,
      employeeId: sarahEmployee.id,
      leaveTypeId: annualLeave.id,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-01'),
      days: 1,
      reason: 'Attending wedding',
      status: 'PENDING',
    }
  });

  await prisma.leaveRequest.create({
    data: {
      tenantId: tenant.id,
      employeeId: employees[3].id,
      leaveTypeId: annualLeave.id,
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-07-16'),
      days: 2,
      reason: 'Vacation',
      status: 'PENDING',
    }
  });

  await prisma.leaveRequest.create({
    data: {
      tenantId: tenant.id,
      employeeId: employees[4].id,
      leaveTypeId: annualLeave.id,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-14'),
      days: 14,
      reason: 'Long holiday',
      status: 'REJECTED',
      managerId: managerEmployee.id,
      reviewedAt: new Date('2026-02-15'),
    }
  });

  // 8. Seed Knowledge Base
  const kbData = [
    { name: 'Employment Act 1955', type: 'EMPLOYMENT_ACT' },
    { name: 'Industrial Relations Act 1967', type: 'INDUSTRIAL_RELATIONS_ACT' },
    { name: 'Employee Handbook', type: 'COMPANY_HANDBOOK' },
    { name: 'Leave Policy', type: 'CUSTOM' },
    { name: 'Remote Work Policy', type: 'CUSTOM' },
  ];

  for (const kb of kbData) {
    await prisma.knowledgeBase.create({
      data: {
        tenantId: tenant.id,
        name: kb.name,
        type: kb.type as any,
        country: 'MY',
        status: 'READY',
        fileUrl: `minio://hrmanager4u/${kb.name.replace(/ /g, '_')}.pdf`,
        fileSize: 1024000,
        mimeType: 'application/pdf',
        pageCount: 50,
        chunkCount: 150,
      }
    });
  }

  // 9. Seed Compliance Data
  await prisma.complianceRecord.create({
    data: {
      tenantId: tenant.id,
      companyId: companyA.id,
      score: 90,
      riskLevel: 'LOW',
      checklist: [{ item: 'Contract Clauses', status: 'PASS' }, { item: 'Working Hours', status: 'PASS' }],
      missingPolicies: ['Data Privacy Policy'],
      assessedAt: new Date(),
      createdBy: royUser.id,
    }
  });

  await prisma.complianceRecord.create({
    data: {
      tenantId: tenant.id,
      companyId: companyB.id,
      score: 60,
      riskLevel: 'MEDIUM',
      checklist: [{ item: 'Overtime Pay', status: 'FAIL' }, { item: 'Minimum Wage', status: 'PASS' }],
      missingPolicies: ['Remote Work Policy', 'IT Security Policy'],
      assessedAt: new Date(),
      createdBy: royUser.id,
    }
  });

  await prisma.complianceRecord.create({
    data: {
      tenantId: tenant.id,
      companyId: companyC.id,
      score: 30,
      riskLevel: 'HIGH',
      checklist: [{ item: 'Statutory Deductions', status: 'FAIL' }, { item: 'Leave Entitlements', status: 'FAIL' }],
      missingPolicies: ['Employee Handbook', 'Leave Policy', 'Grievance Policy'],
      assessedAt: new Date(),
      createdBy: royUser.id,
    }
  });

  // 10. Seed Documents
  const docs = [
    { name: 'Employee_Handbook.pdf', type: 'EMPLOYEE_HANDBOOK', empId: null },
    { name: 'Sarah_Employment_Contract.pdf', type: 'EMPLOYMENT_CONTRACT', empId: sarahEmployee.id },
    { name: 'John_Warning_Letter.pdf', type: 'WARNING_LETTER', empId: employees[1].id },
    { name: 'Sarah_Leave_Approval.pdf', type: 'CUSTOM', empId: sarahEmployee.id },
    { name: 'Kevin_Termination_Letter.pdf', type: 'TERMINATION_LETTER', empId: employees[5].id },
  ];

  for (const d of docs) {
    await prisma.document.create({
      data: {
        tenantId: tenant.id,
        companyId: companyA.id,
        employeeId: d.empId,
        title: d.name,
        type: d.type as any,
        status: 'GENERATED',
        pdfUrl: `minio://hrmanager4u/${d.name}`,
        templateData: {},
        generatedBy: managerUser.id,
      }
    });
  }

  // 11. Audit Logs for dashboard
  for (let i = 0; i < 20; i++) {
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: sarahUser.id,
        action: 'LOGIN',
        resource: 'AUTH',
        description: 'User logged in',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Chrome',
        timestamp: new Date(Date.now() - i * 3600000),
      }
    });
  }

  console.log('✅ Roy Demo Tenant Seed Complete!');
  console.log('Credentials:');
  console.log('Roy (Director): roy@demo.hrmanager4u.ai / Demo123!@#');
  console.log('Manager: manager@demo.hrmanager4u.ai / Demo123!@#');
  console.log('Sarah (Employee): sarah@demo.hrmanager4u.ai / Demo123!@#');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
