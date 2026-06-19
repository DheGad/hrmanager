'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Users, Brain, Shield, Workflow, BarChart2, FileText,
  ChevronRight, Play, CheckCircle2, ArrowRight, Zap,
  Clock, Globe, Lock, Star, TrendingUp, MessageSquare
} from 'lucide-react';

const STEPS = [
  {
    id: 1,
    icon: Brain,
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.3)',
    tag: 'AI-Powered',
    title: 'Ask any HR question. Get lawyer-grade answers in seconds.',
    desc: 'Your AI HR Assistant is trained on Employment Act 1955, Fair Work Act 2009, and 50+ legal instruments. Accurate. Cited. Instant.',
    stat: { value: '< 3s', label: 'Average response time' },
    visual: 'ai',
  },
  {
    id: 2,
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.3)',
    tag: 'Employee Lifecycle',
    title: 'Hire to retire. Every step. Zero paperwork.',
    desc: 'Onboard new hires with a guided wizard, manage contracts, track performance, and process offboarding — all in one place.',
    stat: { value: '80%', label: 'Time saved on HR admin' },
    visual: 'employees',
  },
  {
    id: 3,
    icon: Shield,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.3)',
    tag: 'Compliance Engine',
    title: 'Stay 100% compliant. Automatically.',
    desc: 'Real-time compliance scoring against MY + AU regulations. Get instant alerts when policies drift and one-click remediation.',
    stat: { value: '98%', label: 'Avg compliance score' },
    visual: 'compliance',
  },
  {
    id: 4,
    icon: Workflow,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.3)',
    tag: 'Workflow Automation',
    title: 'Approvals in 1 click. SLA guaranteed.',
    desc: 'Multi-level approval workflows with automatic escalation. Leave, expenses, promotions — approved or escalated within your defined SLA.',
    stat: { value: '4h', label: 'Average approval time' },
    visual: 'workflow',
  },
  {
    id: 5,
    icon: BarChart2,
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.3)',
    tag: 'Analytics & Insights',
    title: 'Make every HR decision with data.',
    desc: 'Executive dashboards showing headcount trends, attrition risk, compliance gaps, and AI usage — all updated in real-time.',
    stat: { value: '12x', label: 'Faster HR reporting' },
    visual: 'analytics',
  },
];

