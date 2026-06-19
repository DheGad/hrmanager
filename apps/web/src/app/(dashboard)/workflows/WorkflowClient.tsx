'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, Clock, AlertTriangle, History, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePendingWorkflows, useWorkflowHistory, useApproveWorkflow, useRejectWorkflow, type WorkflowInstance } from '@/lib/hooks/useWorkflow';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatRelativeTime, getInitials, cn } from '@/lib/utils';
import { toast } from 'sonner';

type TabKey = 'inbox' | 'history';

const typeVariant: Record<string, 'info' | 'purple' | 'success' | 'warning' | 'default'> = {
  LEAVE: 'info', PROMOTION: 'purple', DOCUMENT: 'success', EXPENSE: 'warning', RECRUITMENT: 'default',
};

const statusVariant: Record<string, 'success' | 'danger' | 'warning' | 'slate'> = {
  APPROVED: 'success', REJECTED: 'danger', ESCALATED: 'warning', CANCELLED: 'slate',
};

function SlaProgress({ deadline }: { deadline?: string }) {
  if (!deadline) return null;
  const totalMs = 48 * 3600 * 1000;
  const remaining = new Date(deadline).getTime() - Date.now();
  const pct = Math.max(0, Math.min(100, (remaining / totalMs) * 100));
  const color = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500';
  const hoursLeft = Math.max(0, Math.floor(remaining / 3600000));
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">SLA Deadline</span>
        <span className={cn('text-xs font-medium', pct < 20 ? 'text-rose-400' : pct < 50 ? 'text-amber-400' : 'text-emerald-400')}>
          {hoursLeft}h remaining
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function WorkflowCard({ workflow, onApprove, onReject }: {
  workflow: WorkflowInstance;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="glass-panel p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {workflow.requester ? getInitials(`${workflow.requester.firstName} ${workflow.requester.lastName}`) : '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {workflow.requester ? `${workflow.requester.firstName} ${workflow.requester.lastName}` : 'Unknown'}
            </p>
            <p className="text-xs text-slate-500">{workflow.requester?.jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={typeVariant[workflow.type] ?? 'default'}>{workflow.type}</Badge>
          {workflow.slaDeadline && new Date(workflow.slaDeadline).getTime() - Date.now() < 2 * 3600000 && (
            <span title="SLA Critical" aria-label="SLA Critical">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white/3 rounded-lg px-3 py-2.5">
        <p className="text-sm text-slate-300">{workflow.targetResource}</p>
        <p className="text-xs text-slate-500 mt-0.5">Requested {formatRelativeTime(workflow.createdAt)} · Level {workflow.currentLevel}</p>
      </div>

      {/* SLA */}
      <SlaProgress deadline={workflow.slaDeadline} />

      {/* Actions */}
      <AnimatePresence>
        {showReject ? (
          <motion.div key="reject-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for rejection…"
              aria-label="Rejection reason"
              rows={2}
              className="input-field resize-none text-sm w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { onReject(workflow.id, reason); setShowReject(false); setReason(''); }}
                disabled={!reason.trim()}
                className="btn-danger flex-1 justify-center disabled:opacity-40"
                aria-label="Confirm rejection"
              >
                Confirm Reject
              </button>
              <button onClick={() => setShowReject(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="action-btns" className="flex gap-2">
            <button
              onClick={() => onApprove(workflow.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              aria-label={`Approve request from ${workflow.requester?.firstName}`}
            >
              <CheckCircle className="w-4 h-4" />Approve
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition-colors"
              aria-label={`Reject request from ${workflow.requester?.firstName}`}
            >
              <XCircle className="w-4 h-4" />Reject
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function WorkflowClient() {
  const [tab, setTab] = useState<TabKey>('inbox');
  const { data: pending = [], isLoading: pendingLoading } = usePendingWorkflows();
  const { data: history = [], isLoading: historyLoading } = useWorkflowHistory();
  const approve = useApproveWorkflow();
  const reject = useRejectWorkflow();

  const handleApprove = async (id: string) => {
    try {
      await approve.mutateAsync({ id });
      toast.success('Request approved successfully');
    } catch {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id: string, comments: string) => {
    try {
      await reject.mutateAsync({ id, comments });
      toast.success('Request rejected');
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const historyColumns = [
    {
      key: 'type', header: 'Type',
      cell: (r: WorkflowInstance) => <Badge variant={typeVariant[r.type] ?? 'default'}>{r.type}</Badge>,
    },
    {
      key: 'requester', header: 'Employee',
      cell: (r: WorkflowInstance) => (
        <span className="text-sm text-white">
          {r.requester ? `${r.requester.firstName} ${r.requester.lastName}` : '—'}
        </span>
      ),
    },
    {
      key: 'targetResource', header: 'Request',
      cell: (r: WorkflowInstance) => <span className="text-sm text-slate-400 truncate max-w-xs block">{r.targetResource}</span>,
    },
    {
      key: 'status', header: 'Status',
      cell: (r: WorkflowInstance) => <Badge variant={statusVariant[r.status] ?? 'slate'}>{r.status}</Badge>,
    },
    {
      key: 'updatedAt', header: 'Completed',
      cell: (r: WorkflowInstance) => <span className="text-xs text-slate-500">{formatRelativeTime(r.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex border-b border-white/8">
        {([
          { key: 'inbox',   label: 'Inbox',   icon: Inbox,   count: pending.length },
          { key: 'history', label: 'History',  icon: History, count: null },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            role="tab"
            aria-selected={tab === t.key}
            className={cn(
              'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-slate-500 hover:text-slate-300'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inbox */}
      {tab === 'inbox' && (
        pendingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel p-4 space-y-3">
                <div className="flex gap-3"><div className="skeleton w-10 h-10 rounded-full" /><div className="space-y-2 flex-1"><div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-20" /></div></div>
                <div className="skeleton h-12 rounded-lg" />
                <div className="skeleton h-1.5 rounded-full" />
                <div className="flex gap-2"><div className="skeleton h-9 flex-1 rounded-lg" /><div className="skeleton h-9 flex-1 rounded-lg" /></div>
              </div>
            ))}
          </div>
        ) : pending.length === 0 ? (
          <EmptyState icon={Inbox} title="Inbox is clear" description="No pending approvals at this time." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {pending.map((wf) => (
                <WorkflowCard key={wf.id} workflow={wf} onApprove={handleApprove} onReject={handleReject} />
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* History */}
      {tab === 'history' && (
        <DataTable
          data={history}
          columns={historyColumns as any}
          loading={historyLoading}
          emptyMessage="No completed workflows found."
        />
      )}
    </div>
  );
}
