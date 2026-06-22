import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function fix() {
  console.log('Fixing passwords...');
  const hash = await argon2.hash('Demo123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const updated = await prisma.user.updateMany({
    where: { email: { in: ['roy@techinnovators.com', 'sarah@techinnovators.com'] } },
    data: { passwordHash: hash }
  });

  console.log(`Updated ${updated.count} users with password 'Demo123!'`);
}

fix().finally(() => prisma.$disconnect());
