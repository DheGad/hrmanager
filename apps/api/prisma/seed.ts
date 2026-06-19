import { PrismaClient } from '@prisma/client';
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
  console.log('🌱 Starting Enterprise Seed...');

  const passwordHash = await argon2.hash('Enterprise123!', ARGON2_OPTIONS);

  // ---------------------------------------------------------------------------
  // TENANT A: Demo Manufacturing Sdn Bhd (Malaysia)
  // ---------------------------------------------------------------------------
  const tenantA = await prisma.tenant.upsert({
    where: { slug: 'demo-manufacturing' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Demo Manufacturing Sdn Bhd',
      slug: 'demo-manufacturing',
      plan: 'ENTERPRISE',
      country: 'MY',
      isActive: true,
    },
  });

  const companyA = await prisma.company.upsert({
    where: { id: randomUUID() }, // Prevent duplicate issue if running multiple times without truncate
    update: {},
    create: {
      tenantId: tenantA.id,
      name: 'Demo Manufacturing Headquarters',
      country: 'MY',
      size: 'MEDIUM',
      industry: 'Manufacturing',
      isActive: true,
      address: '123 Jalan Ampang',
      city: 'Kuala Lumpur',
      state: 'Kuala Lumpur',
      postcode: '50450',
      phone: '+60312345678',
      email: 'contact@demomanufacturing.my'
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'superadmin@hrmanager4u.ai', tenantId: tenantA.id } },
    update: {},
    create: {
      tenantId: tenantA.id,
      email: 'superadmin@hrmanager4u.ai',
      passwordHash,
      firstName: 'System',
      lastName: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'admin@demomanufacturing.my', tenantId: tenantA.id } },
    update: {},
    create: {
      tenantId: tenantA.id,
      email: 'admin@demomanufacturing.my',
      passwordHash,
      firstName: 'Ahmad',
      lastName: 'Company Admin',
      role: 'COMPANY_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'hr@demomanufacturing.my', tenantId: tenantA.id } },
    update: {},
    create: {
      tenantId: tenantA.id,
      email: 'hr@demomanufacturing.my',
      passwordHash,
      firstName: 'Siti',
      lastName: 'HR Manager',
      role: 'HR_MANAGER',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'employee@demomanufacturing.my', tenantId: tenantA.id } },
    update: {},
    create: {
      tenantId: tenantA.id,
      email: 'employee@demomanufacturing.my',
      passwordHash,
      firstName: 'Ali',
      lastName: 'Employee',
      role: 'EMPLOYEE',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'auditor@demomanufacturing.my', tenantId: tenantA.id } },
    update: {},
    create: {
      tenantId: tenantA.id,
      email: 'auditor@demomanufacturing.my',
      passwordHash,
      firstName: 'KPMG',
      lastName: 'Auditor',
      role: 'AUDITOR',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Seeded Tenant A: Demo Manufacturing Sdn Bhd');

  // ---------------------------------------------------------------------------
  // TENANT B: EDUK8U Malaysia
  // ---------------------------------------------------------------------------
  const tenantB = await prisma.tenant.upsert({
    where: { slug: 'eduk8u-malaysia' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'EDUK8U Malaysia',
      slug: 'eduk8u-malaysia',
      plan: 'PROFESSIONAL',
      country: 'MY',
      isActive: true,
    },
  });

  const companyB = await prisma.company.upsert({
    where: { id: randomUUID() },
    update: {},
    create: {
      tenantId: tenantB.id,
      name: 'EDUK8U Main Campus',
      country: 'MY',
      size: 'SMALL',
      industry: 'Education',
      isActive: true,
      address: '456 Education Hub',
      city: 'Petaling Jaya',
      state: 'Selangor',
      postcode: '46000',
      phone: '+60387654321',
      email: 'hello@eduk8u.my'
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'admin@eduk8u.my', tenantId: tenantB.id } },
    update: {},
    create: {
      tenantId: tenantB.id,
      email: 'admin@eduk8u.my',
      passwordHash,
      firstName: 'Dr. Roy',
      lastName: 'Company Admin',
      role: 'COMPANY_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'hr@eduk8u.my', tenantId: tenantB.id } },
    update: {},
    create: {
      tenantId: tenantB.id,
      email: 'hr@eduk8u.my',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'HR Manager',
      role: 'HR_MANAGER',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { email: 'employee@eduk8u.my', tenantId: tenantB.id } },
    update: {},
    create: {
      tenantId: tenantB.id,
      email: 'employee@eduk8u.my',
      passwordHash,
      firstName: 'John',
      lastName: 'Teacher',
      role: 'EMPLOYEE',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Seeded Tenant B: EDUK8U Malaysia');

  console.log('🌲 Seed Complete! All passwords set to: Enterprise123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
