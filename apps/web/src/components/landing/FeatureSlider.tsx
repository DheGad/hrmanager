'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Users, Shield, Workflow, BarChart2, FileText,
  Lock, Globe, Zap, ChevronLeft, ChevronRight, ArrowRight
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.25)',
    accent: '#818cf8',
    label: 'AI HR Assistant',
    headline: 'Your 24/7 HR Legal Expert',
    body: 'Ask anything. Employment Act 1955, Fair Work Act 2009, PDPA, superannuation — the AI knows it all. Answers in under 3 seconds with legal citations.',
    bullets: ['99.4% answer accuracy', 'Legal citations included', 'Malaysia + Australia coverage', 'Multilingual: EN / BM / ZH'],
    visual: (
      <div className="space-y-2 p-1">
        <div className="flex justify-end">
          <div className="bg-indigo-500/80 text-white text-xs px-3 py-2 rounded-xl rounded-tr-sm max-w-[85%]">
            What is the notice period for 3 years service?
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="bg-white/6 border border-white/10 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-slate-300">
            Under <span className="text-indigo-400">Section 12</span> of the Employment Act 1955, for an employee with 2–5 years of service, the minimum notice period is <span className="text-emerald-400 font-semibold">6 weeks</span> for either party.
            <div className="mt-1.5 text-[9px] text-indigo-400/80 border-t border-white/10 pt-1">📖 Employment Act 1955 — Section 12(2)</div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-indigo-500/80 text-white text-xs px-3 py-2 rounded-xl rounded-tr-sm">
            Can I pay in lieu of notice?
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="bg-white/6 border border-white/10 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-slate-300">
            Yes. Section 12(3) allows either party to waive the notice period by paying an amount equal to <span className="text-emerald-400 font-semibold">wages for the notice period</span>.
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.25)',
    accent: '#34d399',
    label: 'Employee Lifecycle',
    headline: 'From Hire to Retire. All in One Place.',
    body: 'Onboard, manage, grow, and offboard employees with automated workflows, digital contracts, and compliance checks baked in.',
    bullets: ['7-step onboarding wizard', 'Digital contract signing', 'Performance tracking', 'Exit interview automation'],
    visual: (
      <div className="space-y-2 p-1">
        <div className="text-xs text-slate-400 mb-2 font-medium">Employee Lifecycle</div>
        <div className="flex items-center gap-0">
          {['Offer', 'Onboard', 'Active', 'Growth', 'Exit'].map((step, i, arr) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex-1 flex flex-col items-center gap-1`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i <= 2 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/20 text-slate-500'
                }`}>{i + 1}</div>
                <span className={`text-[9px] ${i <= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>{step}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded-full ${i < 2 ? 'bg-emerald-500/50' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { name: 'Roy Chen', action: 'Offer accepted ✅', time: 'Jan 2021' },
            { name: 'Winne Ahmad', action: 'Onboarding complete ✅', time: '2d ago' },
            { name: 'Jonne Williams', action: 'Performance review due ⏰', time: 'Tomorrow' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-white/4 border border-white/6 rounded-lg px-3 py-2">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${['from-amber-500 to-orange-600','from-violet-500 to-purple-600','from-blue-500 to-cyan-600'][i]} flex items-center justify-center text-white text-[9px] font-bold`}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{item.name}</p>
                <p className="text-[10px] text-slate-500">{item.action}</p>
              </div>
              <span className="text-[9px] text-slate-600">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Shield,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.25)',
    accent: '#a78bfa',
    label: 'Compliance Engine',
    headline: 'Real-Time Legal Compliance. Zero Surprises.',
    body: 'Automated compliance scoring across Malaysia and Australia. Instant alerts, one-click remediation, audit-ready reports.',
    bullets: ['Real-time scoring', 'MY + AU legal frameworks', 'One-click remediation', 'Audit-ready PDF reports'],
    visual: (
      <div className="space-y-3 p-1">
        <div className="flex gap-2">
          {[{ country: '🇲🇾 MY', score: 98, color: 'text-emerald-400' }, { country: '🇦🇺 AU', score: 92, color: 'text-amber-400' }].map(c => (
            <div key={c.country} className="flex-1 bg-white/4 border border-white/8 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">{c.country}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.score}%</p>
              <p className="text-[9px] text-slate-500">Compliance</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Employment Act 1955', ok: true },
            { name: 'PDPA 2010', ok: true },
            { name: 'Industrial Relations Act', ok: true },
            { name: 'OSH Act 1994', ok: false },
          ].map((p, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${p.ok ? 'bg-emerald-500/5 border-emerald-500/15 text-slate-300' : 'bg-amber-500/8 border-amber-500/25 text-slate-300'}`}>
              <span className={p.ok ? 'text-emerald-400' : 'text-amber-400'}>{p.ok ? '✓' : '⚠'}</span>
              {p.name}
              <span className={`ml-auto text-[9px] font-semibold ${p.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{p.ok ? 'Pass' : 'Action'}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Workflow,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.25)',
    accent: '#fbbf24',
    label: 'Workflow Engine',
    headline: 'Multi-Step Approvals. SLA Guaranteed.',
    body: 'Define approval chains for leave, expenses, promotions, and more. Automatic escalation when SLAs are breached. Full audit trail.',
    bullets: ['Visual workflow builder', 'Automatic SLA escalation', 'Mobile-first approvals', 'Full audit history'],
    visual: (
      <div className="space-y-3 p-1">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span className="font-semibold text-white">Leave Request</span>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">In Progress</span>
        </div>
        {[
          { step: 'Employee Submits', person: 'Jonne Williams', done: true },
          { step: 'Manager Review', person: 'Winne Ahmad', done: true, current: false },
          { step: 'HR Approval', person: 'Priya Nair', done: false, current: true },
          { step: 'CEO Sign-off', person: 'Roy Chen', done: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 ${
              s.done ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
              s.current ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse' :
              'bg-white/5 border-white/15 text-slate-600'
            }`}>
              {s.done ? '✓' : i + 1}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium ${s.done ? 'text-emerald-400' : s.current ? 'text-amber-400' : 'text-slate-500'}`}>{s.step}</p>
              <p className="text-[10px] text-slate-600">{s.person}</p>
            </div>
            {s.current && <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Pending</span>}
          </div>
        ))}
        <div className="h-0.5 bg-white/6 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" />
        </div>
        <p className="text-[10px] text-slate-500">Step 3 of 4 · SLA: 2h remaining</p>
      </div>
    ),
  },
  {
    icon: FileText,
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.25)',
    accent: '#fb7185',
    label: 'Document Engine',
    headline: 'Generate Any HR Document. Instantly.',
    body: 'AI-generated contracts, offer letters, termination notices, handbooks, and more. Legally reviewed, policy-compliant, ready to sign.',
    bullets: ['100+ document templates', 'AI fills all fields', 'eSignature built-in', 'Version-controlled vault'],
    visual: (
      <div className="space-y-2 p-1">
        <div className="text-xs text-slate-400 mb-2 font-medium">Document Generator</div>
        {[
          { type: 'Employment Contract', status: 'Generated', icon: '📄', color: 'text-emerald-400' },
          { type: 'Offer Letter — Roy Chen', status: 'Signed ✅', icon: '✉️', color: 'text-emerald-400' },
          { type: 'Termination Notice', status: 'Draft', icon: '⚠️', color: 'text-amber-400' },
          { type: 'Employee Handbook 2026', status: 'Published', icon: '📚', color: 'text-indigo-400' },
        ].map((doc, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 hover:border-white/15 transition-colors cursor-pointer">
            <span className="text-sm">{doc.icon}</span>
            <p className="flex-1 text-xs font-medium text-white">{doc.type}</p>
            <span className={`text-[10px] font-semibold ${doc.color}`}>{doc.status}</span>
          </div>
        ))}
        <div className="mt-2 flex gap-2">
          <button className="flex-1 text-[10px] font-semibold bg-rose-500/80 hover:bg-rose-500 text-white py-1.5 rounded-lg transition-colors">+ New Document</button>
          <button className="flex-1 text-[10px] font-semibold bg-white/6 border border-white/10 text-slate-300 py-1.5 rounded-lg transition-colors">View Vault</button>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart2,
    color: 'from-sky-500 to-blue-600',
    glow: 'rgba(14,165,233,0.25)',
    accent: '#38bdf8',
    label: 'Analytics & Reporting',
    headline: 'Make Every HR Decision with Real Data.',
    body: 'Executive dashboards, attrition risk AI, headcount forecasting, and compliance reporting — all updated in real-time.',
    bullets: ['Real-time dashboards', 'AI attrition prediction', 'Custom report builder', 'Board-ready exports'],
    visual: (
      <div className="space-y-3 p-1">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Headcount', val: '1,247', change: '↑ +12', col: 'text-sky-400' },
            { label: 'Attrition', val: '2.3%', change: '↓ -0.5', col: 'text-emerald-400' },
            { label: 'Engagement', val: '87%', change: '↑ +3', col: 'text-violet-400' },
          ].map(m => (
            <div key={m.label} className="bg-white/4 border border-white/8 rounded-lg p-2 text-center">
              <p className="text-[8px] text-slate-500">{m.label}</p>
              <p className={`text-sm font-bold ${m.col}`}>{m.val}</p>
              <p className="text-[9px] text-emerald-400">{m.change}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 mb-2">6-Month Headcount Trend</p>
          <div className="flex items-end gap-1 h-16">
            {[58, 66, 74, 80, 88, 96].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                  className="w-full rounded-t bg-gradient-to-t from-sky-600 to-sky-400"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => <span key={i} className="text-[8px] text-slate-600 flex-1 text-center">{m.slice(0,1)}</span>)}
          </div>
        </div>
      </div>
    ),
  },
];

export function FeatureSlider() {
  const [active, setActive] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Rock-solid autoplay: never accumulates, always restarts cleanly
  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActive(a => (a + 1) % FEATURES.length);
    }, 5000);
  };

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (i: number) => {
    setActive((i + FEATURES.length) % FEATURES.length);
    // Reset timer on manual navigation
    startAuto();
  };

  return (
    <section id="features" className="landing-section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/2 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold mb-4">
            <Zap className="w-3 h-3" /> 6 Powerful Modules
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Every HR workflow.
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400"> One unified platform.</span>
          </h2>
          <p className="text-slate-400 text-lg">Built for enterprise HR teams in Malaysia and Australia.</p>
        </div>

        {/* Pill tab bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FEATURES.map((f, i) => (
            <button
              key={f.label}
              onClick={() => go(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                i === active
                  ? `bg-gradient-to-r ${f.color} text-white shadow-lg`
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/8'
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
            className="relative"
          >
            {/* Glow */}
            <div
              className="absolute -inset-8 rounded-3xl blur-3xl pointer-events-none opacity-40"
              style={{ background: `radial-gradient(ellipse at 30% 50%, ${FEATURES[active].glow}, transparent 70%)` }}
            />

            <div className="relative grid lg:grid-cols-2 gap-8 items-center bg-white/3 border border-white/8 rounded-3xl p-8 lg:p-12">
              {/* Left — text */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${FEATURES[active].color} flex items-center justify-center shadow-xl`}>
                    {(() => { const Icon = FEATURES[active].icon; return <Icon className="w-6 h-6 text-white" />; })()}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: FEATURES[active].accent }}>{FEATURES[active].label}</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{FEATURES[active].headline}</h3>
                <p className="text-slate-400 text-base leading-relaxed">{FEATURES[active].body}</p>
                <ul className="space-y-2.5">
                  {FEATURES[active].bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${FEATURES[active].color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-[9px] text-white font-bold">✓</span>
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
                <button className="btn-primary mt-2" style={{ background: `linear-gradient(135deg, ${FEATURES[active].accent}cc, ${FEATURES[active].accent})` }}>
                  Explore {FEATURES[active].label} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right — visual */}
              <div className="relative">
                <div className="bg-[#0D0D1F] border border-white/10 rounded-2xl p-4 min-h-[260px]">
                  <div className="flex items-center gap-1.5 mb-3 pb-2.5 border-b border-white/6">
                    <div className="w-2 h-2 rounded-full bg-red-500/70" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/70" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
                    <span className="ml-2 text-[10px] text-slate-500 font-mono">HRManager4U.ai / {FEATURES[active].label.toLowerCase().replace(/ /g, '-')}</span>
                  </div>
                  {FEATURES[active].visual}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => go(active - 1)} className="w-10 h-10 rounded-full bg-white/6 border border-white/12 flex items-center justify-center hover:bg-white/12 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex gap-1.5">
            {FEATURES.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-2 bg-indigo-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
          <button onClick={() => go(active + 1)} className="w-10 h-10 rounded-full bg-white/6 border border-white/12 flex items-center justify-center hover:bg-white/12 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </section>
  );
}
