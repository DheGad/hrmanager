'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, CheckCircle2, TrendingUp, FileText,
  ChevronRight, Play, Pause, Bot, Brain, Zap, Shield,
  Star, Clock, AlertCircle, Check, X, Search, Bell,
  BarChart2, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';

/* ─── Mock data ─────────────────────────────────────────────── */
const EMPLOYEES = [
  { id: 1, name: 'Roy Chen', role: 'Chief Executive Officer', dept: 'Executive', status: 'active', avatar: 'RC', color: 'from-amber-500 to-orange-600', leave: 12, joined: 'Jan 2021' },
  { id: 2, name: 'Winne Ahmad', role: 'Group HR Director', dept: 'Human Resources', status: 'active', avatar: 'WA', color: 'from-violet-500 to-purple-600', leave: 8, joined: 'Mar 2020' },
  { id: 3, name: 'Jonne Williams', role: 'Head of Engineering', dept: 'Technology', status: 'active', avatar: 'JW', color: 'from-blue-500 to-cyan-600', leave: 14, joined: 'Jun 2019' },
  { id: 4, name: 'Priya Nair', role: 'Senior HR Manager', dept: 'Human Resources', status: 'active', avatar: 'PN', color: 'from-rose-500 to-pink-600', leave: 10, joined: 'Sep 2022' },
  { id: 5, name: 'James Lim', role: 'Finance Controller', dept: 'Finance', status: 'on-leave', avatar: 'JL', color: 'from-emerald-500 to-teal-600', leave: 2, joined: 'Feb 2021' },
  { id: 6, name: 'Sarah Tan', role: 'Product Manager', dept: 'Product', status: 'active', avatar: 'ST', color: 'from-indigo-500 to-blue-600', leave: 16, joined: 'Nov 2023' },
];

const LEAVE_REQUESTS = [
  { id: 1, name: 'James Lim', type: 'Annual Leave', days: 3, from: 'Jun 17', to: 'Jun 19', status: 'pending', avatar: 'JL', color: 'from-emerald-500 to-teal-600' },
  { id: 2, name: 'Sarah Tan', type: 'Medical Leave', days: 1, from: 'Jun 18', to: 'Jun 18', status: 'pending', avatar: 'ST', color: 'from-indigo-500 to-blue-600' },
  { id: 3, name: 'Roy Chen', type: 'Annual Leave', days: 5, from: 'Jun 24', to: 'Jun 28', status: 'approved', avatar: 'RC', color: 'from-amber-500 to-orange-600' },
  { id: 4, name: 'Priya Nair', type: 'Emergency Leave', days: 2, from: 'Jun 15', to: 'Jun 16', status: 'approved', avatar: 'PN', color: 'from-rose-500 to-pink-600' },
];

const AI_CONVERSATION = [
  { role: 'user', text: 'What is the minimum notice period under Employment Act 1955?', delay: 0 },
  { role: 'ai', text: 'Under Section 12 of the Employment Act 1955, the minimum notice period is:\n• Less than 2 years: 4 weeks\n• 2–5 years service: 6 weeks\n• 5+ years service: 8 weeks\n\nThis applies to employees earning ≤RM4,000/month.', delay: 1200, citation: 'Employment Act 1955 — Section 12' },
  { role: 'user', text: 'Can employer terminate without notice?', delay: 2600 },
  { role: 'ai', text: 'Yes, under Section 14(1), an employer may dismiss an employee without notice for:\n• Misconduct after due inquiry\n• Willful breach of contract conditions\n\nHowever, a domestic inquiry must be conducted first to ensure procedural fairness.', delay: 4000, citation: 'Employment Act 1955 — Section 14(1)' },
];