/* ─── Visual for each step ──────────────────────────────────── */
function StepVisual({ visual, active }: { visual: string; active: boolean }) {
  const variants = {
    hidden: { opacity: 0, scale: 0.95, y: 12 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
    exit: { opacity: 0, scale: 0.95, y: -12, transition: { duration: 0.25 } },
  };

  if (visual === 'ai') return (
    <motion.div variants={variants} initial="hidden" animate="show" exit="exit"
      className="bg-[#0D0D1F] border border-white/10 rounded-2xl overflow-hidden p-4 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-white/6">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-white">HR AI Assistant</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
        </span>
      </div>
      {[
        { q: 'What is maternity leave entitlement under Employment Act?', a: 'Under Section 37 of the Employment Act 1955, every female employee is entitled to at least 98 consecutive days of maternity leave...', cite: 'Employment Act 1955, Section 37' },
        { q: 'Fair Work Act — minimum wage Australia 2026?', a: 'The National Minimum Wage from July 2026 is AUD $24.10/hour ($914.30 per 38-hour week), increased by 3.75% from the Fair Work Commission review...', cite: 'Fair Work Act 2009, Section 284' },
      ].map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 + 0.2 }}>
          <div className="flex justify-end mb-1.5">
            <div className="bg-indigo-500/80 rounded-xl rounded-tr-sm px-3 py-1.5 text-[11px] text-white max-w-[80%]">{item.q}</div>
          </div>
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Brain className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="bg-white/6 border border-white/8 rounded-xl rounded-tl-sm px-3 py-2 flex-1">
              <p className="text-[11px] text-slate-300 leading-relaxed">{item.a}</p>
              <p className="mt-1 text-[9px] text-indigo-400">📖 {item.cite}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  if (visual === 'employees') return (
    <motion.div variants={variants} initial="hidden" animate="show" exit="exit"
      className="bg-[#0D0D1F] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/6">
        <span className="text-xs font-semibold text-white">Employee Directory</span>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">1,247 active</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: 'Roy Chen', role: 'CEO', avatar: 'RC', color: 'from-amber-500 to-orange-600', joined: 'Jan 2021', dept: 'Executive' },
          { name: 'Winne Ahmad', role: 'HR Director', avatar: 'WA', color: 'from-violet-500 to-purple-600', joined: 'Mar 2020', dept: 'HR' },
          { name: 'Jonne Williams', role: 'Head of Eng', avatar: 'JW', color: 'from-blue-500 to-cyan-600', joined: 'Jun 2019', dept: 'Tech' },
          { name: 'Priya Nair', role: 'HR Manager', avatar: 'PN', color: 'from-rose-500 to-pink-600', joined: 'Sep 2022', dept: 'HR' },
        ].map((emp, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}
            className="bg-white/4 border border-white/8 rounded-xl p-3 hover:border-indigo-500/30 transition-colors cursor-pointer">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${emp.color} flex items-center justify-center text-white text-xs font-bold mb-2`}>{emp.avatar}</div>
            <p className="text-xs font-semibold text-white">{emp.name}</p>
            <p className="text-[10px] text-slate-500">{emp.role}</p>
            <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full mt-1 inline-block">{emp.dept}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  if (visual === 'compliance') return (
    <motion.div variants={variants} initial="hidden" animate="show" exit="exit"
      className="bg-[#0D0D1F] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/6">
        <span className="text-xs font-semibold text-white">Compliance Engine</span>
        <span className="text-[10px] text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full">🇲🇾 Malaysia</span>
      </div>
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle cx="18" cy="18" r="15" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"
              initial={{ strokeDasharray: '0 94.25' }}
              animate={{ strokeDasharray: `${0.98 * 94.25} 94.25` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">98%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Excellent</p>
          <p className="text-xs text-slate-500">5/6 policies compliant</p>
          <div className="flex gap-1 flex-wrap">
            {['EA 1955', 'PDPA', 'IRO 1967', 'Min Wages'].map(t => (
              <span key={t} className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full">✓ {t}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Policies */}
      {['Employment Act 1955', 'PDPA 2010', 'Industrial Relations Act 1967', 'Minimum Wages Order 2022', 'Occupational Safety Act 1994'].map((p, i) => (
        <div key={p} className={`flex items-center gap-2 p-2 rounded-lg ${i === 4 ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-emerald-500/5 border border-emerald-500/15'}`}>
          {i === 4 ? <Shield className="w-3 h-3 text-amber-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          <span className="text-[11px] text-slate-300 flex-1">{p}</span>
          <span className={`text-[9px] font-semibold ${i === 4 ? 'text-amber-400' : 'text-emerald-400'}`}>{i === 4 ? 'Action needed' : 'Compliant'}</span>
        </div>
      ))}
    </motion.div>
  );

  if (visual === 'workflow') return (
    <motion.div variants={variants} initial="hidden" animate="show" exit="exit"
      className="bg-[#0D0D1F] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/6">
        <span className="text-xs font-semibold text-white">Approval Workflows</span>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">3 pending</span>
      </div>
      {[
        { name: 'Jonne Williams', type: 'Annual Leave · 5 days', step: 'Manager Review', progress: 50 },
        { name: 'Winne Ahmad', type: 'Expense Claim · RM 2,400', step: 'Finance Approval', progress: 75 },
        { name: 'Priya Nair', type: 'Promotion — Level 3→4', step: 'HR + CEO Sign-off', progress: 25 },
      ].map((w, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 + 0.2 }}
          className="bg-white/4 border border-white/8 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-white">{w.name}</p>
              <p className="text-[10px] text-slate-500">{w.type}</p>
            </div>
            <span className="text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{w.step}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${w.progress}%` }}
              transition={{ duration: 0.8, delay: i * 0.2 + 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
            />
          </div>
          <p className="text-[9px] text-slate-600 mt-1">{w.progress}% complete · SLA: 4h remaining</p>
        </motion.div>
      ))}
    </motion.div>
  );

  // analytics
  return (
    <motion.div variants={variants} initial="hidden" animate="show" exit="exit"
      className="bg-[#0D0D1F] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/6">
        <span className="text-xs font-semibold text-white">Executive Analytics</span>
        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Live · Jun 2026</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Headcount', value: '1,247', change: '+12', up: true, color: 'text-indigo-400' },
          { label: 'Attrition Rate', value: '2.3%', change: '-0.5%', up: false, color: 'text-emerald-400' },
          { label: 'Time-to-Hire', value: '18 days', change: '-4 days', up: false, color: 'text-violet-400' },
          { label: 'Engagement', value: '87%', change: '+3%', up: true, color: 'text-amber-400' },
        ].map((m, i) => (
          <div key={m.label} className="bg-white/4 border border-white/8 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 mb-1">{m.label}</p>
            <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
            <p className={`text-[9px] ${m.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {m.up ? '↑' : '↓'} {m.change}
            </p>
          </div>
        ))}
      </div>
      {/* Mini chart */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-3">
        <p className="text-[10px] text-slate-500 mb-2">Headcount trend (6 months)</p>
        <div className="flex items-end gap-1.5 h-12">
          {[65, 72, 79, 83, 89, 96].map((h, i) => (
            <motion.div key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.08 + 0.3, duration: 0.5 }}
              className="flex-1 rounded-t bg-gradient-to-t from-rose-600 to-rose-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
            <span key={m} className="text-[8px] text-slate-600">{m}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Product Tour ─────────────────────────────────────── */
export function ProductTour() {
  const [activeStep, setActiveStep] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: false, margin: '-20% 0px' });

  useEffect(() => {
    if (!autoplay || !inView) return;
    setProgress(0);
    const stepDuration = 5000;
    const tickInterval = 50;
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += tickInterval;
      setProgress((elapsed / stepDuration) * 100);
      if (elapsed >= stepDuration) {
        elapsed = 0;
        setProgress(0);
        setActiveStep(s => (s + 1) % STEPS.length);
      }
    }, tickInterval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeStep, autoplay, inView]);

  const goToStep = (i: number) => {
    setActiveStep(i);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoplay(true);
  };

  const step = STEPS[activeStep];

  return (
    <section ref={sectionRef} id="product-tour" className="landing-section relative overflow-hidden">
      {/* BG gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-4">
            <Play className="w-3 h-3 fill-current" /> Interactive Product Tour
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Understand everything
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400"> in one shot.</span>
          </h2>
          <p className="text-slate-400 text-lg">
            See exactly how HRManager4U.ai works — every feature, every module, live and interactive.
          </p>
        </div>

        {/* Main tour layout */}
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Steps nav — left */}
          <div className="lg:col-span-2 space-y-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goToStep(i)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                  activeStep === i
                    ? 'bg-white/6 border-white/15 shadow-lg'
                    : 'bg-white/2 border-white/6 hover:bg-white/4 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 ${activeStep === i ? 'scale-110' : 'scale-100 opacity-60'}`}>
                    <s.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${activeStep === i ? 'text-indigo-400' : 'text-slate-600'}`}>{s.tag}</span>
                      {activeStep === i && (
                        <span className="text-[10px] text-slate-500">{Math.round(progress)}%</span>
                      )}
                    </div>
                    <p className={`text-sm font-semibold leading-snug ${activeStep === i ? 'text-white' : 'text-slate-400'}`}>
                      {s.title}
                    </p>
                    {activeStep === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-slate-500 mt-1.5 leading-relaxed"
                      >
                        {s.desc}
                      </motion.p>
                    )}
                    {/* Progress bar */}
                    {activeStep === i && (
                      <div className="mt-3 w-full h-0.5 bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Stat callout */}
            <div className="mt-4 p-4 bg-white/3 border border-white/8 rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center"
                >
                  <p className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${step.color}`}>
                    {step.stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{step.stat.label}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Visual — right */}
          <div className="lg:col-span-3 relative">
            {/* Glow behind visual */}
            <AnimatePresence>
              <motion.div
                key={activeStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-6 rounded-3xl blur-2xl pointer-events-none"
                style={{ background: `radial-gradient(ellipse at center, ${step.glow} 0%, transparent 70%)` }}
              />
            </AnimatePresence>

            <div className="relative">
              {/* Step number badge */}
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold z-10 shadow-lg shadow-indigo-500/30">
                {activeStep + 1}
              </div>

              <AnimatePresence mode="wait">
                <StepVisual key={activeStep} visual={step.visual} active={true} />
              </AnimatePresence>
            </div>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeStep ? 'w-6 h-2 bg-indigo-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
              <button
                onClick={() => setAutoplay(a => !a)}
                className="ml-3 w-7 h-7 rounded-full bg-white/8 border border-white/12 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                {autoplay
                  ? <span className="w-2.5 h-2.5 flex gap-0.5"><span className="w-1 h-2.5 bg-slate-400 rounded-sm" /><span className="w-1 h-2.5 bg-slate-400 rounded-sm" /></span>
                  : <Play className="w-3 h-3 text-slate-400 fill-current" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
