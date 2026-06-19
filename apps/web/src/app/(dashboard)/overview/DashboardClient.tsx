'use client';
import { motion } from 'framer-motion';
import {
  Users, ShieldCheck, Clock, AlertTriangle, Bot,
  TrendingUp, CheckCircle, XCircle, AlertCircle, Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import { useAuthStore } from '@/store/auth.store';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import {
  useDashboardMetrics,
  usePendingApprovals,
  useExpiringDocuments,
  useRecentAuditEvents,
  useComplianceScore,
  type PendingApproval,
  type AuditEvent,
} from '@/lib/hooks/useDashboard';
import { useApproveWorkflow, useRejectWorkflow } from '@/lib/hooks/useWorkflow';
import { formatDate, formatRelativeTime, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const } }),
};

const DARK_CHART = {
  grid: { stroke: 'rgba(255,255,255,0.05)' },
  tick: { fill: '#64748b', fontSize: 11 },
  tooltip: { contentStyle: { background: '#1e2a45', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0' } },
};

const leaveData = [
  { month: 'Jul', Annual: 24, Medical: 5, Emergency: 2 },
  { month: 'Aug', Annual: 32, Medical: 8, Emergency: 4 },
  { month: 'Sep', Annual: 45, Medical: 12, Emergency: 5 },
  { month: 'Oct', Annual: 28, Medical: 6, Emergency: 3 },
  { month: 'Nov', Annual: 35, Medical: 9, Emergency: 4 },
  { month: 'Dec', Annual: 52, Medical: 15, Emergency: 8 },
];

function complianceRadial(score: number) {
  return [{ name: 'Score', value: score, fill: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e' }];
}

function approvalTypeBadge(type: string) {
  const map: Record<string, 'info' | 'purple' | 'warning' | 'success' | 'default'> = {
    LEAVE: 'info', PROMOTION: 'purple', DOCUMENT: 'success', EXPENSE: 'warning', RECRUITMENT: 'default',
  };
  return map[type] ?? 'default';
}

function severityConfig(severity: string): { color: string; Icon: any } {
  return {
    INFO:     { color: 'text-indigo-400', Icon: Info },
    WARNING:  { color: 'text-amber-400',  Icon: AlertCircle },
    ERROR:    { color: 'text-rose-400',   Icon: XCircle },
    CRITICAL: { color: 'text-red-500',    Icon: XCircle },
  }[severity] ?? { color: 'text-slate-400', Icon: Info };
}

function SlaBar({ deadline }: { deadline?: string }) {
  if (!deadline) return <span className="text-xs text-slate-500">—</span>;
  const total = 48 * 3600 * 1000;
  const remaining = new Date(deadline).getTime() - Date.now();
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const color = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-slate-500">{Math.max(0, Math.round(remaining / 3600000))}h</span>
    </div>
  );
}

/* ── COMPANY_ADMIN / HR_MANAGER dashboard ──────────────────────────── */
function OperationsDashboard() {
  const { user } = useAuthStore();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: compliance } = useComplianceScore(user?.companyId);
  const { data: approvals = [], isLoading: approvalsLoading } = usePendingApprovals();
  const { data: expiring = [] } = useExpiringDocuments(30);
  const { data: auditEvents = [] } = useRecentAuditEvents(10);
  const approveMutation = useApproveWorkflow();
  const rejectMutation = useRejectWorkflow();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const statCards = [
    { title: 'Total Employees', value: metrics?.totalEmployees ?? 0, icon: Users,        iconColor: 'text-indigo-400',  iconBg: 'bg-indigo-500/10',  trend: 'up' as const },
    { title: 'Compliance Score', value: compliance?.score ?? 0,      icon: ShieldCheck,  iconColor: compliance?.score && compliance.score >= 80 ? 'text-emerald-400' : 'text-amber-400', iconBg: 'bg-emerald-500/10', suffix: '%' },
    { title: 'Pending Approvals', value: metrics?.pendingApprovals ?? 0, icon: Clock,    iconColor: 'text-amber-400',   iconBg: 'bg-amber-500/10',   trend: 'neutral' as const },
    { title: 'Expiring Documents', value: metrics?.expiringDocuments ?? 0, icon: AlertTriangle, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10', trend: 'down' as const },
    { title: 'AI Queries Today', value: metrics?.aiQueriesToday ?? 0, icon: Bot,          iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10' },
  ];

  const approvalColumns = [
    {
      key: 'requester', header: 'Employee',
      cell: (row: PendingApproval) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {row.requester ? `${row.requester.firstName[0]}${row.requester.lastName[0]}` : '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{row.requester ? `${row.requester.firstName} ${row.requester.lastName}` : 'Unknown'}</p>
            <p className="text-xs text-slate-500">{row.requester?.jobTitle}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type',
      cell: (row: PendingApproval) => <Badge variant={approvalTypeBadge(row.type)}>{row.type}</Badge>,
    },
    {
      key: 'createdAt', header: 'Requested',
      cell: (row: PendingApproval) => <span className="text-xs text-slate-400">{formatRelativeTime(row.createdAt)}</span>,
    },
    {
      key: 'slaDeadline', header: 'SLA',
      cell: (row: PendingApproval) => <SlaBar deadline={row.slaDeadline} />,
    },
    {
      key: 'actions', header: '',
      cell: (row: PendingApproval) => (
        <div className="flex items-center gap-1.5">
          {rejectingId === row.id ? (
            <div className="flex items-center gap-1.5">
              <input
                className="input-field text-xs py-1 w-36"
                placeholder="Reason for rejection…"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                aria-label="Rejection reason"
              />
              <button
                className="btn-danger text-xs py-1 px-2"
                onClick={async () => {
                  await rejectMutation.mutateAsync({ id: row.id, comments: rejectComment });
                  toast.success('Request rejected');
                  setRejectingId(null);
                  setRejectComment('');
                }}
              >Confirm</button>
              <button className="btn-secondary text-xs py-1 px-2" onClick={() => setRejectingId(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <button
                className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/25 transition-colors"
                onClick={async () => {
                  await approveMutation.mutateAsync({ id: row.id });
                  toast.success('Request approved');
                }}
                aria-label={`Approve request from ${row.requester?.firstName}`}
              >
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" />Approve
              </button>
              <button
                className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 text-xs font-medium hover:bg-rose-500/25 transition-colors"
                onClick={() => setRejectingId(row.id)}
                aria-label={`Reject request from ${row.requester?.firstName}`}
              >
                <XCircle className="w-3.5 h-3.5 inline mr-1" />Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.title} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <StatCard {...card} loading={metricsLoading} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="lg:col-span-2 glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Leave Statistics — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leaveData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" {...DARK_CHART.grid} />
              <XAxis dataKey="month" tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
              <YAxis tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
              <Tooltip {...DARK_CHART.tooltip} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="Annual"    fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Medical"   fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Emergency" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Compliance Radial */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Compliance Score</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={complianceRadial(compliance?.score ?? 72)} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white font-bold" fontSize={22}>
                  {compliance?.score ?? 72}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {(compliance?.checklist ?? [
              { item: 'Employment Contracts', status: 'PASS' },
              { item: 'Data Protection Policy', status: 'PASS' },
              { item: 'Sexual Harassment Policy', status: 'FAIL' },
              { item: 'Employee Handbook', status: 'PASS' },
            ]).slice(0, 4).map((c: any) => (
              <div key={c.item} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{c.item}</span>
                {c.status === 'PASS'
                  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lower Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
            <a href="/workflows" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
          </div>
          <DataTable
            data={approvals.slice(0, 5)}
            columns={approvalColumns as any}
            loading={approvalsLoading}
            emptyMessage="No pending approvals"
          />
        </motion.div>

        {/* Audit Events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Audit Events</h3>
            <a href="/audit" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auditEvents.length === 0
              ? <p className="text-sm text-slate-500 text-center py-8">No recent events</p>
              : auditEvents.map((event: AuditEvent) => {
                const { color, Icon } = severityConfig(event.severity);
                return (
                  <div key={event.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5', color)}>
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-medium text-white">{event.action}</span> {event.resource}
                        {event.userEmail && <span className="text-slate-500"> by {event.userEmail}</span>}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>

      {/* Expiring Documents Banner */}
      {!bannerDismissed && expiring.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">
                {expiring.length} document{expiring.length > 1 ? 's' : ''} expiring within 30 days
              </span>
            </div>
            <button onClick={() => setBannerDismissed(true)} className="text-amber-500 hover:text-amber-300 text-xs">Dismiss</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {expiring.slice(0, 6).map((doc: any) => (
              <div key={doc.id} className="text-xs bg-amber-500/8 rounded-lg px-3 py-2 border border-amber-500/15">
                <p className="font-medium text-amber-200">{doc.title}</p>
                <p className="text-amber-500 mt-0.5">
                  {doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : '—'} · Exp {formatDate(doc.expiryDate)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── EMPLOYEE self-service dashboard ───────────────────────────────── */
function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-1">Annual Leave Balance</h3>
          <p className="text-3xl font-bold text-white">14 <span className="text-sm text-slate-500">days</span></p>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-1">Medical Leave Balance</h3>
          <p className="text-3xl font-bold text-white">14 <span className="text-sm text-slate-500">days</span></p>
        </div>
      </div>
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-white mb-3">My Pending Requests</h3>
        <p className="text-sm text-slate-500">No pending requests.</p>
      </div>
    </div>
  );
}

/* ── AUDITOR dashboard ─────────────────────────────────────────────── */
function AuditorDashboard() {
  const { data: auditEvents = [] } = useRecentAuditEvents(20);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card p-5">
          <p className="text-sm text-slate-400 mb-1">Audit Events Today</p>
          <p className="text-2xl font-bold text-white">{auditEvents.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length}</p>
        </div>
        <div className="metric-card p-5">
          <p className="text-sm text-slate-400 mb-1">Critical Events</p>
          <p className="text-2xl font-bold text-rose-400">{auditEvents.filter(e => e.severity === 'CRITICAL').length}</p>
        </div>
        <div className="metric-card p-5">
          <p className="text-sm text-slate-400 mb-1">Warnings</p>
          <p className="text-2xl font-bold text-amber-400">{auditEvents.filter(e => e.severity === 'WARNING').length}</p>
        </div>
      </div>
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Audit Trail</h3>
        <DataTable
          data={auditEvents.map(e => ({ ...e }))}
          columns={[
            { key: 'action', header: 'Action', cell: (r: AuditEvent) => <span className="font-mono text-xs text-indigo-300">{r.action}</span> },
            { key: 'resource', header: 'Resource', cell: (r: AuditEvent) => <span className="text-xs text-slate-300">{r.resource}</span> },
            { key: 'userEmail', header: 'User', cell: (r: AuditEvent) => <span className="text-xs text-slate-400">{r.userEmail ?? '—'}</span> },
            { key: 'severity', header: 'Severity', cell: (r: AuditEvent) => {
              const cfg = severityConfig(r.severity);
              return <span className={cn('text-xs font-semibold', cfg.color)}>{r.severity}</span>;
            }},
            { key: 'timestamp', header: 'Time', cell: (r: AuditEvent) => <span className="text-xs text-slate-500">{formatRelativeTime(r.timestamp)}</span> },
          ] as any}
        />
      </div>
    </div>
  );
}

/* ── Root Client Component ─────────────────────────────────────────── */
export function DashboardClient() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === 'EMPLOYEE') return <EmployeeDashboard />;
  if (role === 'AUDITOR')  return <AuditorDashboard />;
  return <OperationsDashboard />;
}
