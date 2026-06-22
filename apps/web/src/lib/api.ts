import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
  timeout: 15000,
});

// Request interceptor — inject access token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 with token refresh
apiClient.interceptors.response.use(
  (r) => {
    // Backend wraps success responses in { success: true, data: T, ... }
    if (r.data && typeof r.data === 'object' && 'success' in r.data && 'data' in r.data) {
      if ('meta' in r.data) {
        return { data: r.data.data, meta: r.data.meta };
      }
      return r.data.data;
    }
    return r.data;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        // axios.post does not go through the above response interceptor, so we must unwrap manually
        const payload = res.data && res.data.data ? res.data.data : res.data;
        const newToken = payload.accessToken;
        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Convenience methods
export const api = {
  get: <T>(url: string, params?: object) => apiClient.get<T, T>(url, { params }),
  post: <T>(url: string, data?: object) => apiClient.post<T, T>(url, data),
  put: <T>(url: string, data?: object) => apiClient.put<T, T>(url, data),
  patch: <T>(url: string, data?: object) => apiClient.patch<T, T>(url, data),
  delete: <T>(url: string) => apiClient.delete<T, T>(url),
  postForm: <T>(url: string, data: FormData) =>
    apiClient.post<T, T>(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
