import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/v1';
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use((r) => {
  if (r.data && typeof r.data === 'object' && 'success' in r.data && 'data' in r.data) {
    if ('meta' in r.data) {
      return { data: r.data.data, meta: r.data.meta };
    }
    return r.data.data;
  }
  return r.data;
});

async function run() {
  try {
    const res: any = await apiClient.post('/auth/login', {
      email: "superadmin@hrmanager4u.ai",
      password: "Enterprise123!",
      tenantId: "system"
    });
    console.log("res.accessToken:", res.accessToken);
    console.log("res type:", typeof res);
    console.log("res keys:", Object.keys(res));
  } catch (e: any) {
    console.error("Error:", e.response?.data || e.message);
  }
}
run();
