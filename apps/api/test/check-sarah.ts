import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'sarah@demo.hrmanager4u.ai' }, include: { employee: true } });
  console.log('Sarah user:', user?.email, user?.employee?.id);
  if (user?.employee) {
    const balances = await prisma.leaveBalance.findMany({ where: { employeeId: user.employee.id } });
    console.log('Sarah leave balances:', JSON.stringify(balances, null, 2));
  }
}

main().finally(() => prisma.$disconnect());
