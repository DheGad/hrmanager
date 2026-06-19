import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

const API_URL = 'http://127.0.0.1:4000/api/v1';
const REPORT_DIR = path.join(process.cwd(), '../../brain/0f281f84-6e97-478a-bf1d-37cce2ee6cf5');

async function generateReport(filename: string, title: string, results: any[]) {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  let content = `# ${title}\nDate: ${new Date().toISOString()}\n\n`;
  for (const res of results) {
    content += `## ${res.name}\n`;
    content += `**Status:** ${res.status}\n`;
    content += `**Evidence:**\n\`\`\`json\n${JSON.stringify(res.evidence, null, 2)}\n\`\`\`\n\n`;
  }
  fs.writeFileSync(`/Users/DEERU/.gemini/antigravity/brain/0f281f84-6e97-478a-bf1d-37cce2ee6cf5/${filename}`, content);
}

async function run() {
  const prisma = new PrismaClient();
  const p1Results = [];
  const p2Results = [];
  const p3Results = [];
  const p4Results = [];
  const p5Results = [];
  try {
    
    // Seed SUPER_ADMIN if missing
    let saUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!saUser) {
      const tenant = await prisma.tenant.findFirst();
      if (tenant) {
        saUser = await prisma.user.create({
          data: {
            tenantId: tenant.id,
            email: 'superadmin@hrmanager4u.ai',
            passwordHash: await argon2.hash('Enterprise123!', { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 }),
            firstName: 'System',
            lastName: 'Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true
          }
        });
      }
    }

    console.log('--- PHASE 1: USER JOURNEY AUDIT ---');
    
    // Test Super Admin
    const saLogin = await axios.post(`${API_URL}/auth/login`, { email: 'superadmin@hrmanager4u.ai', password: 'Enterprise123!' }, { validateStatus: () => true });
    p1Results.push({ name: 'SUPER_ADMIN Login', status: saLogin.status === 200 ? 'PASS' : 'FAIL', evidence: saLogin.data });
    
    // Test Roy (COMPANY_ADMIN)
    const royLogin = await axios.post(`${API_URL}/auth/login`, { email: 'roy@demo.hrmanager4u.ai', password: 'Demo123!@#' }, { validateStatus: () => true });
    const royToken = royLogin.data?.data?.data?.accessToken || royLogin.data?.data?.accessToken || royLogin.data?.accessToken;
    p1Results.push({ name: 'COMPANY_ADMIN (Roy) Login', status: royToken ? 'PASS' : 'FAIL', evidence: royLogin.data });
    
    const royAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${royToken}` }, validateStatus: () => true });
    const royProfile = await royAxios.get('/auth/me');
    const royRole = royProfile.data?.data?.data?.role || royProfile.data?.data?.role;
    p1Results.push({ name: 'COMPANY_ADMIN Profile & Role', status: royRole === 'COMPANY_ADMIN' ? 'PASS' : 'FAIL', evidence: royProfile.data });

    // Test Sarah (EMPLOYEE)
    const sarahLogin = await axios.post(`${API_URL}/auth/login`, { email: 'sarah@demo.hrmanager4u.ai', password: 'Demo123!@#' }, { validateStatus: () => true });
    const sarahToken = sarahLogin.data?.data?.data?.accessToken || sarahLogin.data?.data?.accessToken || sarahLogin.data?.accessToken;
    p1Results.push({ name: 'EMPLOYEE (Sarah) Login', status: sarahToken ? 'PASS' : 'FAIL', evidence: sarahLogin.data });
    
    const sarahAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${sarahToken}` }, validateStatus: () => true });
    const sarahProfile = await sarahAxios.get('/auth/me');
    const sarahRole = sarahProfile.data?.data?.data?.role || sarahProfile.data?.data?.role;
    p1Results.push({ name: 'EMPLOYEE Profile & Role', status: sarahRole === 'EMPLOYEE' ? 'PASS' : 'FAIL', evidence: sarahProfile.data });

    // Test Manager (HR_MANAGER)
    const mgrLogin = await axios.post(`${API_URL}/auth/login`, { email: 'manager@demo.hrmanager4u.ai', password: 'Demo123!@#' }, { validateStatus: () => true });
    const mgrToken = mgrLogin.data?.data?.data?.accessToken || mgrLogin.data?.data?.accessToken || mgrLogin.data?.accessToken;
    p1Results.push({ name: 'HR_MANAGER Login', status: mgrToken ? 'PASS' : 'FAIL', evidence: mgrLogin.data });
    const mgrAxios = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${mgrToken}` }, validateStatus: () => true });

    console.log('--- PHASE 2: EMPLOYEE LIFECYCLE ---');
    const sarahUserId = sarahProfile.data?.data?.data?.id || sarahProfile.data?.data?.id;
    const sarahEmployee = await prisma.employee.findFirst({ where: { userId: sarahUserId } });
    const companyId = sarahEmployee?.companyId;

    // Create Employee
    const newEmp = await royAxios.post('/employees', {
      firstName: 'New',
      lastName: 'Hire',
      dateOfBirth: '1990-01-01T00:00:00Z',
      employeeNumber: 'EMP-9999',
      gender: 'MALE',
      nationality: 'Malaysian',
      nricPassport: '123456-78-9012',
      personalEmail: 'personal@gmail.com',
      workEmail: 'new_hire@demo.hrmanager4u.ai',
      phone: '+60123456789',
      address: '123 Tech Park',
      city: 'Kuala Lumpur',
      state: 'KL',
      postcode: '50000',
      country: 'MY',
      jobTitle: 'Software Engineer',
      employmentType: 'FULL_TIME',
      hireDate: '2026-01-01T00:00:00Z',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+60123456780',
      emergencyContactRelation: 'Spouse',
      companyId: companyId
    });
    p2Results.push({ name: 'Create Employee', status: (newEmp.status === 201 || newEmp.status === 200) ? 'PASS' : 'FAIL', evidence: newEmp.data });

    // Apply Leave
    const leaveType = await prisma.leaveType.findFirst({ where: { name: 'Annual Leave' } });
    if (leaveType && sarahEmployee) {
      const sarahEmpId = sarahEmployee.id;
      const sarahTenantId = sarahEmployee.tenantId;
      // Reset all balances for Sarah to ensure sufficient leave on every run
      await prisma.leaveBalance.updateMany({
        where: { employeeId: sarahEmpId },
        data: { totalDays: 30, takenDays: 0, pendingDays: 0 }
      });
      // Create if not exists
      const balance = await prisma.leaveBalance.findFirst({ where: { employeeId: sarahEmpId, leaveTypeId: leaveType.id, year: new Date().getFullYear() } });
      if (!balance) {
        await prisma.leaveBalance.create({
          data: { tenantId: sarahTenantId, employeeId: sarahEmpId, leaveTypeId: leaveType.id, year: new Date().getFullYear(), totalDays: 30, takenDays: 0, pendingDays: 0 }
        });
      }
      const applyLeave = await sarahAxios.post('/leaves', {
        employeeId: sarahEmpId,
        leaveTypeId: leaveType.id,
        startDate: '2026-09-01',
        endDate: '2026-09-01',
        days: 1,
        reason: 'Holiday'
      });
      p2Results.push({ name: 'Apply Leave (Sarah)', status: applyLeave.status === 201 ? 'PASS' : 'FAIL', evidence: applyLeave.data });
      
      const leaveId = applyLeave.data?.data?.data?.id || applyLeave.data?.data?.id || applyLeave.data?.id;
      if (leaveId) {
        const approveLeave = await mgrAxios.patch(`/leaves/${leaveId}/approve`);
        p2Results.push({ name: 'Approve Leave (Manager)', status: approveLeave.status === 200 ? 'PASS' : 'FAIL', evidence: approveLeave.data });
      } else {
        p2Results.push({ name: 'Approve Leave (Manager)', status: 'FAIL', evidence: 'Leave ID not found' });
      }
    } else {
      p2Results.push({ name: 'Apply/Approve Leave', status: 'FAIL', evidence: 'No LeaveType found' });
    }
    
    console.log('--- PHASE 3: COMPLIANCE ---');
    const company = await prisma.company.findFirst({ where: { name: { contains: 'Tech Innovators' } } });
    const compScore = await royAxios.get(`/compliance/${company?.id}/score`);
    p3Results.push({ name: 'Fetch Compliance Score', status: compScore.status === 200 ? 'PASS' : 'FAIL', evidence: compScore.data });
    
    console.log('--- PHASE 4: DOCUMENT ---');
    const genDoc = await royAxios.post('/documents/generate', {
      type: 'EMPLOYMENT_CONTRACT',
      title: 'Certification Contract',
      companyId: company?.id
    });
    p4Results.push({ name: 'Generate Contract', status: genDoc.status === 201 ? 'PASS' : 'FAIL', evidence: genDoc.data });
    
    console.log('--- PHASE 5: SECURITY ---');
    // Cross tenant read attempt
    const crossTenantGet = await sarahAxios.get('/companies', { headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000000' } });
    const crossDataStr = JSON.stringify(crossTenantGet.data);
    p5Results.push({ 
      name: 'Cross Tenant Read Attempt', 
      status: crossDataStr.includes('00000000-0000-0000-0000-000000000000') ? 'FAIL' : 'PASS', 
      evidence: crossTenantGet.data 
    });
    
    // Role escalation
    const escGet = await sarahAxios.get('/analytics/dashboard');
    p5Results.push({ name: 'Role Escalation Attempt (Sarah accessing Dashboard)', status: escGet.status === 403 ? 'PASS' : 'FAIL', evidence: escGet.data });

    // Unauthorized access
    const unauthGet = await axios.get(`${API_URL}/employees`, { validateStatus: () => true });
    p5Results.push({ name: 'Unauthorized Access Attempt', status: unauthGet.status === 401 ? 'PASS' : 'FAIL', evidence: unauthGet.data });

  } catch (err) {
    console.error('Audit Script Error:', err);
  } finally {
    await prisma.$disconnect();
    
    await generateReport('ROLE_CERTIFICATION_REPORT.md', 'Role Certification Report', p1Results);
    await generateReport('EMPLOYEE_LIFECYCLE_CERTIFICATION.md', 'Employee Lifecycle Certification Report', p2Results);
    await generateReport('COMPLIANCE_CERTIFICATION.md', 'Compliance Certification Report', p3Results);
    await generateReport('DOCUMENT_CERTIFICATION.md', 'Document Certification Report', p4Results);
    await generateReport('SECURITY_CERTIFICATION.md', 'Security Certification Report', p5Results);
    
    console.log('Done generating API audit reports.');
  }
}

run();
