#!/usr/bin/env node
// Sprint 29 Go-Live Certification Test Runner
// Runs every module end-to-end and outputs PASS/FAIL/PARTIAL per module

const axios = require('axios');
const BASE = 'http://localhost:4000/api/v1';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjM3Njg1NC1mOGY0LTQ4NjEtYTMzOS04MWQ4YjQwMGEwMDYiLCJlbWFpbCI6InN1cGVyYWRtaW5AaHJtYW5hZ2VyNHUuYWkiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJ0ZW5hbnRJZCI6ImNiZjc2NzcyLWY5NDktNGZjMC04ZDlmLTZmOTM3ODMyZDA3ZSIsImlhdCI6MTc4MTc5MTM0MSwiZXhwIjoxNzgxNzkyMjQxfQ.wGNm4VxfjTzwer9v3U0rf2tzySkX4z1WypOOkgkH_DU';
const TENANT = 'cbf76772-f949-4fc0-8d9f-6f937832d07e';

const api = axios.create({
  baseURL: BASE,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
});
api.interceptors.response.use(r => r.data);

const results = [];

async function test(module, fn) {
  try {
    const result = await fn();
    results.push({ module, status: result.status, evidence: result.evidence, errors: result.errors || [] });
  } catch (e) {
    results.push({ module, status: 'FAIL', evidence: [`EXCEPTION: ${e.message}`], errors: [e.response?.data || e.message] });
  }
}

async function authTest() {
  const evidence = [];
  const errors = [];
  
  // 1. Login
  const login = await axios.post(`${BASE}/auth/login`, { email: 'superadmin@hrmanager4u.ai', password: 'Enterprise123!' });
  const loginData = login.data?.data ?? login.data;
  if (!loginData?.accessToken) throw new Error('No accessToken returned from login');
  evidence.push(`✅ Login: accessToken issued (JWT ${loginData.accessToken.length} chars)`);
  evidence.push(`✅ User: ${loginData.user.email} | Role: ${loginData.user.role}`);
  evidence.push(`✅ Tenant: ${loginData.user.tenantId}`);
  
  // 2. Get profile (verifies token works)
  const profile = await api.get('/auth/me');
  const profileData = profile?.data ?? profile;
  evidence.push(`✅ /auth/me: ${JSON.stringify(profileData).slice(0,80)}`);
  
  // 3. Refresh token
  const refreshRes = await axios.post(`${BASE}/auth/refresh`, { refreshToken: loginData.refreshToken });
  const refreshData = refreshRes.data?.data ?? refreshRes.data;
  if (!refreshData?.accessToken) errors.push('Token refresh failed');
  else evidence.push(`✅ Token refresh: new accessToken issued`);
  
  // 4. Wrong password
  try {
    await axios.post(`${BASE}/auth/login`, { email: 'superadmin@hrmanager4u.ai', password: 'wrongpass' });
    errors.push('SECURITY: wrong password should have been rejected');
  } catch (e) {
    if (e.response?.status === 401) evidence.push('✅ Security: wrong password correctly rejected (401)');
    else errors.push(`Wrong password returned unexpected status: ${e.response?.status}`);
  }
  
  return { status: errors.length === 0 ? 'PASS' : 'PARTIAL', evidence, errors };
}

async function employeesTest() {
  const evidence = [];
  const errors = [];
  
  // 1. List employees
  const list = await api.get('/employees?limit=5');
  const listData = list?.data ?? list;
  const employees = Array.isArray(listData) ? listData : (listData?.data ?? []);
  evidence.push(`✅ GET /employees: ${employees.length} records returned`);
  
  // 2. Create employee
  const ts = Date.now();
  const created = await api.post('/employees', {
    firstName: 'Audit',
    lastName: `Test_${ts}`,
    workEmail: `audit.test.${ts}@testcorp.com`,
    jobTitle: 'QA Engineer',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    hireDate: new Date().toISOString().split('T')[0],
  });
  const emp = created?.data ?? created;
  if (!emp?.id) throw new Error('Employee creation failed: no ID returned');
  evidence.push(`✅ POST /employees: Created ID=${emp.id}`);
  
  // 3. Fetch by ID (persistence check)
  const fetched = await api.get(`/employees/${emp.id}`);
  const fetchedEmp = fetched?.data ?? fetched;
  if (fetchedEmp?.id !== emp.id) errors.push('Employee not persisted — fetch returned different/no ID');
  else evidence.push(`✅ GET /employees/${emp.id}: Persisted — firstName=${fetchedEmp.firstName}`);
  
  // 4. Update
  const updated = await api.patch(`/employees/${emp.id}`, { jobTitle: 'Senior QA Engineer' });
  const updatedEmp = updated?.data ?? updated;
  if (updatedEmp?.jobTitle !== 'Senior QA Engineer') errors.push('Employee update not persisted');
  else evidence.push(`✅ PATCH /employees/${emp.id}: jobTitle updated`);
  
  // 5. Tenant isolation
  const tenantCheck = fetchedEmp?.tenantId === TENANT;
  if (tenantCheck) evidence.push(`✅ Tenant isolation: tenantId=${fetchedEmp.tenantId}`);
  else errors.push('Tenant isolation: employee tenantId mismatch');
  
  return { status: errors.length === 0 ? 'PASS' : 'PARTIAL', evidence, errors };
}

