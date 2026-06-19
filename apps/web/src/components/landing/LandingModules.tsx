'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GitMerge,
  Bot,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'workflows', label: 'Workflows', icon: GitMerge },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
] as const;

type TabId = (typeof tabs)[number]['id'];

/* ─── Module Mockups ──────────────────────────── */

function DashboardMockup() {
  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* Metric row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Employees', value: '1,248', trend: '+12', color: 'text-indigo-400', bg: 'rgba(99,102,241,0.12)' },
          { label: 'Open Leaves', value: '34', trend: '-3', color: 'text-amber-400', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Compliance Score', value: '97.2%', trend: '+1.4%', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.12)' },
        ].map(({ label, value, trend, color, bg }) => (
          <div key={label} className="rounded-lg p-3" style={{ background: bg, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className={cn('text-xl font-bold', color)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
            <div className="text-[10px] text-[hsl(var(--fg-muted))] mt-0.5">{label}</div>
            <div className="text-[10px] text-emerald-400 mt-1">{trend} this month</div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="flex-1 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xs font-semibold text-[hsl(var(--fg-secondary))] mb-3">Recent Activity</div>
        {[
          { event: 'Ahmad R. onboarding completed', time: '2m ago', dot: 'bg-emerald-400' },
          { event: 'Leave request approved — Sarah L.', time: '14m ago', dot: 'bg-indigo-400' },
          { event: 'Contract generated — James M.', time: '1h ago', dot: 'bg-purple-400' },
          { event: 'Payroll run scheduled — AU entity', time: '3h ago', dot: 'bg-amber-400' },
          { event: 'Compliance alert cleared — MY entity', time: '5h ago', dot: 'bg-emerald-400' },
        ].map(({ event, time, dot }) => (
          <div key={event} className="flex items-start gap-2.5 py-1.5 border-b border-white/4 last:border-0">
            <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', dot)} aria-hidden="true" />
            <span className="text-xs text-[hsl(var(--fg-secondary))] flex-1">{event}</span>
            <span className="text-[10px] text-[hsl(var(--fg-muted))]">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeesMockup() {
  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      {/* Search bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[hsl(var(--fg-muted))]"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span aria-hidden="true">🔍</span>
        <span>Search 1,248 employees...</span>
        <div className="ml-auto flex gap-1">
          {['Department', 'Status', 'Location'].map((f) => (
            <span key={f} className="px-2 py-0.5 rounded text-[10px] bg-white/6 text-[hsl(var(--fg-muted))]">{f}</span>
          ))}
        </div>
      </div>

      {/* Employee table */}
      <div className="flex-1 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full text-xs" aria-label="Employee list preview">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['Name', 'Role', 'Department', 'Status'].map((h) => (
                <th key={h} scope="col" className="text-left px-3 py-2 text-[hsl(var(--fg-muted))] font-medium text-[10px] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Ahmad Razif', role: 'Senior Engineer', dept: 'Technology', status: 'Active', color: 'text-emerald-400' },
              { name: 'Sarah Lim', role: 'HR Manager', dept: 'People Ops', status: 'Active', color: 'text-emerald-400' },
              { name: 'James McAllister', role: 'Finance Lead', dept: 'Finance', status: 'On Leave', color: 'text-amber-400' },
              { name: 'Priya Sharma', role: 'Product Designer', dept: 'Design', status: 'Active', color: 'text-emerald-400' },
              { name: 'Wei Chen', role: 'Data Analyst', dept: 'Analytics', status: 'Probation', color: 'text-sky-400' },
            ].map((emp) => (
              <tr key={emp.name} className="border-t border-white/4 hover:bg-white/3 transition-colors">
                <td className="px-3 py-2 font-medium text-white/90">{emp.name}</td>
                <td className="px-3 py-2 text-[hsl(var(--fg-muted))]">{emp.role}</td>
                <td className="px-3 py-2 text-[hsl(var(--fg-muted))]">{emp.dept}</td>
                <td className={cn('px-3 py-2 font-semibold', emp.color)}>{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WorkflowsMockup() {
  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <div className="text-xs font-semibold text-[hsl(var(--fg-secondary))]">Leave Approval Workflow · Active</div>

      {/* Visual workflow */}
      <div className="flex-1 flex flex-col gap-2">
        {[
          { step: '1', label: 'Employee submits request', status: 'done', actor: 'Employee Portal' },
          { step: '2', label: 'Line manager review', status: 'done', actor: 'Ahmad Razif (L3)' },
          { step: '3', label: 'HR compliance check', status: 'active', actor: 'Compliance Engine' },
          { step: '4', label: 'Director approval', status: 'pending', actor: 'Sarah Lim' },
          { step: '5', label: 'Payroll notification', status: 'pending', actor: 'Payroll System' },
        ].map(({ step, label, status, actor }) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                status === 'done' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                status === 'active' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60' :
                'bg-white/5 text-[hsl(var(--fg-muted))] border border-white/10'
              )}
              aria-label={`Step ${step}: ${status}`}
            >
              {status === 'done' ? '✓' : step}
            </div>
            <div className="flex-1 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className={cn('font-medium', status === 'pending' ? 'text-[hsl(var(--fg-muted))]' : 'text-white/90')}>{label}</div>
              <div className="text-[10px] text-[hsl(var(--fg-muted))] mt-0.5">{actor}</div>
            </div>
            {status === 'active' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse">
                In Progress
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="text-[10px] text-[hsl(var(--fg-muted))] text-center">
        SLA: 24h remaining · Auto-escalates if no response
      </div>
    </div>
  );
}

function AIMockup() {
  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      {/* Chat header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center" aria-hidden="true">
          <Bot className="w-3.5 h-3.5 text-indigo-300" />
        </div>
        <span className="text-xs font-semibold text-indigo-300">HR Legal AI · Employment Act 1955 · Fair Work 2009</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-label="Online" />
      </div>

      {/* Chat messages */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="self-end max-w-[80%] px-3 py-2 rounded-xl text-xs text-white/90" style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.3)' }}>
          What is the minimum annual leave entitlement under the Employment Act 1955 for an employee with 3 years of service?
        </div>
        <div className="self-start max-w-[85%] px-3 py-2.5 rounded-xl text-xs text-[hsl(var(--fg-secondary))] leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Under <strong className="text-indigo-300">Section 60E, Employment Act 1955</strong>, an employee with 2–5 years of continuous service is entitled to a minimum of <strong className="text-white">12 days</strong> of annual leave per year. Part-year entitlement is pro-rated.
          <div className="mt-2 pt-2 border-t border-white/8 text-[10px] text-[hsl(var(--fg-muted))]">
            📚 Source: Employment Act 1955, s.60E(1)(b) · Confidence: 99.1%
          </div>
        </div>
        <div className="self-end max-w-[80%] px-3 py-2 rounded-xl text-xs text-white/90" style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.3)' }}>
          How does this compare to Australian NES entitlements?
        </div>
        <div className="self-start max-w-[85%] px-3 py-2.5 rounded-xl text-xs text-[hsl(var(--fg-secondary))] leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Under <strong className="text-emerald-300">Fair Work Act 2009, Division 6</strong>, NES provides <strong className="text-white">4 weeks</strong> (20 days) annual leave for full-time employees, regardless of tenure — significantly higher than the MY minimum.
          <div className="mt-2 pt-2 border-t border-white/8 text-[10px] text-[hsl(var(--fg-muted))]">
            📚 Source: Fair Work Act 2009, s.87 · Confidence: 98.7%
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="text-xs text-[hsl(var(--fg-muted))] flex-1">Ask about HR law, policy, or entitlements...</span>
        <span className="text-[10px] text-indigo-400 font-medium">⌘ Enter</span>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [
    { label: 'Jan', value: 68, color: 'bg-indigo-500' },
    { label: 'Feb', value: 74, color: 'bg-indigo-500' },
    { label: 'Mar', value: 71, color: 'bg-indigo-500' },
    { label: 'Apr', value: 88, color: 'bg-indigo-500' },
    { label: 'May', value: 83, color: 'bg-indigo-500' },
    { label: 'Jun', value: 97, color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Attrition Rate', value: '3.2%', delta: '-0.8%', good: true },
          { label: 'Avg. Time-to-Hire', value: '18 days', delta: '-4 days', good: true },
          { label: 'Training Completion', value: '89%', delta: '+12%', good: true },
          { label: 'Payroll Accuracy', value: '99.97%', delta: '+0.03%', good: true },
        ].map(({ label, value, delta, good }) => (
          <div key={label} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
            <div className="text-[10px] text-[hsl(var(--fg-muted))]">{label}</div>
            <div className={cn('text-[10px] font-semibold mt-0.5', good ? 'text-emerald-400' : 'text-red-400')}>{delta} vs last quarter</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex-1 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xs font-semibold text-[hsl(var(--fg-secondary))] mb-3">Compliance Score Trend</div>
        <div className="flex items-end gap-2 h-20" role="img" aria-label="Bar chart: Compliance score trend from January to June, peaking at 97 in June">
          {bars.map(({ label, value, color }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn('w-full rounded-t', color)}
                style={{ height: `${(value / 100) * 80}px`, opacity: 0.85 }}
              />
              <span className="text-[9px] text-[hsl(var(--fg-muted))]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const tabContent: Record<TabId, React.ReactNode> = {
  dashboard: <DashboardMockup />,
  employees: <EmployeesMockup />,
  workflows: <WorkflowsMockup />,
  ai: <AIMockup />,
  analytics: <AnalyticsMockup />,
};

export function LandingModules() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <section
      id="modules"
      aria-labelledby="modules-heading"
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          'linear-gradient(180deg, transparent, rgba(99,102,241,0.04) 50%, transparent)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Platform Modules
          </p>
          <h2
            id="modules-heading"
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Every Module, Live.
          </h2>
          <p className="max-w-xl mx-auto text-[hsl(var(--fg-secondary))]">
            See how each module looks in action. No mockup images — these are real interactive
            previews of the HRManager4U.ai interface.
          </p>
        </div>

        {/* Tab bar */}
        <div
          className="flex flex-wrap gap-1 mb-4 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          role="tablist"
          aria-label="Platform modules"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`tabpanel-${id}`}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-none justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-[hsl(var(--fg-secondary))] hover:text-[hsl(var(--fg-primary))] hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab panel */}
        {tabs.map(({ id }) => (
          <div
            key={id}
            role="tabpanel"
            id={`tabpanel-${id}`}
            aria-labelledby={`tab-${id}`}
            hidden={activeTab !== id}
            className={cn(
              'glass-panel rounded-xl overflow-hidden',
              activeTab === id ? 'block' : 'hidden'
            )}
            style={{ minHeight: '380px' }}
          >
            {tabContent[id]}
          </div>
        ))}
      </div>
    </section>
  );
}
