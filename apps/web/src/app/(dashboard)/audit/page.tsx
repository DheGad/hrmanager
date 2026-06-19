'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FileText, User, Shield, Clock, Filter, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  actorId?: string;
  actor?: { firstName: string; lastName: string; email: string };
  tenantId: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

const actionColors: Record<string, string> = {
  USER_LOGIN: 'text-emerald-400 bg-emerald-500/15',
  USER_LOGOUT: 'text-slate-400 bg-slate-500/15',
  USER_REGISTERED: 'text-indigo-400 bg-indigo-500/15',
  EMPLOYEE_CREATED: 'text-blue-400 bg-blue-500/15',
  EMPLOYEE_UPDATED: 'text-amber-400 bg-amber-500/15',
  EMPLOYEE_TERMINATED: 'text-red-400 bg-red-500/15',
  LEAVE_APPROVED: 'text-emerald-400 bg-emerald-500/15',
  LEAVE_REJECTED: 'text-red-400 bg-red-500/15',
  PASSWORD_RESET: 'text-violet-400 bg-violet-500/15',
  AI_QUERY: 'text-cyan-400 bg-cyan-500/15',
  AI_QUERY_SYNC: 'text-cyan-400 bg-cyan-500/15',
};

function formatAction(action: string) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export default function AuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<{ data: AuditLog[]; meta: { total: number; totalPages: number } }>({
    queryKey: ['audit-logs', page],
    queryFn: () => api.get('/audit', { page, limit: 25 }),
  });

  const logs = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable record of all system activities — {meta.total.toLocaleString()} total events
          </p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-24 h-5 bg-white/10 rounded" />
                <div className="flex-1 h-4 bg-white/6 rounded" />
                <div className="w-20 h-4 bg-white/6 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Unable to load audit logs</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Audit Events</h3>
            <p className="text-slate-500 text-sm">Audit events will appear here as users interact with the system.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[140px_1fr_180px_120px] gap-4 px-4 py-2.5 border-b border-white/6">
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Action</p>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Description</p>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Actor</p>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Time</p>
            </div>

            <div className="divide-y divide-white/5">
              {logs.map(log => {
                const colorClass = actionColors[log.action] ?? 'text-slate-400 bg-slate-500/15';
                const actorName = log.actor
                  ? `${log.actor.firstName} ${log.actor.lastName}`
                  : 'System';

                return (
                  <div key={log.id} className="grid md:grid-cols-[140px_1fr_180px_120px] gap-4 px-4 py-3.5 hover:bg-white/2 transition-colors items-center">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${colorClass}`}>
                        {formatAction(log.action)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-300 truncate">
                        {log.description || `${formatAction(log.action)} on ${log.resource}`}
                      </p>
                      {log.resourceId && (
                        <p className="text-[11px] text-slate-600 font-mono truncate mt-0.5">{log.resource} • {log.resourceId.slice(0, 8)}…</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-400 truncate">{actorName}</p>
                    </div>
                    <p className="text-xs text-slate-600">{formatRelativeTime(log.createdAt)}</p>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/6">
                <p className="text-xs text-slate-600">Page {page} of {meta.totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={page >= meta.totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