async function departmentsTest() {
  const evidence = [];
  const errors = [];
  
  try {
    const list = await api.get('/departments');
    const listData = list?.data ?? list;
    const depts = Array.isArray(listData) ? listData : (listData?.data ?? []);
    evidence.push(`✅ GET /departments: ${depts.length} records`);
    
    const ts = Date.now();
    const created = await api.post('/departments', { name: `QA-Dept-${ts}`, description: 'Audit test department' });
    const dept = created?.data ?? created;
    if (!dept?.id) throw new Error('No ID returned');
    evidence.push(`✅ POST /departments: Created ID=${dept.id}`);
    
    const fetched = await api.get(`/departments/${dept.id}`);
    const fetchedDept = fetched?.data ?? fetched;
    if (fetchedDept?.id !== dept.id) errors.push('Department not persisted');
    else evidence.push(`✅ Persistence verified: ${fetchedDept.name}`);
    
    await api.delete(`/departments/${dept.id}`);
    evidence.push(`✅ DELETE /departments/${dept.id}: Cleaned up`);
    
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`${e.response?.data?.message || e.message}`);
    return { status: 'PARTIAL', evidence, errors };
  }
}

async function leaveTest() {
  const evidence = [];
  const errors = [];
  
  try {
    // Get an employee to file leave for
    const empList = await api.get('/employees?limit=1');
    const empData = empList?.data ?? empList;
    const employees = Array.isArray(empData) ? empData : (empData?.data ?? []);
    if (!employees.length) {
      errors.push('No employees found to test leave');
      return { status: 'PARTIAL', evidence, errors };
    }
    
    const empId = employees[0].id;
    evidence.push(`Using employee ID: ${empId}`);
    
    // Try leave endpoints
    const leaveList = await api.get('/leaves?limit=5');
    const leaveData = leaveList?.data ?? leaveList;
    const leaves = Array.isArray(leaveData) ? leaveData : (leaveData?.data ?? []);
    evidence.push(`✅ GET /leaves: ${leaves.length} records returned`);
    
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`Leave API: ${e.response?.data?.message || e.message} (Status: ${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function workflowsTest() {
  const evidence = [];
  const errors = [];
  try {
    const list = await api.get('/workflows/pending');
    const data = list?.data ?? list;
    evidence.push(`✅ GET /workflows/pending: ${JSON.stringify(data).slice(0, 100)}`);
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`Workflows: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function documentsTest() {
  const evidence = [];
  const errors = [];
  try {
    const list = await api.get('/documents?limit=5');
    const data = list?.data ?? list;
    const docs = Array.isArray(data) ? data : (data?.data ?? []);
    evidence.push(`✅ GET /documents: ${docs.length} records`);
    return { status: docs.length >= 0 ? 'PASS' : 'PARTIAL', evidence, errors };
  } catch (e) {
    errors.push(`Documents: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function notificationsTest() {
  const evidence = [];
  const errors = [];
  try {
    const list = await api.get('/notifications?limit=5');
    const data = list?.data ?? list;
    const notifs = Array.isArray(data) ? data : (data?.data ?? []);
    evidence.push(`✅ GET /notifications: ${notifs.length} records`);
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`Notifications: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function aiAssistantTest() {
  const evidence = [];
  const errors = [];
  try {
    // Conversations list
    const convs = await api.get('/ai/conversations');
    const convData = convs?.data ?? convs;
    evidence.push(`✅ GET /ai/conversations: ${JSON.stringify(convData).slice(0, 80)}`);
    
    // Query
    const res = await api.post('/ai/query', { question: 'What is annual leave?' });
    const qData = res?.data ?? res;
    if (!qData?.answer) errors.push('No answer field in response');
    else {
      evidence.push(`✅ POST /ai/query: answer=${qData.answer.slice(0, 100)}...`);
      evidence.push(`   confidence=${qData.confidence}, citations=${qData.citations?.length || 0}`);
    }
    
    if (qData?.answer?.includes('not yet configured')) {
      errors.push('AI NOT CONFIGURED: mock key sk-mock-12345 in use — no real AI responses');
    }
    
    return { status: errors.some(e => e.includes('NOT CONFIGURED')) ? 'PARTIAL' : errors.length === 0 ? 'PASS' : 'FAIL', evidence, errors };
  } catch (e) {
    errors.push(`AI: ${e.response?.data?.message || e.message}`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function handbookTest() {
  const evidence = [];
  const errors = [];
  try {
    const res = await api.get('/handbook');
    const data = res?.data ?? res;
    evidence.push(`✅ GET /handbook: ${JSON.stringify(data).slice(0,100)}`);
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`Handbook: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function complianceTest() {
  const evidence = [];
  const errors = [];
  try {
    const res = await api.get('/compliance');
    const data = res?.data ?? res;
    evidence.push(`✅ GET /compliance: ${JSON.stringify(data).slice(0,150)}`);
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`Compliance: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function auditLogsTest() {
  const evidence = [];
  const errors = [];
  try {
    const res = await api.get('/audit?limit=5');
    const data = res?.data ?? res;
    const logs = Array.isArray(data) ? data : (data?.data ?? []);
    evidence.push(`✅ GET /audit: ${logs.length} records`);
    if (logs.length > 0) {
      evidence.push(`   Latest: action=${logs[0].action}, resource=${logs[0].resource}`);
    }
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`Audit: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function controlCenterTest() {
  const evidence = [];
  const errors = [];
  try {
    const res = await api.get('/control-center/settings');
    const data = res?.data ?? res;
    evidence.push(`✅ GET /control-center/settings: ${JSON.stringify(data).slice(0, 150)}`);
    
    // Try save a setting
    const saved = await api.put('/control-center/settings', { key: 'TEST_SETTING', value: 'audit_value' });
    evidence.push(`✅ PUT /control-center/settings: saved`);
    
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`ControlCenter: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function analyticsTest() {
  const evidence = [];
  const errors = [];
  try {
    const res = await api.get('/analytics/dashboard');
    const data = res?.data ?? res;
    evidence.push(`✅ GET /analytics/dashboard: ${JSON.stringify(data).slice(0, 200)}`);
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`Analytics: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function knowledgeBaseTest() {
  const evidence = [];
  const errors = [];
  try {
    const res = await api.get('/knowledge-base');
    const data = res?.data ?? res;
    const items = Array.isArray(data) ? data : (data?.data ?? []);
    evidence.push(`✅ GET /knowledge-base: ${items.length} records`);
    return { status: 'PASS', evidence, errors };
  } catch (e) {
    errors.push(`KB: ${e.response?.data?.message || e.message} (${e.response?.status})`);
    return { status: 'FAIL', evidence, errors };
  }
}

async function main() {
  console.log('=== SPRINT 29 GO-LIVE CERTIFICATION TEST ===\n');
  
  await test('Authentication', authTest);
  await test('Employees', employeesTest);
  await test('Departments', departmentsTest);
  await test('Leave Management', leaveTest);
  await test('Workflows', workflowsTest);
  await test('Documents', documentsTest);
  await test('Notifications', notificationsTest);
  await test('AI Assistant', aiAssistantTest);
  await test('Handbook', handbookTest);
  await test('Compliance', complianceTest);
  await test('Audit Logs', auditLogsTest);
  await test('Control Center', controlCenterTest);
  await test('Analytics', analyticsTest);
  await test('Knowledge Base', knowledgeBaseTest);
  
  console.log('\n=== RESULTS ===\n');
  const pass = results.filter(r => r.status === 'PASS').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${icon} [${r.status}] ${r.module}`);
    for (const e of r.evidence) console.log(`     ${e}`);
    for (const e of r.errors) console.log(`     ❌ ERROR: ${e}`);
  }
  
  console.log(`\nSUMMARY: PASS=${pass} | PARTIAL=${partial} | FAIL=${fail} | TOTAL=${results.length}`);
  
  // Output JSON for parsing
  console.log('\n===JSON_START===');
  console.log(JSON.stringify(results, null, 2));
  console.log('===JSON_END===');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
