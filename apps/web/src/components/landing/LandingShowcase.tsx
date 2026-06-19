'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Shield,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Tab definitions ─────────────────────────────────── */
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'ai', label: 'AI Assistant', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'compliance', label: 'Compliance', icon: Shield },
];

/* ─── Dashboard mockup ────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="flex h-full gap-4">
      {/* Sidebar */}
      <div className="w-44 shrink-0 space-y-1">
        {['Overview', 'Employees', 'Payroll', 'Leave', 'Compliance', 'Reports'].map((item, i) => (
          <div
            key={item}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
              i === 0
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            <div className={cn('w-1.5 h-1.5 rounded-full', i === 0 ? 'bg-indigo-400' : 'bg-white/20')} />
            {item}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 min-w-0">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Headcount', value: '1,247', delta: '+12', color: 'text-indigo-400' },
            { label: 'On Leave', value: '43', delta: '-5', color: 'text-amber-400' },
            { label: 'Open Roles', value: '18', delta: '+3', color: 'text-emerald-400' },
          ].map((m) => (
            <div key={m.label} className="glass-panel rounded-xl p-3">
              <p className="text-[10px] text-white/40 mb-1">{m.label}</p>
              <p className={cn('text-xl font-bold', m.color)}>{m.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{m.delta} this month</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="glass-panel rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/70">Headcount by Department</p>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2 h-16">
            {[
              { dept: 'Eng', h: 80, color: '#6366f1' },
              { dept: 'Sales', h: 60, color: '#8b5cf6' },
              { dept: 'Ops', h: 45, color: '#06b6d4' },
              { dept: 'HR', h: 30, color: '#10b981' },
              { dept: 'Finance', h: 50, color: '#f59e0b' },
            ].map((b) => (
              <div key={b.dept} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full rounded-t-sm"
                  style={{ height: `${b.h}%`, background: b.color, opacity: 0.7 }}
                />
                <span className="text-[9px] text-white/30">{b.dept}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass-panel rounded-xl p-3 space-y-2">
          <p className="text-xs font-medium text-white/70">Recent Activity</p>
          {[
            { text: 'New hire onboarded — Ahmad Razif', time: '2m ago', color: 'bg-emerald-400' },
            { text: 'Leave approved — Sarah Wong (5 days)', time: '15m ago', color: 'bg-blue-400' },
            { text: 'Contract renewed — Rajesh Kumar', time: '1h ago', color: 'bg-violet-400' },
          ].map((a) => (
            <div key={a.text} className="flex items-start gap-2">
              <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', a.color)} />
              <p className="text-[10px] text-white/50 leading-relaxed flex-1">{a.text}</p>
              <span className="text-[9px] text-white/25 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Employees mockup ────────────────────────────────── */
function EmployeesMockup() {
  const employees = [
    {
      name: 'Priya Nair',
      role: 'HR Director',
      dept: 'Human Resources',
      status: 'Active',
      country: '🇲🇾',
      joined: 'Mar 2021',
    },
    {
      name: 'Ahmad Razif',
      role: 'Senior Engineer',
      dept: 'Technology',
      status: 'Probation',
      country: '🇲🇾',
      joined: 'Jun 2026',
    },
    {
      name: 'James Chen',
      role: 'Sales Manager',
      dept: 'Sales',
      status: 'Active',
      country: '🇦🇺',
      joined: 'Jan 2023',
    },
    {
      name: 'Siti Rahimah',
      role: 'Group HR Manager',
      dept: 'Corporate HR',
      status: 'Active',
      country: '🇸🇬',
      joined: 'Nov 2019',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Search + filter bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center px-3 gap-2">
          <div className="w-3 h-3 rounded-full border border-white/20" />
          <span className="text-[11px] text-white/30">Search employees...</span>
        </div>
        <div className="h-8 px-3 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center text-[11px] text-indigo-300 font-medium">
          + Add Employee
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-5 gap-2 px-2">
        {['Name', 'Department', 'Country', 'Status', 'Joined'].map((h) => (
          <span key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wide">{h}</span>
        ))}
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {employees.map((emp, i) => (
          <div
            key={emp.name}
            className={cn(
              'grid grid-cols-5 gap-2 items-center px-2 py-2.5 rounded-xl',
              i === 0 ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/[0.02] border border-white/[0.06]'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold"
                style={{ background: ['#6366f1','#8b5cf6','#06b6d4','#10b981'][i] }}
              >
                {emp.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-white truncate">{emp.name}</p>
                <p className="text-[9px] text-white/40 truncate">{emp.role}</p>
              </div>
            </div>
            <span className="text-[10px] text-white/50 truncate">{emp.dept}</span>
            <span className="text-[12px]">{emp.country}</span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold w-fit',
                emp.status === 'Active'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-amber-500/15 text-amber-400'
              )}
            >
              {emp.status}
            </span>
            <span className="text-[10px] text-white/40">{emp.joined}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── AI Assistant mockup ─────────────────────────────── */
function AIMockup() {
  const messages = [
    {
      role: 'user',
      text: 'Under the Employment Act 1955, how many days of annual leave is an employee entitled to after 2 years of service?',
    },
    {
      role: 'ai',
      text: 'Under Section 60E of the Employment Act 1955, an employee is entitled to **12 days** of annual leave per year after 2 years of continuous service (and before 5 years). This increases to 16 days after 5 or more years of service.\n\nWould you like me to calculate the pro-rated entitlement for a specific employee?',
    },
    {
      role: 'user',
      text: 'Yes, calculate for Ahmad Razif who joined on June 1, 2026.',
    },
    {
      role: 'ai',
      text: "Ahmad Razif joined June 1, 2026. As a new employee (less than 2 years' service), he's entitled to **8 days** per year. Pro-rated from June–December 2026: **4.67 days** ≈ **5 days** rounded up per company policy. I've updated his leave balance in the system.",
    },
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Chat messages */}
      <div className="flex-1 space-y-3 overflow-hidden">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2', msg.role === 'ai' ? '' : 'flex-row-reverse')}
          >
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">
                AI
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-xl px-3 py-2 text-[11px] leading-relaxed',
                msg.role === 'ai'
                  ? 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-100'
                  : 'bg-white/[0.06] border border-white/[0.08] text-white/70 rounded-tr-none'
              )}
            >
              {msg.text.split('**').map((part, pi) =>
                pi % 2 === 1 ? (
                  <strong key={pi} className="font-bold text-white">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
        <div className="flex-1 h-7 flex items-center px-2">
          <span className="text-[11px] text-white/25">Ask anything about HR law...</span>
        </div>
        <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );
}

/* ─── Documents mockup ────────────────────────────────── */
function DocumentsMockup() {
  const docs = [
    { name: 'Employment Contract — Ahmad Razif', type: 'Contract', date: 'Jun 16, 2026', status: 'Signed', color: 'bg-emerald-500/15 text-emerald-400' },
    { name: 'Offer Letter — Sarah Wong', type: 'Letter', date: 'Jun 14, 2026', status: 'Pending', color: 'bg-amber-500/15 text-amber-400' },
    { name: 'HR Handbook 2026 (MY)', type: 'Policy', date: 'Jan 1, 2026', status: 'Active', color: 'bg-blue-500/15 text-blue-400' },
    { name: 'Performance Review — Q2 2026', type: 'Report', date: 'Jun 30, 2026', status: 'Draft', color: 'bg-white/10 text-white/40' },
    { name: 'Termination Notice — Formal', type: 'Letter', date: 'Jun 12, 2026', status: 'Signed', color: 'bg-emerald-500/15 text-emerald-400' },
    { name: 'NDA Template — AU Region', type: 'Template', date: 'Mar 5, 2026', status: 'Active', color: 'bg-blue-500/15 text-blue-400' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/60">Recent Documents</p>
        <div className="h-7 px-3 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center text-[11px] text-indigo-300 font-medium">
          + Generate Document
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {docs.map((doc) => (
          <div key={doc.name} className="glass-panel rounded-xl p-3 space-y-2">
            <div className="flex items-start justify-between gap-1">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded-full ml-auto', doc.color)}>
                {doc.status}
              </span>
            </div>
            <p className="text-[10px] font-medium text-white/80 leading-snug line-clamp-2">{doc.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-white/30 rounded-md bg-white/[0.04] px-1.5 py-0.5">{doc.type}</span>
              <span className="text-[9px] text-white/25">{doc.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Compliance mockup ───────────────────────────────── */
function ComplianceMockup() {
  const checks = [
    { label: 'Employment contracts up to date', done: true },
    { label: 'PDPA consent records collected', done: true },
    { label: 'Annual leave policy published', done: true },
    { label: 'Workplace safety audit completed', done: true },
    { label: 'Fair Work statement issued (AU)', done: false },
    { label: 'CPF contribution records filed (SG)', done: false },
  ];

  const score = 89;

  return (
    <div className="flex gap-5">
      {/* Score ring */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42 * score / 100} ${2 * Math.PI * 42}`}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{score}%</span>
            <span className="text-[10px] text-white/40">Score</span>
          </div>
        </div>
        <p className="text-xs font-medium text-white/60 text-center">Compliance<br />Rating</p>
        <div className="flex flex-col gap-1 w-full">
          {[
            { label: 'Malaysia', pct: 95, color: '#6366f1' },
            { label: 'Australia', pct: 82, color: '#8b5cf6' },
            { label: 'Singapore', pct: 91, color: '#06b6d4' },
          ].map((c) => (
            <div key={c.label} className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[9px] text-white/40">{c.label}</span>
                <span className="text-[9px] font-semibold" style={{ color: c.color }}>{c.pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.pct}%`, background: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 space-y-2">
        <p className="text-xs font-medium text-white/60 mb-3">Compliance Checklist</p>
        {checks.map((c) => (
          <div key={c.label} className="flex items-start gap-2">
            {c.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <p className={cn('text-[11px] leading-snug', c.done ? 'text-white/60' : 'text-amber-300/80')}>
              {c.label}
            </p>
          </div>
        ))}
        <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-amber-300 font-medium">2 items need attention</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Showcase section ────────────────────────────────── */
export function LandingShowcase() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const tabContent: Record<string, React.ReactNode> = {
    dashboard: <DashboardMockup />,
    employees: <EmployeesMockup />,
    ai: <AIMockup />,
    documents: <DocumentsMockup />,
    compliance: <ComplianceMockup />,
  };

  return (
    <section
      id="showcase"
      ref={ref}
      aria-labelledby="showcase-heading"
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-violet-600/6 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            'text-center mb-12 transition-all duration-700',
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-4">
            Product Tour
          </span>
          <h2
            id="showcase-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            See It In Action
          </h2>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">
            Explore every module of HRManager4U.ai — purpose-built for enterprise HR
            teams across Asia-Pacific.
          </p>
        </div>

        {/* Tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className={cn(
            'transition-all duration-700',
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
          style={{ transitionDelay: '150ms' }}
        >
          {/* Tab list */}
          <Tabs.List
            aria-label="Product showcase tabs"
            className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6 overflow-x-auto"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center',
                    'text-white/50 hover:text-white/80',
                    'data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          {/* Tab panels */}
          {tabs.map((tab) => (
            <Tabs.Content key={tab.id} value={tab.id} className="focus-visible:outline-none" forceMount>
              <AnimatePresence mode="wait">
                {activeTab === tab.id && (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="glass-panel rounded-2xl p-6 min-h-[380px]">
                      {/* Browser chrome */}
                      <div className="flex items-center gap-1.5 mb-5 pb-4 border-b border-white/[0.06]">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                        <div className="flex-1 ml-3 h-6 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center px-3">
                          <span className="text-[10px] text-white/20">
                            app.hrmanager4u.ai/{tab.id === 'ai' ? 'assistant' : tab.id}
                          </span>
                        </div>
                      </div>

                      {tabContent[tab.id]}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}
