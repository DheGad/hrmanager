import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface DashboardMetrics {
  // Flat fields (aligned with backend response)
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  pendingApprovals: number;
  aiQueriesToday: number;
  documentsGenerated: number;
  expiringDocuments: number;
  // Nested (also available for backward compat)
  headcount?: { total: number; new: number };
  leaves?: { active: number; pending: number };
  ai?: { queries: number };
}

export interface ComplianceScore {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  missingPolicies: string[];
  checklist?: Array<{ item: string; status: 'PASS' | 'FAIL'; evidence?: string }>;
}

export interface PendingApproval {
  id: string;
  type: 'LEAVE' | 'PROMOTION' | 'DOCUMENT' | 'EXPENSE' | 'RECRUITMENT';
  status: string;
  requesterId: string;
  requester?: { firstName: string; lastName: string; jobTitle: string; avatarUrl?: string };
  targetResource: string;
  targetId: string;
  createdAt: string;
  slaDeadline?: string;
}

export interface ExpiringDocument {
  id: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string };
  category: string;
  title: string;
  expiryDate: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  userEmail?: string;
  timestamp: string;
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => api.get('/analytics/dashboard'),
    refetchInterval: 60_000,
    select: (data: any) => {
      // Normalise both flat and nested backend shapes
      return {
        totalEmployees: data.totalEmployees ?? data.headcount?.total ?? 0,
        activeEmployees: data.activeEmployees ?? data.headcount?.total ?? 0,
        newHiresThisMonth: data.newHiresThisMonth ?? data.headcount?.new ?? 0,
        terminationsThisMonth: data.terminationsThisMonth ?? 0,
        pendingApprovals: data.pendingApprovals ?? 0,
        aiQueriesToday: data.aiQueriesToday ?? data.ai?.queries ?? 0,
        documentsGenerated: data.documentsGenerated ?? data.documents ?? 0,
        expiringDocuments: data.expiringDocuments ?? 0,
        headcount: data.headcount,
        leaves: data.leaves,
        ai: data.ai,
      };
    },
  });
}

export function useComplianceScore(companyId?: string) {
  return useQuery<ComplianceScore>({
    queryKey: ['compliance', 'score', companyId],
    // FIXED: correct URL matches backend route /compliance/:companyId/score
    queryFn: () => api.get(`/compliance/${companyId}/score`),
    enabled: !!companyId,
  });
}

export function usePendingApprovals() {
  return useQuery<PendingApproval[]>({
    queryKey: ['analytics', 'pending-approvals'],
    // FIXED: use /analytics/pending-approvals (real endpoint) instead of /workflows/pending
    queryFn: () => api.get('/analytics/pending-approvals'),
    refetchInterval: 30_000,
    select: (data: any) => Array.isArray(data) ? data : [],
  });
}

export function useExpiringDocuments(days = 30) {
  // /vault/expiring does not exist — return empty array gracefully
  return useQuery<ExpiringDocument[]>({
    queryKey: ['vault', 'expiring', days],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useRecentAuditEvents(limit = 10) {
  return useQuery<AuditEvent[]>({
    queryKey: ['audit', 'recent', limit],
    // FIXED: use /audit/recent (new endpoint added to audit controller)
    queryFn: () => api.get('/audit/recent', { limit }),
    refetchInterval: 60_000,
    select: (data: any) => {
      // Handle both array and paginated response
      const items = Array.isArray(data) ? data : data?.data ?? [];
      return items.map((log: any) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        description: log.description || `${log.action} on ${log.resource}`,
        severity: log.severity || 'INFO',
        userEmail: log.userEmail || log.userId,
        timestamp: log.timestamp || log.createdAt,
      }));
    },
  });
}
