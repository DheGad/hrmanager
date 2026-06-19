'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Play, Shield, Globe, Star,
  Users, Brain, Zap, Check, X, Search,
  AlertCircle, BarChart2, CheckCircle2
} from 'lucide-react';

/* ─── Animated Counter ──────────────────────────────────── */
function Counter({ target, suffix = '', prefix = '', duration = 2000 }: { target: number; suffix?: string; prefix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(target * eased));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ─── Hero Interactive Live Demo (right panel) ──────────── */
const HERO_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'ai', label: 'AI Chat', icon: Brain },
  { id: 'leave', label: 'Leave', icon: CheckCircle2 },
  { id: 'compliance', label: 'Compliance', icon: Shield },
];

const INIT_LEAVE = [
  { id: 1, name: 'James Lim', type: 'Annual Leave · 3 days', avatar: 'JL', color: 'from-emerald-500 to-teal-600', status: 'pending' },
  { id: 2, name: 'Sarah Tan', type: 'Medical Leave · 1 day', avatar: 'ST', color: 'from-indigo-500 to-blue-600', status: 'pending' },
];

const AI_MSGS = [
  { q: 'Notice period for 3 years service?', a: 'Under §12 Employment Act 1955 — 6 weeks minimum for 2–5 years service.', cite: 'EA 1955 §12' },
  { q: 'Maternity leave entitlement?', a: '98 consecutive days fully paid — Employment Act 1955 §37.', cite: 'EA 1955 §37' },
  { q: 'Australia minimum wage 2026?', a: 'AUD $24.10/hr from July 2026 (Fair Work Commission review).', cite: 'Fair Work Act 2009' },
];

const COMPLIANCE_DATA = {
  MY: [
    { name: 'Employment Act 1955', ok: true },
    { name: 'PDPA 2010', ok: true },
    { name: 'Industrial Relations Act', ok: true },
    { name: 'Occupational Safety Act', ok: false },
  ],
  AU: [
    { name: 'Fair Work Act 2009', ok: true },
    { name: 'National Employment Standards', ok: true },
    { name: 'Privacy Act 1988', ok: false },
    { name: 'WH&S Act 2011', ok: true },
  ],
};

const EMPLOYEES_LIST = [
  { name: 'Roy Chen', role: 'CEO', avatar: 'RC', color: 'from-amber-500 to-orange-600', dept: 'Executive', status: 'active' },
  { name: 'Winne Ahmad', role: 'HR Director', avatar: 'WA', color: 'from-violet-500 to-purple-600', dept: 'HR', status: 'active' },
  { name: 'Jonne Williams', role: 'Head of Eng', avatar: 'JW', color: 'from-blue-500 to-cyan-600', dept: 'Tech', status: 'active' },
  { name: 'Priya Nair', role: 'HR Manager', avatar: 'PN', color: 'from-rose-500 to-pink-600', dept: 'HR', status: 'on-leave' },
];

