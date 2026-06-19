import { PrismaClient, Country } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSprint16() {
  console.log('--- Phase 4: Roy Demo Tenant Seeding ---');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'tech-innovators-sdn-bhd' },
    update: {},
    create: {
      name: 'Tech Innovators Sdn Bhd',
      slug: 'tech-innovators-sdn-bhd',
      country: Country.MY,
    }
  });

  const users = [
    { email: 'roy@demo.com', firstName: 'Roy', lastName: 'Director', role: 'COMPANY_ADMIN' },
    { email: 'manager@demo.com', firstName: 'Jane', lastName: 'Manager', role: 'HR_MANAGER' },
    { email: 'sarah@demo.com', firstName: 'Sarah', lastName: 'Employee', role: 'EMPLOYEE' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: {},
      create: {
        email: u.email,
        passwordHash: `hashed_password_for_${u.firstName.toLowerCase()}`,
        firstName: u.firstName,
        lastName: u.lastName,
        tenantId: tenant.id,
        isActive: true,
        role: u.role as any
      }
    });
  }

  // Seed Policies
  const policies = [
    { name: 'Leave Policy', type: 'LEAVE', description: 'Annual and medical leave guidelines.' },
    { name: 'Public Holiday Policy', type: 'HOLIDAY', description: 'Mandatory paid holidays schedule.' },
    { name: 'Notice Periods', type: 'NOTICE', description: 'Termination and resignation notice periods.' }
  ];

  for (const p of policies) {
    await prisma.knowledgeBase.create({
      data: {
        name: p.name,
        type: 'COMPANY_HANDBOOK', // Map to valid enum
        status: 'READY',
        tenantId: tenant.id,
        fileUrl: `/uploads/simulated_${p.type.toLowerCase()}.pdf`,
        fileSize: 1024,
        mimeType: 'application/pdf',
        chunkCount: 1,
        isSystemDocument: false,
        country: Country.MY
      }
    });
  }

  console.log('✅ Tech Innovators Sdn Bhd Demo Tenant Seeded Successfully.');
  console.log('Users created: roy@demo.com, sarah@demo.com, manager@demo.com');
  console.log('Policies configured: Leave Policy, Public Holiday Policy, Notice Periods');
}

seedSprint16()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
