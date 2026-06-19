import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const leaveType = await prisma.leaveType.findFirst({ where: { name: 'Annual Leave' } });
  console.log('Annual Leave type:', leaveType?.id, leaveType?.name);
  
  // Reset ALL balances for sarah to ensure she has enough
  const sarahEmpId = '86c83d65-b937-49f9-89c1-816eb294d9c0';
  const tenantId = '34d46238-f564-429f-95c6-8301ce538f29';
  
  await prisma.leaveBalance.updateMany({
    where: { employeeId: sarahEmpId },
    data: { totalDays: 30, takenDays: 0, pendingDays: 0 }
  });
  console.log('Reset all balances for Sarah');
  
  const balances = await prisma.leaveBalance.findMany({ where: { employeeId: sarahEmpId } });
  console.log('Updated balances:', JSON.stringify(balances, null, 2));
}

main().finally(() => prisma.$disconnect());
