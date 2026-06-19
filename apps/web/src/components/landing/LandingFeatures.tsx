'use client';

import {
  Brain,
  Calendar,
  Shield,
  FileText,
  Users,
  GitBranch,
  Lock,
  BarChart3,
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'AI HR Assistant',
    description:
      'Get instant, accurate answers on Employment Act 1955 and Fair Work Act 2009. Ask anything from notice periods to redundancy entitlements.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    glow: 'group-hover:shadow-indigo-500/20',
  },
  {
    icon: Calendar,
    title: 'Leave Management',
    description:
      'Multi-tier approval workflows with automatic balance calculation, carry-forward rules, and real-time calendar sync across your organisation.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    glow: 'group-hover:shadow-violet-500/20',
  },
  {
    icon: Shield,
    title: 'Compliance Engine',
    description:
      'Real-time policy scoring and risk assessment across Malaysian, Australian and Singaporean labour law jurisdictions. Stay audit-ready, always.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    icon: FileText,
    title: 'Document Generator',
    description:
      'Generate employment contracts, offer letters, warning letters, and HR handbooks in seconds — legally reviewed templates for each country.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: Users,
    title: 'Employee Lifecycle',
    description:
      'From onboarding to offboarding — manage the complete workforce journey including probation tracking, performance reviews, and separation.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    glow: 'group-hover:shadow-sky-500/20',
  },
  {
    icon: GitBranch,
    title: 'Workflow Automation',
    description:
      'Build multi-level, SLA-enforced approval chains for any HR process. Escalate automatically when approvers miss deadlines.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/15',
    glow: 'group-hover:shadow-pink-500/20',
  },
  {
    icon: Lock,
    title: 'Digital Vault',
    description:
      'Encrypted secure document storage with granular access controls, tamper-proof audit trails, and SOC2 Type II certified infrastructure.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    glow: 'group-hover:shadow-rose-500/20',
  },
  {
    icon: BarChart3,
    title: 'HR Analytics',
    description:
      'Executive dashboards with real-time headcount, attrition, payroll cost, and compliance metrics. Export board-ready reports in one click.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/15',
    glow: 'group-hover:shadow-teal-500/20',
  },
];

export function LandingFeatures() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      id="features"
      ref={ref}
      aria-labelledby="features-heading"
      className="relative py-24 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4">
            Everything You Need
          </span>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            One Platform. Every HR Need.
          </h2>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">
            HRManager4U.ai combines every tool your HR team needs into a single,
            AI-powered platform — from compliance tracking to talent management.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={cn(
                  'group glass-panel glass-panel-hover rounded-xl p-6 flex flex-col gap-4 transition-all duration-700',
                  `hover:shadow-2xl ${feature.glow}`,
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
                    feature.bg
                  )}
                >
                  <Icon className={cn('w-5 h-5', feature.color)} />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
