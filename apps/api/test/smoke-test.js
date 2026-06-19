const http = require('http');

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1' + path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    
    const start = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const time = Date.now() - start;
        let parsed = data;
        try { parsed = JSON.parse(data); } catch(e) {}
        resolve({ status: res.statusCode, time, data: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Running Enterprise Sprint 8 Smoke Tests\\n');
  const results = [];

  // 1. Auth
  const loginRes = await request('POST', '/auth/login', { email: 'admin@demomanufacturing.my', password: 'Enterprise123!' });
  results.push({ Endpoint: 'POST /auth/login', Status: loginRes.status, Time: loginRes.time + 'ms' });
  const token = loginRes.data?.data?.accessToken || loginRes.data?.data?.data?.accessToken;
  
  if (!token) {
    console.error('Failed to get token, aborting.');
    console.table(results);
    return;
  }

  // 2. Leaves
  const leavesGet = await request('GET', '/leaves', null, token);
  results.push({ Endpoint: 'GET /leaves', Status: leavesGet.status, Time: leavesGet.time + 'ms' });

  // 3. Workflows
  const workflowsGet = await request('GET', '/workflows', null, token);
  results.push({ Endpoint: 'GET /workflows', Status: workflowsGet.status, Time: workflowsGet.time + 'ms' });

  // 4. AI Assistant
  const aiCreate = await request('POST', '/ai/conversations', { title: 'Smoke Test' }, token);
  results.push({ Endpoint: 'POST /ai/conversations', Status: aiCreate.status, Time: aiCreate.time + 'ms' });

  const { execSync } = require('child_process');
  let companyId = 'company-1';
  try {
    const output = execSync('docker compose exec -T postgres psql -U hrmanager -d hrmanager4u -t -c "SELECT id FROM companies LIMIT 1;"', { cwd: '/Users/DEERU/.gemini/antigravity/scratch/hrmanager4u' });
    companyId = output.toString().trim();
  } catch (e) {
    console.error('Failed to get companyId from DB');
  }

  // 5. Document Engine
  const docGen = await request('POST', '/documents/generate', { 
    companyId: companyId, type: 'OFFER_LETTER', title: 'Test', format: 'pdf', templateData: {} 
  }, token);
  results.push({ Endpoint: 'POST /documents/generate', Status: docGen.status, Time: docGen.time + 'ms' });

  // 6. Handbook Wizard
  const handbookGet = await request('GET', '/handbooks/defaults?country=MY', null, token);
  results.push({ Endpoint: 'GET /handbooks/defaults', Status: handbookGet.status, Time: handbookGet.time + 'ms' });

  // 7. Compliance Engine
  const complianceAnalyze = await request('POST', '/compliance/analyze', {
    country: 'MY', documents: [{ type: 'DATA_PROTECTION_POLICY' }]
  }, token);
  results.push({ Endpoint: 'POST /compliance/analyze', Status: complianceAnalyze.status, Time: complianceAnalyze.time + 'ms' });

  console.table(results);
}

runTests().catch(console.error);