const COMPLIANCE_POLICIES = {
  MY: [
    { name: 'Employment Act 1955', status: true },
    { name: 'Minimum Wages Order 2022', status: true },
    { name: 'PDPA 2010 — Data Protection', status: true },
    { name: 'Industrial Relations Act 1967', status: true },
    { name: 'Occupational Safety Act 1994', status: false },
    { name: 'EPF Contribution Policy', status: true },
  ],
  AU: [
    { name: 'Fair Work Act 2009', status: true },
    { name: 'National Employment Standards', status: true },
    { name: 'Work Health & Safety Act 2011', status: true },
    { name: 'Privacy Act 1988', status: false },
    { name: 'Superannuation Guarantee', status: true },
    { name: 'Anti-Discrimination Act 1977', status: true },
  ],
};

/* ─── Dashboard Tab ─────────────────────────────────────────── */
function DashboardTab() {
  const [counts, setCounts] = useState({ emp: 0, leave: 0, comp: 0, ai: 0 });
  useEffect(() => {
    const targets = { emp: 1247, leave: 94, comp: 98, ai: 3891 };
    const steps = 40;
    let step = 0;
    const t = setInterval(() => {
      step++;
      const p = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCounts({
        emp: Math.floor(targets.emp * ease),
        leave: Math.floor(targets.leave * ease),
        comp: Math.floor(targets.comp * ease),
        ai: Math.floor(targets.ai * ease),
      });
      if (step >= steps) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, []);

  const bars = [65, 71, 78, 82, 89, 95];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="p-5 space-y-4 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Monday, June 16, 2026</p>
          <h3 className="text-sm font-bold text-white">Good morning, Roy Chen 👋</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            All systems normal
          </span>
          <button className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Employees', value: counts.emp.toLocaleString(), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', change: '+12 this month', up: true },
          { label: 'Leave Approval Rate', value: `${counts.leave}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+3% vs last month', up: true },
          { label: 'Compliance Score', value: `${counts.comp}%`, icon: Shield, color: 'text-violet-400', bg: 'bg-violet-500/10', change: 'Excellent standing', up: true },
          { label: 'AI Queries Today', value: counts.ai.toLocaleString(), icon: Brain, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '+891 vs yesterday', up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white/4 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <div className={`w-6 h-6 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-3 h-3 ${kpi.color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-1">
              <ArrowUp className="w-2.5 h-2.5 text-emerald-400" />{kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Headcount Chart */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-white">Headcount Trend</p>
          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+46 YTD</span>
        </div>
        <div className="flex items-end gap-2 h-20">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-slate-600">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-3">
        <p className="text-xs font-semibold text-white mb-2">Recent Activity</p>
        <div className="space-y-2">
          {[
            { text: 'Winne Ahmad approved 3 leave requests', time: '2m ago', color: 'bg-violet-500' },
            { text: 'New employee Jonne Williams onboarded', time: '1h ago', color: 'bg-emerald-500' },
            { text: 'Compliance score updated to 98%', time: '3h ago', color: 'bg-indigo-500' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full ${a.color} flex-shrink-0`} />
              <p className="text-xs text-slate-400 flex-1">{a.text}</p>
              <span className="text-[10px] text-slate-600">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Employees Tab ─────────────────────────────────────────── */
function EmployeesTab() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof EMPLOYEES[0] | null>(null);
  const filtered = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex-1 p-4 space-y-3 overflow-auto border-r border-white/6">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none"
            />
          </div>
          <button className="px-3 py-1.5 bg-indigo-500/90 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 transition-colors">
            + Add
          </button>
        </div>
        <p className="text-xs text-slate-500">{filtered.length} employees</p>
        <div className="space-y-1.5">
          {filtered.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setSelected(selected?.id === emp.id ? null : emp)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 ${
                selected?.id === emp.id ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-white/3 border border-white/6 hover:bg-white/6'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${emp.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                {emp.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{emp.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
              </div>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                emp.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {emp.status === 'active' ? 'Active' : 'On Leave'}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-52 p-4 flex flex-col gap-4 overflow-auto"
          >
            <div className="text-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selected.color} flex items-center justify-center text-white font-bold text-lg mx-auto mb-2`}>
                {selected.avatar}
              </div>
              <p className="text-sm font-bold text-white">{selected.name}</p>
              <p className="text-[10px] text-slate-500">{selected.role}</p>
              <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full">{selected.dept}</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Leave Balance', value: `${selected.leave} days` },
                { label: 'Joined', value: selected.joined },
                { label: 'Status', value: selected.status === 'active' ? '✅ Active' : '🟡 On Leave' },
                { label: 'Compliance', value: '✅ Compliant' },
              ].map(r => (
                <div key={r.label} className="bg-white/4 border border-white/6 rounded-lg p-2">
                  <p className="text-[9px] text-slate-600">{r.label}</p>
                  <p className="text-xs text-white font-medium">{r.value}</p>
                </div>
              ))}
            </div>
            <button className="btn-primary text-xs py-1.5 justify-center w-full">View Profile</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── AI Chat Tab ───────────────────────────────────────────── */
function AITab() {
  const [shown, setShown] = useState(0);
  const [input, setInput] = useState('');
  const [extraMsg, setExtraMsg] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = AI_CONVERSATION.map((msg, i) =>
      setTimeout(() => setShown(i + 1), msg.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [shown, extraMsg]);

  const handleSend = () => {
    if (!input.trim()) return;
    setExtraMsg(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/6">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">HR AI Assistant</p>
          <p className="text-[10px] text-slate-500">Powered by Employment Act 1955 + Fair Work Act 2009</p>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {AI_CONVERSATION.slice(0, shown).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'ai' && (
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <Bot className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
              msg.role === 'user'
                ? 'bg-indigo-500/80 text-white rounded-tr-sm'
                : 'bg-white/6 border border-white/8 text-slate-300 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              {msg.citation && (
                <p className="mt-1.5 text-[9px] text-indigo-400/80 border-t border-white/10 pt-1">
                  📖 Source: {msg.citation}
                </p>
              )}
            </div>
          </motion.div>
        ))}
        {extraMsg && (
          <>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-xl px-3 py-2 text-xs bg-indigo-500/80 text-white rounded-tr-sm">
                {extraMsg}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <Bot className="w-2.5 h-2.5 text-white" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/6 border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-300 rounded-tl-sm"
              >
                I can help with that. Based on Malaysian Employment Act 1955 and Fair Work Act 2009, let me provide you with accurate, compliant guidance for your query about &ldquo;{extraMsg.slice(0, 40)}...&rdquo;
                <p className="mt-1.5 text-[9px] text-indigo-400/80 border-t border-white/10 pt-1">📖 Source: Employment Act 1955 + Fair Work Act 2009</p>
              </motion.div>
            </div>
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/6">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask any HR legal question..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none"
          />
          <button onClick={handleSend} className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center hover:bg-indigo-400 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-[9px] text-slate-600 text-center mt-1">✓ Answers cited from verified legal sources</p>
      </div>
    </div>
  );
}

/* ─── Leave Tab ─────────────────────────────────────────────── */
function LeaveTab() {
  const [leaves, setLeaves] = useState(LEAVE_REQUESTS);
  const pending = leaves.filter(l => l.status === 'pending');
  const approved = leaves.filter(l => l.status === 'approved');

  const handleApprove = (id: number) => setLeaves(ls => ls.map(l => l.id === id ? { ...l, status: 'approved' } : l));
  const handleReject = (id: number) => setLeaves(ls => ls.map(l => l.id === id ? { ...l, status: 'rejected' } : l));

  return (
    <div className="p-4 space-y-4 overflow-auto h-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Pending', value: pending.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Approved', value: approved.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-white/6 rounded-xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs font-semibold text-white">Leave Requests</p>
      <div className="space-y-2">
        <AnimatePresence>
          {leaves.map(leave => (
            <motion.div
              key={leave.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/4 border border-white/8 rounded-xl p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${leave.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                  {leave.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white">{leave.name}</p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      leave.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                      leave.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}>{leave.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{leave.type} · {leave.days} day{leave.days > 1 ? 's' : ''} · {leave.from} – {leave.to}</p>
                </div>
              </div>
              {leave.status === 'pending' && (
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => handleApprove(leave.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/25 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(leave.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold hover:bg-rose-500/20 transition-colors"
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Compliance Tab ────────────────────────────────────────── */
function ComplianceTab() {
  const [country, setCountry] = useState<'MY' | 'AU'>('MY');
  const policies = COMPLIANCE_POLICIES[country];
  const score = country === 'MY' ? 98 : 92;
  const passing = policies.filter(p => p.status).length;

  return (
    <div className="p-4 space-y-4 overflow-auto h-full">
      {/* Country toggle */}
      <div className="flex gap-2">
        {(['MY', 'AU'] as const).map(c => (
          <button
            key={c}
            onClick={() => setCountry(c)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              country === c ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {c === 'MY' ? '🇲🇾 Malaysia' : '🇦🇺 Australia'}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none"
              stroke={score >= 95 ? '#34d399' : score >= 80 ? '#6366f1' : '#f59e0b'}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 94.25} 94.25`}
              initial={{ strokeDasharray: '0 94.25' }}
              animate={{ strokeDasharray: `${(score / 100) * 94.25} 94.25` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{score}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-white">Compliance Score</p>
          <p className="text-[10px] text-slate-500">{passing}/{policies.length} policies passed</p>
          <span className={`text-[10px] font-semibold ${score >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {score >= 95 ? '✅ Excellent' : '⚠️ Needs attention'}
          </span>
        </div>
      </div>

      {/* Policy list */}
      <div className="space-y-1.5">
        {policies.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors ${
              p.status ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-amber-500/5 border-amber-500/20'
            }`}
          >
            {p.status
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              : <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
            <span className="text-xs text-slate-300 flex-1">{p.name}</span>
            <span className={`text-[9px] font-semibold ${p.status ? 'text-emerald-400' : 'text-amber-400'}`}>
              {p.status ? 'Compliant' : 'Action needed'}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'ai', label: 'AI Assistant', icon: Brain },
  { id: 'leave', label: 'Leave', icon: Calendar },
  { id: 'compliance', label: 'Compliance', icon: Shield },
];

export function LiveDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <section id="live-demo" className="landing-section relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Demo — No Login Required
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Try It Right Now. <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">No Sign-Up Needed.</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Explore the full HR platform interactively. Click through every module below — approve leave, ask the AI, check compliance scores.
          </p>
        </div>

        {/* Browser Window */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glow halo */}
          <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-indigo-500/15 blur-3xl rounded-3xl pointer-events-none" />

          <div className="relative bg-[#0D0D1F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Window chrome */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white/4 border-b border-white/8">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-md px-4 py-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-400 font-mono">app.hrmanager4u.ai/dashboard</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-600">DEMO MODE</div>
            </div>

            <div className="flex" style={{ height: 520 }}>
              {/* Sidebar */}
              <div className="w-44 bg-white/2 border-r border-white/6 flex flex-col py-3 gap-0.5 px-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">HRManager4U</span>
                </div>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/25'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                ))}
                <div className="mt-auto px-2 pt-3 border-t border-white/6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[9px] font-bold">RC</div>
                    <div>
                      <p className="text-[10px] text-white font-semibold">Roy Chen</p>
                      <p className="text-[9px] text-slate-600">Super Admin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'employees' && <EmployeesTab />}
                    {activeTab === 'ai' && <AITab />}
                    {activeTab === 'leave' && <LeaveTab />}
                    {activeTab === 'compliance' && <ComplianceTab />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* CTA below demo */}
        <div className="text-center mt-10">
          <p className="text-slate-500 text-sm mb-4">Ready to use this for your company?</p>
          <div className="flex gap-3 justify-center">
            <a href="/register" className="btn-primary px-6 py-3">
              Start Free Trial <ChevronRight className="w-4 h-4" />
            </a>
            <a href="/login" className="btn-secondary px-6 py-3">Sign In</a>
          </div>
        </div>
      </div>
    </section>
  );
}
