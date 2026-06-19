import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const API_BASE = 'http://localhost:4000/api/v1';
const prisma = new PrismaClient();

async function run() {
  console.log("=== STARTING SPRINT 19 E2E FULL VERIFICATION ===");
  const results: any = {
    authentication: [],
    companySetup: [],
    employeeLifecycle: [],
    aiManager: [],
    compliance: [],
    security: []
  };

  try {
    const email = `roy+${Date.now()}@democorp.my`;
    const password = 'Enterprise123!';
    
    console.log("1. Testing Authentication");
    
    // Register
    let response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName: 'Roy', lastName: 'Demo', tenantName: 'Demo Corp', tenantCountry: 'MY' })
    });
    let data = await response.json();
    results.authentication.push({ step: 'Register', status: response.status, data });
    
    // Login
    response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    data = await response.json();
    results.authentication.push({ step: 'Login', status: response.status, data });
    const token = data?.data?.data?.accessToken || data?.data?.accessToken || data?.accessToken;
    const refreshToken = data?.data?.data?.refreshToken || data?.data?.refreshToken || data?.refreshToken;
    const user = data?.data?.data?.user || data?.data?.user || data?.user;
    
    if (!token) throw new Error("Login failed, no token received");

    // Get Profile (Me)
    response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    data = await response.json();
    results.authentication.push({ step: 'Get Profile', status: response.status, data });

    // Refresh Token
    response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    data = await response.json();
    results.authentication.push({ step: 'Refresh Token', status: response.status, data });

    // MFA Setup
    response = await fetch(`${API_BASE}/auth/mfa/setup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    data = await response.json();
    results.authentication.push({ step: 'MFA Setup', status: response.status, data });

    // MFA Verify (Mock bad token to prove endpoint)
    response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: '000000' })
    });
    data = await response.json();
    results.authentication.push({ step: 'MFA Verify', status: response.status, data });

    // Forgot Password
    response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    data = await response.json();
    results.authentication.push({ step: 'Forgot Password', status: response.status, data });

    // Reset Password (Mock bad token)
    response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'dummy_token', password: 'NewPassword123!' })
    });
    data = await response.json();
    results.authentication.push({ step: 'Reset Password', status: response.status, data });

    console.log("2. Testing Security & RBAC");
    // Analytics Dashboard
    response = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    data = await response.json();
    results.security.push({ step: 'Fetch Analytics Dashboard (RBAC Check)', status: response.status, data });

    console.log("3. Testing Company Setup");
    const tenant = await prisma.tenant.findFirst({ where: { id: user.tenantId } });
    results.companySetup.push({ step: 'Verify Tenant Created', data: tenant });
    
    let company;
    if (tenant) {
      company = await prisma.company.create({
        data: {
          tenantId: tenant.id,
          name: 'Demo Corp HQ',
          industry: 'Technology',
          country: 'MY',
          address: '123 Tech Lane',
          city: 'Kuala Lumpur',
          state: 'Kuala Lumpur',
          postcode: '50000',
          phone: '+60312345678',
          email: 'contact@democorp.my'
        }
      });
      results.companySetup.push({ step: 'Create Company', data: company });
      
      console.log("4. Testing Employee Lifecycle");
      
      // First, create a leave type manually so the API auto-provisions leave balance
      const leaveType = await prisma.leaveType.create({
        data: {
          tenantId: tenant.id,
          name: 'Annual Leave',
          defaultDays: 14
        }
      });

      // Create employee via API instead of raw Prisma query
      response = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          companyId: company.id,
          userId: user.id,
          firstName: 'Roy',
          lastName: 'Demo',
          dateOfBirth: '1990-01-01T00:00:00.000Z',
          gender: 'MALE',
          nationality: 'Malaysian',
          nricPassport: '900101-14-1234',
          personalEmail: email,
          workEmail: email,
          phone: '+60123456789',
          address: '456 Home Street',
          city: 'Petaling Jaya',
          state: 'Selangor',
          postcode: '46000',
          country: 'MY',
          jobTitle: 'HR Director',
          employmentType: 'FULL_TIME',
          employmentStatus: 'PROBATION',
          hireDate: new Date().toISOString(),
          emergencyContactName: 'Jane Demo',
          emergencyContactPhone: '+60123456788',
          emergencyContactRelation: 'Spouse'
        })
      });
      data = await response.json();
      results.employeeLifecycle.push({ step: 'Create Employee', status: response.status, data });
      
      const employee = data?.data?.data || data?.data || data;

      if (employee && employee.id) {
        response = await fetch(`${API_BASE}/lifecycle/${employee.id}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ newStatus: 'ACTIVE', reason: 'Passed probation' })
        });
        data = await response.json();
        results.employeeLifecycle.push({ step: 'Transition Status', status: response.status, data });
      }

      // Leave type was already created above

      response = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          days: 2,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          reason: 'Vacation'
        })
      });
      data = await response.json();
      results.employeeLifecycle.push({ step: 'Apply Leave', status: response.status, data });

      const leaveId = data?.data?.data?.id || data?.data?.id || data?.id;

      // Manager Approval
      if (leaveId) {
        response = await fetch(`${API_BASE}/leaves/${leaveId}/approve`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        data = await response.json();
        results.employeeLifecycle.push({ step: 'Manager Approval', status: response.status, data });
      }
      
      // Wait for audit log to be written asynchronously
      await new Promise(r => setTimeout(r, 1000));
      const logs = await prisma.auditLog.findMany({ where: { tenantId: tenant.id }, take: 5, orderBy: { timestamp: 'desc' } });
      results.employeeLifecycle.push({ step: 'Audit Logs Generated', data: logs });

      console.log("5. Testing AI HR Manager (20 Questions)");
      const questions = [
        "What is the notice period for resignation?",
        "How many days of annual leave am I entitled to?",
        "Is there paid maternity leave?",
        "What are the working hours under the Employment Act?",
        "How is overtime pay calculated?",
        "Can I be fired without a warning letter?",
        "What constitutes serious misconduct?",
        "Are public holidays paid?",
        "How many days of sick leave can I take?",
        "Is hospitalization leave separate from sick leave?",
        "Can my employer deduct my salary for mistakes?",
        "What is the retirement age?",
        "Can I carry forward my annual leave?",
        "What happens if I don't give enough notice period?",
        "Are part-time employees entitled to EPF?",
        "Is there a minimum wage?",
        "What is the policy on sexual harassment?",
        "Do I get paid for working on a rest day?",
        "Can my employer force me to work overtime?",
        "What is the difference between termination and dismissal?"
      ];

      for (let i = 0; i < questions.length; i++) {
        try {
          response = await fetch(`${API_BASE}/ai/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ question: questions[i] })
          });
          data = await response.json();
          results.aiManager.push({ step: `Ask AI HR Question ${i+1}`, question: questions[i], status: response.status, data });
        } catch (err: any) {
          results.aiManager.push({ step: `Ask AI HR Question ${i+1}`, question: questions[i], error: err.message });
        }
      }

      console.log("6. Testing Compliance");
      try {
        // Generate Handbook
        response = await fetch(`${API_BASE}/documents/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            type: 'EMPLOYEE_HANDBOOK',
            format: 'pdf',
            companyId: company.id,
            title: 'Employee Handbook 2026',
            templateData: { country: 'MY' }
          })
        });
        data = await response.json();
        results.compliance.push({ step: 'Generate Handbook', status: response.status, data });

        // Compliance Assessment
        response = await fetch(`${API_BASE}/compliance/${company.id}/assess`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        data = await response.json();
        results.compliance.push({ step: 'Compliance Assessment', status: response.status, data });

        // Compliance Score
        response = await fetch(`${API_BASE}/compliance/${company.id}/score`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        data = await response.json();
        results.compliance.push({ step: 'Compliance Score', status: response.status, data });

      } catch (err: any) {
        results.compliance.push({ step: 'Compliance', error: err.message });
      }
      
      console.log("7. Testing Security (Cross-Tenant Access)");
      // Create a second tenant
      const email2 = `hacker+${Date.now()}@hacker.my`;
      await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email2, password, firstName: 'H', lastName: 'A', tenantName: 'Hacker', tenantCountry: 'MY' })
      });
      let response2 = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email2, password })
      });
      let data2 = await response2.json();
      const hackerToken = data2?.data?.data?.accessToken || data2?.data?.accessToken || data2?.accessToken;
      
      // Hacker tries to access Tenant 1 Analytics
      response = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${hackerToken}` } // Wait, dashboard uses CurrentTenant, which is from token. Cross-tenant access is tested by accessing a specific resource, like Employee.
      });
      
      // Hacker tries to access Employee 1
      if (employee && employee.id) {
        response = await fetch(`${API_BASE}/lifecycle/${employee.id}`, {
          headers: { Authorization: `Bearer ${hackerToken}` }
        });
        data = await response.json();
        results.security.push({ step: 'Cross-Tenant Access (Employee)', status: response.status, data });
      }
    }

    // Logout
    response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ refreshToken })
    });
    data = await response.json();
    results.authentication.push({ step: 'Logout', status: response.status, data });
    
    fs.writeFileSync('e2e-results.json', JSON.stringify(results, null, 2));
    console.log("Verification completed. Results written to e2e-results.json");
    
  } catch (err: any) {
    console.error("Verification failed", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
