'use client';

import { CheckCircle2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const countries = [
  {
    flag: '🇲🇾',
    name: 'Malaysia',
    color: 'border-indigo-500/30 bg-indigo-500/5',
    badgeColor: 'bg-indigo-500/15 text-indigo-300',
    iconColor: 'text-indigo-400',
    laws: [
      'Employment Act 1955 (revised 2022)',
      'Industrial Relations Act 1967',
      'Personal Data Protection Act 2010 (PDPA)',
      'Minimum Wages Order 2022',
      'SOCSO Act (Employees Social Security)',
      'EPF Act 1991 (Employees Provident Fund)',
      'Employment (Restriction) Act 1968',
      'Occupational Safety and Health Act 1994',
    ],
  },
  {
    flag: '🇦🇺',
    name: 'Australia',
    color: 'border-violet-500/30 bg-violet-500/5',
    badgeColor: 'bg-violet-500/15 text-violet-300',
    iconColor: 'text-violet-400',
    laws: [
      'Fair Work Act 2009 (FW Act)',
      'National Employment Standards (NES) — 11 entitlements',
      'Work Health and Safety Act 2011',
      'Privacy Act 1988 (+ 2024 reforms)',
      'Modern Award Coverage',
      'Long Service Leave (by state)',
      'Superannuation Guarantee (SGC)',
      'Anti-Discrimination Laws (federal + state)',
    ],
  },
  {
    flag: '🇸🇬',
    name: 'Singapore',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    badgeColor: 'bg-emerald-500/15 text-emerald-300',
    iconColor: 'text-emerald-400',
    laws: [
      'Employment Act (Chapter 91)',
      'Ministry of Manpower (MOM) Regulations',
      'Personal Data Protection Act (PDPA SG)',
      'Central Provident Fund (CPF) Act',
      'Work Injury Compensation Act (WICA)',
      'Employment of Foreign Manpower Act',
      'Retirement and Re-employment Act',
      'Child Development Co-Savings Act',
    ],
  },
];

export function LandingCompliance() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      id="compliance"
      ref={ref}
      aria-labelledby="compliance-heading"
      className="relative py-24 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-violet-600/5 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            'text-center mb-14 transition-all duration-700',
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium mb-4">
            🌏 Multi-Jurisdiction Ready
          </span>
          <h2
            id="compliance-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Built for Asia-Pacific Compliance
          </h2>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">
            Every feature is engineered to the specific labour laws, data protection
            regulations, and HR standards of each country we operate in.
          </p>
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {countries.map((country, i) => (
            <div
              key={country.name}
              className={cn(
                'rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-700',
                country.color,
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Country header */}
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none" role="img" aria-label={country.name}>
                  {country.flag}
                </span>
                <div>
                  <h3
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {country.name}
                  </h3>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', country.badgeColor)}>
                    Fully Supported
                  </span>
                </div>
              </div>

              {/* Laws list */}
              <ul className="space-y-2.5" role="list">
                {country.laws.map((law) => (
                  <li key={law} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={cn('w-4 h-4 shrink-0 mt-0.5', country.iconColor)}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-white/65 leading-snug">{law}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto pt-2">
                <a
                  href="#"
                  className={cn(
                    'text-sm font-medium transition-colors',
                    country.iconColor,
                    'hover:text-white'
                  )}
                >
                  View {country.name} compliance guide →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
