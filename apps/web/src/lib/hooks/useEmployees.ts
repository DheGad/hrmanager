import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  departmentId?: string;
  department?: { id: string; name: string };
  employmentStatus: 'CANDIDATE' | 'ACTIVE' | 'PROBATION' | 'NOTICE_PERIOD' | 'RESIGNED' | 'TERMINATED' | 'RETIRED' | 'ALUMNI';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY';
  hireDate: string;
  probationEndDate?: string;
  confirmationDate?: string;
  avatarUrl?: string;
  isActive: boolean;
  gender?: string;
  nationality?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  managerId?: string;
  manager?: { id: string; firstName: string; lastName: string };
  branchId?: string;
  branch?: { id: string; name: string };
  jobLevel?: string;
  salaryBand?: string;
  noticePeriodDays?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface EmployeeFilters {
  search?: string;
  status?: string;
  departmentId?: string;
  employmentType?: string;
  page?: number;
  limit?: number;
}

export interface EmployeesResponse {
  data: Employee[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery<EmployeesResponse>({
    queryKey: ['employees', filters],
    queryFn: () => api.get('/employees', filters),
  });
}

export function useEmployee(id: string) {
  return useQuery<Employee>({
    queryKey: ['employees', id],
    queryFn: () => api.get(`/employees/${id}`),
    enabled: !!id,
  });
}

export function useEmployeeLifecycle(employeeId: string) {
  return useQuery({
    queryKey: ['employees', employeeId, 'lifecycle'],
    queryFn: () => api.get(`/employees/${employeeId}/lifecycle`),
    enabled: !!employeeId,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Employee>) => api.post('/employees', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) => api.patch(`/employees/${id}`, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['employees', id] });
    },
  });
}

export function useTerminateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/employees/${id}/terminate`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}