const BARS = [65, 72, 78, 83, 90, 96];
const BAR_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function HeroLiveDemo() {
  const [tab, setTab] = useState('dashboard');
  const [tick, setTick] = useState(0);
  const [leaveItems, setLeaveItems] = useState(INIT_LEAVE);
  const [country, setCountry] = useState<'MY' | 'AU'>('MY');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 3500);
    return () => clearInterval(t);
  }, []);

  const aiMsg = AI_MSGS[tick % AI_MSGS.length];
  const score = country === 'MY' ? 98 : 92;
  const policies = COMPLIANCE_DATA[country];
  const employees = EMPLOYEES_LIST.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const approve = (id: number) =>
    setLeaveItems(ls => ls.map(l => l.id === id ? { ...l, status: 'approved' } : l));
  const reject = (id: number) =>
    setLeaveItems(ls => ls.map(l => l.id === id ? { ...l, status: 'rejected' } : l));

  return (
    <div className="relative w-full" style={{ maxWidth: 560 }}>
      {/* Ambient glow */}
      <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-indigo-500/20 blur-2xl rounded-3xl pointer-events-none" />

      {/* Browser shell */}
      <div className="relative bg-[#0B0B18] border border-white/12 rounded-2xl overflow-hidden shadow-2xl shadow-black/70">

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/4 border-b border-white/8">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded px-3 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">app.hrmanager4u.ai/dashboard</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            LIVE · NO LOGIN
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/8 bg-white/2">
          {HERO_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-all duration-200 border-b-2 ${
                tab === t.id
                  ? 'text-indigo-300 border-indigo-500 bg-indigo-500/8'
                  : 'text-slate-600 border-transparent hover:text-slate-400 hover:bg-white/3'
              }`}
            >
              <t.icon className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ height: 340 }} className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >

              {/* ── DASHBOARD ── */}
              {tab === 'dashboard' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Good morning, Roy 👋</p>
                    <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      All systems normal
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Employees', value: '1,247', change: '+12', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                      { label: 'Leave Approval', value: '94%', change: '+3%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { label: 'Compliance', value: '98%', change: 'Excellent', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                      { label: 'AI Queries', value: '3,891', change: '+891', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    ].map(k => (
                      <div key={k.label} className={`${k.bg} border border-white/8 rounded-xl p-2.5`}>
                        <p className="text-[9px] text-slate-500">{k.label}</p>
                        <p className={`text-base font-bold ${k.color}`}>{k.value}</p>
                        <p className="text-[9px] text-emerald-400">↑ {k.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/4 border border-white/8 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-white">Headcount Trend</p>
                      <span className="text-[9px] text-emerald-400">+46 YTD</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-10">
                      {BARS.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.07, duration: 0.5 }}
                            className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400"
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[7px] text-slate-600">{BAR_LABELS[i].slice(0, 1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── EMPLOYEES ── */}
              {tab === 'employees' && (
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-2.5 py-1.5">
                    <Search className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search employees..."
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">{employees.length} employees</p>
                  {employees.map((emp, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl p-2.5 hover:border-indigo-500/30 transition-colors cursor-pointer">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${emp.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                        {emp.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.role} · {emp.dept}</p>
                      </div>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        emp.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {emp.status === 'active' ? 'Active' : 'On Leave'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── AI CHAT ── */}
              {tab === 'ai' && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-white/6">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                      <Brain className="w-2.5 h-2.5 text-white" />
                    </div>
                    <p className="text-[10px] font-semibold text-white">HR AI Assistant</p>
                    <span className="ml-auto flex items-center gap-1 text-[9px] text-emerald-400">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />Live
                    </span>
                  </div>
                  <div className="flex-1 p-4 space-y-3 overflow-auto">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tick}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-end">
                          <div className="bg-indigo-500/80 text-white text-[10px] px-3 py-1.5 rounded-xl rounded-tr-sm max-w-[80%]">
                            {aiMsg.q}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Brain className="w-2 h-2 text-white" />
                          </div>
                          <div className="bg-white/6 border border-white/8 rounded-xl rounded-tl-sm px-2.5 py-2 flex-1">
                            <p className="text-[10px] text-slate-300 leading-relaxed">{aiMsg.a}</p>
                            <p className="mt-1 text-[9px] text-indigo-400">📖 {aiMsg.cite}</p>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="p-3 border-t border-white/6">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-slate-600 flex-1">Ask any HR legal question...</span>
                      <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
                        <ArrowRight className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── LEAVE ── */}
              {tab === 'leave' && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Pending', value: leaveItems.filter(l => l.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                      { label: 'Approved', value: leaveItems.filter(l => l.status === 'approved').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { label: 'Rejected', value: leaveItems.filter(l => l.status === 'rejected').length, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} border border-white/6 rounded-xl p-2.5 text-center`}>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[9px] text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {leaveItems.map(item => (
                        <motion.div key={item.id} layout className="bg-white/4 border border-white/8 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                              {item.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white">{item.name}</p>
                              <p className="text-[10px] text-slate-500">{item.type}</p>
                            </div>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                              item.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                              item.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                            }`}>{item.status}</span>
                          </div>
                          {item.status === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => approve(item.id)}
                                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/25 transition-colors">
                                <Check className="w-2.5 h-2.5" /> Approve
                              </button>
                              <button onClick={() => reject(item.id)}
                                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold hover:bg-rose-500/20 transition-colors">
                                <X className="w-2.5 h-2.5" /> Reject
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ── COMPLIANCE ── */}
              {tab === 'compliance' && (
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    {(['MY', 'AU'] as const).map(c => (
                      <button key={c} onClick={() => setCountry(c)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          country === c ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}>
                        {c === 'MY' ? '🇲🇾 Malaysia' : '🇦🇺 Australia'}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white/4 border border-white/8 rounded-xl p-3 flex items-center gap-4">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <motion.circle cx="18" cy="18" r="15" fill="none"
                          stroke={score >= 95 ? '#34d399' : '#f59e0b'}
                          strokeWidth="3" strokeLinecap="round"
                          initial={{ strokeDasharray: '0 94.25' }}
                          animate={{ strokeDasharray: `${(score / 100) * 94.25} 94.25` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{score}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Compliance Score</p>
                      <p className="text-[10px] text-slate-500">{policies.filter(p => p.ok).length}/{policies.length} policies passed</p>
                      <span className={`text-[10px] font-semibold ${score >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {score >= 95 ? '✅ Excellent' : '⚠️ Needs attention'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {policies.map((p, i) => (
                      <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] ${
                        p.ok ? 'bg-emerald-500/5 border-emerald-500/15 text-slate-300' : 'bg-amber-500/5 border-amber-500/20 text-slate-300'
                      }`}>
                        {p.ok
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          : <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        <span className="flex-1">{p.name}</span>
                        <span className={`font-semibold ${p.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {p.ok ? 'Pass' : 'Action'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/2 border-t border-white/6">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[8px] font-bold">RC</div>
          <p className="text-[10px] text-slate-500">Roy Chen · Super Admin</p>
          <span className="ml-auto text-[9px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Interactive Demo</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────── */
const TYPEWRITER_PHRASES = ['Employment Act 1955', 'Fair Work Act 2009', 'PDPA Compliance', 'Leave Management', 'HR Legal Advice'];

export function LandingHero() {
  const [typedText, setTypedText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx];
    const speed = deleting ? 35 : 75;
    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIdx < phrase.length) {
          setTypedText(phrase.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        } else {
          const pause = setTimeout(() => setDeleting(true), 1800);
          return () => clearTimeout(pause);
        }
      } else {
        if (charIdx > 0) {
          setTypedText(phrase.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        } else {
          setDeleting(false);
          setPhraseIdx(p => (p + 1) % TYPEWRITER_PHRASES.length);
        }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, phraseIdx]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden landing-grid-bg pt-20 pb-16">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full bg-indigo-600/12 blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-emerald-600/6 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">

          {/* LEFT */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                🚀 Trusted by 10,000+ Companies Across Asia-Pacific
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.05 } } }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.04] tracking-tight text-white">
                The{' '}
                <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  AI-Powered
                </span>
                <br />HR OS Built
                <br />for{' '}
                <span style={{ background: 'linear-gradient(90deg, #34d399, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Asia-Pacific.
                </span>
              </h1>
            </motion.div>

            {/* Typewriter sub */}
            <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15 } } }}>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Automate compliance, manage the full employee lifecycle, and get instant AI-powered guidance on{' '}
                <span className="text-indigo-300 font-semibold">
                  {typedText}<span className="animate-pulse text-indigo-400">|</span>
                </span>
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } } }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/register" className="btn-primary px-7 py-3.5 text-base rounded-xl">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#live-demo" className="btn-secondary px-7 py-3.5 text-base rounded-xl flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                </div>
                Watch Live Demo
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.25 } } }}
              className="flex flex-wrap gap-2"
            >
              {['🔐 SOC2 Type II', '🌐 ISO 27001', '✅ PDPA Compliant', '⚖️ Fair Work Act'].map(b => (
                <span key={b} className="text-xs text-slate-400 border border-white/10 px-3 py-1.5 rounded-full bg-white/3">
                  {b}
                </span>
              ))}
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3 } } }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {['RC', 'WA', 'JW', 'PN', 'JL'].map((initials, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0F0F1A] flex items-center justify-center text-white text-[10px] font-bold bg-gradient-to-br ${
                    ['from-amber-500 to-orange-600','from-violet-500 to-purple-600','from-blue-500 to-cyan-600','from-rose-500 to-pink-600','from-emerald-500 to-teal-600'][i]
                  }`}>
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-400"><span className="text-white font-semibold">4.9/5</span> from 2,400+ HR teams</p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Interactive Live Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:flex flex-col items-end"
          >
            <HeroLiveDemo />
          </motion.div>

        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Companies Served', value: 10000, suffix: '+', color: 'text-indigo-400', icon: Globe },
            { label: 'Employees Managed', value: 1000000, suffix: '+', color: 'text-emerald-400', icon: Users },
            { label: 'Uptime SLA', value: 99, suffix: '.9%', color: 'text-violet-400', icon: Zap },
            { label: 'AI Queries Answered', value: 5000000, suffix: '+', color: 'text-amber-400', icon: Brain },
          ].map(s => (
            <div key={s.label} className="glass-panel p-5 rounded-2xl text-center group hover:border-white/15 transition-colors">
              <div className={`text-3xl font-black ${s.color} mb-1`}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
