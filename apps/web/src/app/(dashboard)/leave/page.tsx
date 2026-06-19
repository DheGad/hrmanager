'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Calendar, Check, X, Clock, Filter, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string; jobTitle: string; avatarUrl?: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

const statusConfig = {
  PENDING:   { label: 'Pending',   color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  APPROVED:  { label: 'Approved',  color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  REJECTED:  { label: 'Rejected',  color: 'text-red-400 bg-red-500/15 border-red-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-400 bg-slate-500/15 border-slate-500/30' },
};

const leaveTypeLabels: Record<string, string> = {
  ANNUAL:    'Annual Leave',
  MEDICAL:   'Medical Leave',
  EMERGENCY: 'Emergency Leave',
  MATERNITY: 'Maternity Leave',
  PATERNITY: 'Paternity Leave',
  UNPAID:    'Unpaid Leave',
};

function LeaveCard({ req, onApprove, onReject }: { req: LeaveRequest; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  const status = statusConfig[req.status];
  const name = req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'Unknown Employee';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 hover:border-white/15 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-xs text-slate-500">{req.employee?.jobTitle || 'Employee'}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Leave Type</p>
          <p className="text-xs font-medium text-slate-300">{leaveTypeLabels[req.leaveType] || req.leaveType}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Duration</p>
          <p className="text-xs font-medium text-slate-300">{req.days} day{req.days !== 1 ? 's' : ''}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Dates</p>
          <p className="text-xs font-medium text-slate-300">
            {format(new Date(req.startDate), 'dd MMM')} – {format(new Date(req.endDate), 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      {req.reason && (
        <div className="mt-3 p-3 rounded-lg bg-white/3 border border-white/6">
          <p className="text-xs text-slate-400 leading-relaxed">{req.reason}</p>
        </div>
      )}

      {req.status === 'PENDING' && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onApprove(req.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => onReject(req.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function LeavePage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const qc = useQueryClient();

  const { data: leaveRequests = [], isLoading, error } = useQuery<LeaveRequest[]>({
    queryKey: ['leave-requests', statusFilter],
    queryFn: () => api.get('/leaves', statusFilter !== 'ALL' ? { status: statusFilter } : {}),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/leaves/${id}/approve`, {}),
    onSuccess: () => {
      toast.success('Leave request approved');
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
    },
    onError: () => toast.error('Failed to approve leave request'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/leaves/${id}/reject`, {}),
    onSuccess: () => {
      toast.success('Leave request rejected');
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
    },
    onError: () => toast.error('Failed to reject leave request'),
  });

  const pending = leaveRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage employee leave requests
            {pending > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                <Clock className="w-3 h-3" />{pending} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {s === 'ALL' ? 'All Requests' : statusConfig[s as keyof typeof statusConfig]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-panel p-5 h-48 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-white/6 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/6 rounded" />
                <div className="h-2 bg-white/6 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Unable to load leave requests</p>
          <p className="text-slate-600 text-sm mt-1">The leave management API may not be configured yet.</p>
        </div>
      ) : leaveRequests.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Leave Requests</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {statusFilter === 'PENDING'
              ? 'No pending leave requests. All caught up!'
              : 'No leave requests found for the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leaveRequests.map(req => (
            <LeaveCard
              key={req.id}
              req={req}
              onApprove={(id) => approveMutation.mutate(id)}
              onReject={(id) => rejectMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
