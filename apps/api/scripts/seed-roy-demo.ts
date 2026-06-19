import { PrismaClient, Country } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoyDemo() {
  console.log('Seeding Roy Demo Package...');

  // Create Tech Innovators Inc.
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'tech-innovators' },
    update: {},
    create: {
      name: 'Tech Innovators Inc.',
      slug: 'tech-innovators',
      country: Country.MY,
    }
  });

  // Create Users
  const hrDirector = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'roy@techinnovators.com' } },
    update: {},
    create: {
      email: 'roy@techinnovators.com',
      passwordHash: 'hashed_password_for_roy',
      firstName: 'Roy',
      lastName: 'Director',
      tenantId: tenant.id,
      isActive: true,
    }
  });

  const employee = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'sarah@techinnovators.com' } },
    update: {},
    create: {
      email: 'sarah@techinnovators.com',
      passwordHash: 'hashed_password_for_sarah',
      firstName: 'Sarah',
      lastName: 'Employee',
      tenantId: tenant.id,
      isActive: true,
    }
  });

  console.log('Demo Tenant and Users Seeded!');
  console.log('HR Director:', hrDirector.email);
  console.log('Employee:', employee.email);
}

seedRoyDemo()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
