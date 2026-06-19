'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Calculator, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 23,
    desc: 'Perfect for small businesses getting started with HR automation.',
    limit: 'Up to 50 employees',
    color: 'border-white/10',
    badge: null,
    features: [
      'Employee management',
      'Leave management',
      'Basic workflows',
      'Document generation (10/mo)',
      'Email notifications',
      'Standard support',
      'Employment Act compliance (MY)',
    ],
  },
  {
    name: 'Growth',
    monthlyPrice: 99,
    yearlyPrice: 79,
    desc: 'Full-featured HR OS for growing companies with compliance needs.',
    limit: 'Up to 500 employees',
    color: 'border-indigo-500/50',
    badge: 'Recommended',
    highlight: true,
    features: [
      'Everything in Starter',
      'AI HR Assistant (unlimited)',
      'Compliance Engine (MY + AU)',
      'Multi-level workflow approvals',
      'Digital Vault (50GB)',
      'Analytics & reporting',
      'Document generation (unlimited)',
      'Priority support',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    desc: 'Custom solution for large enterprises with complex multi-tenant needs.',
    limit: 'Unlimited employees',
    color: 'border-violet-500/30',
    badge: null,
    features: [
      'Everything in Growth',
      'Multi-country compliance (MY + AU + SG)',
      'Custom AI knowledge base',
      'Dedicated account manager',
      'SLA guarantee (99.9%)',
      'On-premise deployment option',
      'Custom integrations & SSO',
      'Audit & compliance reports',
      'White-label option',
    ],
  },
];

export function LandingPricing() {
  const [yearly, setYearly] = useState(true);
  const [employees, setEmployees] = useState(50);
  
  // ROI Calculation logic
  const hrsSavedPerEmp = 4.5; // hours saved per employee per month
  const avgHourlyRate = 25; // USD
  const softwareCost = yearly ? (employees <= 50 ? 23 : 79) : (employees <= 50 ? 29 : 99);
  const moneySaved = (employees * hrsSavedPerEmp * avgHourlyRate) - softwareCost;
  const timeSaved = employees * hrsSavedPerEmp;

  return (
    <section id="pricing" className="landing-section relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" /> Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, Predictable Pricing
          </h2>
          <p className="text-slate-400 text-lg">
            No hidden fees. Cancel anytime. Start with a 14-day free trial on any plan.
          </p>
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={cn('text-sm font-medium transition-colors', !yearly ? 'text-white' : 'text-slate-500')}>Monthly</span>
            <button
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly((y) => !y)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors duration-300',
                yearly ? 'bg-indigo-500' : 'bg-white/15'
              )}
            >
              <span className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300',
                yearly ? 'translate-x-6' : 'translate-x-0'
              )} />
            </button>
            <span className={cn('text-sm font-medium transition-colors flex items-center gap-1.5', yearly ? 'text-white' : 'text-slate-500')}>
              Yearly
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border p-8 flex flex-col transition-all duration-300',
                plan.highlight
                  ? 'bg-gradient-to-b from-indigo-500/10 to-violet-500/5 border-indigo-500/50 shadow-2xl shadow-indigo-500/10'
                  : 'bg-white/3 border-white/10 hover:border-white/20 hover:bg-white/5'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.desc}</p>
              </div>

              <div className="mb-6">
                {plan.monthlyPrice ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-400 text-sm">/mo</span>
                  </div>
                ) : (
                  <div className="text-4xl font-extrabold text-white">Custom</div>
                )}
                <p className="text-xs text-slate-500 mt-1">{plan.limit}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.monthlyPrice ? '/register' : 'mailto:sales@hrmanager4u.ai'}
                className={cn(
                  'block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                  plan.highlight
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                    : 'border border-white/15 text-slate-300 hover:bg-white/8 hover:text-white'
                )}
              >
                {plan.monthlyPrice ? 'Start Free Trial' : 'Contact Sales'}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-8 mb-16">
          All plans include 14-day free trial · No credit card required · Cancel anytime
        </p>

        {/* ROI Calculator Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-[#0B0B18] border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                <Calculator className="w-3.5 h-3.5" /> ROI Calculator
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">See how much you could save.</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                HRManager4U.ai eliminates manual data entry, automates compliance, and answers staff questions instantly. Calculate your projected return on investment.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">Company Size</span>
                    <span className="text-indigo-400 font-bold">{employees} employees</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="500" 
                    step="10"
                    value={employees} 
                    onChange={(e) => setEmployees(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                    <span>10</span>
                    <span>500+</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign className="w-16 h-16 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-400 mb-2">Estimated Savings</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-emerald-400">${moneySaved.toLocaleString()}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                  <TrendingUp className="w-3 h-3" />
                  <span>Based on $25/hr avg rate</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Clock className="w-16 h-16 text-indigo-400" />
                </div>
                <p className="text-sm text-slate-400 mb-2">Time Recovered</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-indigo-400">{timeSaved.toLocaleString()}</span>
                  <span className="text-slate-500 text-sm">hrs</span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400/80 bg-indigo-500/10 px-2.5 py-1 rounded-full w-fit">
                  <Zap className="w-3 h-3" />
                  <span>Per month</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
