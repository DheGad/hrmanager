'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { Users, UserPlus, UserMinus, TrendingDown, BarChart3, Shield, Bot } from 'lucide-react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';
import { subDays, subMonths, format } from 'date-fns';

type TabKey = 'workforce' | 'leave' | 'compliance' | 'ai';
type RangeKey = '30d' | '90d' | '6m' | '1y';

const DARK_CHART = {
  grid: { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 3' },
  tick: { fill: '#64748b', fontSize: 11 },
  tooltip: {
    contentStyle: { background: '#1e2a45', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 },
    cursor: { fill: 'rgba(99,102,241,0.05)' },
  },
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateMonthly(months: number, baseValue: number) {
  return Array.from({ length: months }).map((_, i) => ({
    month: format(subMonths(new Date(), months - 1 - i), 'MMM'),
    value: Math.floor(baseValue + (pseudoRandom(i + months) - 0.4) * baseValue * 0.3),
  }));
}

// ── Workforce Tab ──────────────────────────────────────
function WorkforceAnalytics({ range }: { range: RangeKey }) {
  const months = range === '30d' ? 1 : range === '90d' ? 3 : range === '6m' ? 6 : 12;
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'workforce', range],
    queryFn: () => api.get('/analytics/workforce', { range }),
  });

  const headcountData = generateMonthly(months, 230);
  const deptData = [
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 38 },
    { name: 'HR', value: 12 },
    { name: 'Finance', value: 22 },
    { name: 'Operations', value: 31 },
    { name: 'Marketing', value: 18 },
  ];
  const typeData = [
    { type: 'Full Time', count: 180 },
    { type: 'Part Time', count: 24 },
    { type: 'Contract', count: 31 },
    { type: 'Intern', count: 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Total Headcount', value: 247, icon: Users, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10', trend: 'up' as const },
          { title: 'New Hires', value: 12, icon: UserPlus, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', trend: 'up' as const, delta: { value: 8, label: 'vs last period' } },
          { title: 'Terminations', value: 3, icon: UserMinus, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10', trend: 'down' as const },
          { title: 'Turnover Rate', value: '4.2', icon: TrendingDown, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10', suffix: '%' },
        ].map((c, i) => <StatCard key={i} {...c} loading={isLoading} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Trend */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Headcount Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={headcountData}>
              <defs>
                <linearGradient id="grad-hc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...DARK_CHART.grid} />
              <XAxis dataKey="month" tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
              <YAxis tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
              <Tooltip {...DARK_CHART.tooltip} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#grad-hc)" name="Headcount" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Pie */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={deptData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(props) => { const name = props.name ?? ''; const pct = ((props.percent ?? 0) * 100).toFixed(0); return `${name} ${pct}%`; }} labelLine={false} fontSize={10} fill="#6366f1">
                {deptData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...DARK_CHART.tooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employment Type */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Employment Type Breakdown</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={typeData} layout="vertical">
            <CartesianGrid {...DARK_CHART.grid} horizontal={false} />
            <XAxis type="number" tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="type" tick={DARK_CHART.tick} axisLine={false} tickLine={false} width={70} />
            <Tooltip {...DARK_CHART.tooltip} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Employees" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Leave Tab ──────────────────────────────────────────
function LeaveAnalytics({ range }: { range: RangeKey }) {
  const months = range === '30d' ? 1 : range === '90d' ? 3 : range === '6m' ? 6 : 12;
  const monthLabels = Array.from({ length: Math.max(months, 3) }).map((_, i) =>
    format(subMonths(new Date(), Math.max(months, 3) - 1 - i), 'MMM')
  );
  const leaveData = monthLabels.map((m, i) => ({
    month: m,
    Annual:    Math.floor(pseudoRandom(i * 1) * 80 + 30),
    Medical:   Math.floor(pseudoRandom(i * 2) * 40 + 10),
    Emergency: Math.floor(pseudoRandom(i * 3) * 15 + 3),
    Unpaid:    Math.floor(pseudoRandom(i * 4) * 10 + 1),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Total Days Taken', value: 482, icon: BarChart3, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10' },
          { title: 'Avg Per Employee', value: '3.8', icon: Users, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', suffix: 'd' },
          { title: 'Pending Requests', value: 14, icon: BarChart3, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
          { title: 'Approval Rate', value: '94', icon: BarChart3, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', suffix: '%' },
        ].map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Leave by Type — Monthly</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={leaveData} barSize={14} barGap={3}>
            <CartesianGrid {...DARK_CHART.grid} />
            <XAxis dataKey="month" tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
            <YAxis tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
            <Tooltip {...DARK_CHART.tooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="Annual"    fill="#6366f1" stackId="a" radius={[0,0,0,0]} />
            <Bar dataKey="Medical"   fill="#10b981" stackId="a" />
            <Bar dataKey="Emergency" fill="#f59e0b" stackId="a" />
            <Bar dataKey="Unpaid"    fill="#f43f5e" stackId="a" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Compliance Tab ─────────────────────────────────────
function ComplianceAnalytics({ range }: { range: RangeKey }) {
  const months = range === '30d' ? 1 : range === '90d' ? 3 : range === '6m' ? 6 : 12;
  const trendData = Array.from({ length: Math.max(months, 6) }).map((_, i) => ({
    month: format(subMonths(new Date(), Math.max(months, 6) - 1 - i), 'MMM'),
    score: Math.floor(65 + i * 3 + pseudoRandom(i) * 5),
  }));
  const riskData = [
    { name: 'Low',      value: 62, fill: '#10b981' },
    { name: 'Medium',   value: 25, fill: '#f59e0b' },
    { name: 'High',     value: 10, fill: '#f43f5e' },
    { name: 'Critical', value: 3,  fill: '#dc2626' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Compliance Score Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="grad-comp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...DARK_CHART.grid} />
              <XAxis dataKey="month" tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
              <YAxis tick={DARK_CHART.tick} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...DARK_CHART.tooltip} />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#grad-comp)" name="Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="30%" outerRadius="90%" data={riskData} startAngle={180} endAngle={-180}>
              <RadialBar dataKey="value" cornerRadius={4} label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Tooltip {...DARK_CHART.tooltip} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Missing Policies Across Companies</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart layout="vertical" data={[
            { policy: 'Sexual Harassment Policy', missing: 12 },
            { policy: 'Data Protection Policy', missing: 8 },
            { policy: 'Whistleblower Policy', missing: 21 },
            { policy: 'Remote Work Policy', missing: 35 },
            { policy: 'AI Usage Policy', missing: 48 },
          ]}>
            <CartesianGrid {...DARK_CHART.grid} horizontal={false} />
            <XAxis type="number" tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="policy" tick={DARK_CHART.tick} axisLine={false} tickLine={false} width={160} />
            <Tooltip {...DARK_CHART.tooltip} />
            <Bar dataKey="missing" fill="#f43f5e" radius={[0,4,4,0]} name="Companies missing" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── AI Analytics Tab ───────────────────────────────────
function AiAnalytics({ range }: { range: RangeKey }) {
  const days = range === '30d' ? 30 : range === '90d' ? 90 : range === '6m' ? 180 : 365;
  const queryData = Array.from({ length: 14 }).map((_, i) => ({
    day: format(subDays(new Date(), 13 - i), 'MMM d'),
    queries: Math.floor(pseudoRandom(i + 14) * 60 + 10),
  }));
  const confidenceData = [
    { name: 'High (≥90%)',   value: 58, fill: '#10b981' },
    { name: 'Medium (75-90%)', value: 32, fill: '#f59e0b' },
    { name: 'Low (<75%)',   value: 10, fill: '#f43f5e' },
  ];
  const topQuestions = [
    { question: 'Minimum annual leave entitlement', count: 234 },
    { question: 'Termination notice period', count: 187 },
    { question: 'Maternity leave entitlement', count: 156 },
    { question: 'Public holiday entitlement', count: 143 },
    { question: 'Probation period requirements', count: 121 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">AI Query Volume — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={queryData}>
              <CartesianGrid {...DARK_CHART.grid} />
              <XAxis dataKey="day" tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
              <YAxis tick={DARK_CHART.tick} axisLine={false} tickLine={false} />
              <Tooltip {...DARK_CHART.tooltip} />
              <Bar dataKey="queries" fill="#8b5cf6" radius={[3,3,0,0]} name="Queries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Confidence Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={confidenceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(props) => `${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {confidenceData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip {...DARK_CHART.tooltip} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Top Questions Asked</h3>
        <div className="space-y-3">
          {topQuestions.map((q, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-slate-600 w-4 flex-shrink-0">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300 truncate">{q.question}</span>
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{q.count}</span>
                </div>
                <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${(q.count / topQuestions[0].count) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root Analytics Client ──────────────────────────────
export function AnalyticsClient() {
  const [tab, setTab] = useState<TabKey>('workforce');
  const [range, setRange] = useState<RangeKey>('6m');

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'workforce',  label: 'Workforce',   icon: Users },
    { key: 'leave',      label: 'Leave',        icon: BarChart3 },
    { key: 'compliance', label: 'Compliance',   icon: Shield },
    { key: 'ai',         label: 'AI Insights',  icon: Bot },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex border-b border-white/8 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              role="tab"
              aria-selected={tab === t.key}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                tab === t.key ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-slate-500 hover:text-slate-300'
              )}
            >
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center rounded-lg border border-white/10 overflow-hidden flex-shrink-0">
          {(['30d', '90d', '6m', '1y'] as RangeKey[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                range === r ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      {tab === 'workforce'  && <WorkforceAnalytics range={range} />}
      {tab === 'leave'      && <LeaveAnalytics range={range} />}
      {tab === 'compliance' && <ComplianceAnalytics range={range} />}
      {tab === 'ai'         && <AiAnalytics range={range} />}
    </div>
  );
}
