import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function resetAll() {
  const hash = await argon2.hash('Demo123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.user.updateMany({
    data: { passwordHash: hash }
  });
  console.log('All passwords reset to Demo123!');
}

resetAll().finally(() => prisma.$disconnect());
