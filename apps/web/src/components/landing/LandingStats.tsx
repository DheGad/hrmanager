'use client';

import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const stats = [
  { value: '10,000+', label: 'Companies Worldwide', color: 'text-indigo-400' },
  { value: '1M+', label: 'Employees Managed', color: 'text-violet-400' },
  { value: '99.9%', label: 'Platform Uptime SLA', color: 'text-emerald-400' },
  { value: '3', label: 'Countries Supported', color: 'text-amber-400' },
];

export function LandingStats() {
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: true });

  return (
    <section
      ref={ref}
      aria-label="Platform statistics"
      className="relative overflow-hidden"
    >
      {/* Gradient border top */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 25%, rgba(139,92,246,0.5) 50%, rgba(99,102,241,0.5) 75%, transparent 100%)',
        }}
      />
      {/* Gradient border bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 25%, rgba(139,92,246,0.5) 50%, rgba(99,102,241,0.5) 75%, transparent 100%)',
        }}
      />

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/[0.08]">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                'flex flex-col items-center text-center px-6 transition-all duration-700',
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span
                className={cn(
                  'text-4xl lg:text-5xl font-bold tracking-tight mb-2',
                  stat.color
                )}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {stat.value}
              </span>
              <span className="text-sm text-white/50 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
