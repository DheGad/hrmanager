import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface WorkflowInstance {
  id: string;
  type: 'LEAVE' | 'PROMOTION' | 'DOCUMENT' | 'EXPENSE' | 'RECRUITMENT' | 'CUSTOM';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'CANCELLED';
  currentLevel: number;
  targetResource: string;
  targetId: string;
  requesterId: string;
  requester?: { firstName: string; lastName: string; avatarUrl?: string; jobTitle: string };
  createdAt: string;
  updatedAt: string;
  slaDeadline?: string;
  template?: { steps: Array<{ level: number; approverRole: string; timeoutHours: number }> };
  logs?: WorkflowStepLog[];
}

export interface WorkflowStepLog {
  id: string;
  level: number;
  status: string;
  approverId: string;
  approver?: { firstName: string; lastName: string };
  comments?: string;
  actionAt: string;
}

export function usePendingWorkflows() {
  return useQuery<WorkflowInstance[]>({
    queryKey: ['workflows', 'pending'],
    queryFn: () => api.get('/workflows?status=PENDING'),
    refetchInterval: 30_000,
  });
}

export function useWorkflowHistory() {
  return useQuery<WorkflowInstance[]>({
    queryKey: ['workflows', 'history'],
    queryFn: () => api.get('/workflows?status=APPROVED,REJECTED,CANCELLED,ESCALATED'),
  });
}

export function useApproveWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      api.post(`/workflows/${id}/approve`, { comments }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    },
  });
}

export function useRejectWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      api.post(`/workflows/${id}/reject`, { comments }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}
