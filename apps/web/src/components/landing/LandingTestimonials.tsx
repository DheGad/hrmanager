'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Building2, Globe, Play, PlayCircle } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Roy Chen',
    title: 'Group Chief Executive Officer',
    company: 'TechScale Holdings Berhad',
    location: 'Kuala Lumpur, Malaysia',
    flag: '🇲🇾',
    avatar: 'RC',
    color: 'from-amber-500 to-orange-600',
    rating: 5,
    quote: 'HRManager4U.ai transformed how we handle HR across our 12 entities in Malaysia. The AI legal assistant alone saves our HR team 20 hours a week — every answer is accurate, cited, and compliant with the Employment Act 1955. We went from 3 HR managers to managing 2,100 staff with just 1. The ROI in the first 3 months was undeniable.',
    metrics: [{ label: 'HR hours saved/week', value: '20h' }, { label: 'Staff managed', value: '2,100' }, { label: 'ROI timeline', value: '3 months' }],
    tag: 'Enterprise — 2,100 Employees',
  },
  {
    name: 'Winne Ahmad',
    title: 'Group HR Director',
    company: 'Petronas Integrated Ventures',
    location: 'Kuala Lumpur, Malaysia',
    flag: '🇲🇾',
    avatar: 'WA',
    color: 'from-violet-500 to-purple-600',
    rating: 5,
    quote: 'The compliance engine is extraordinary. Before HRManager4U.ai, our compliance audits were a 2-week nightmare every quarter. Now I get a real-time compliance score dashboard — when something drifts, we get an alert and a one-click fix. Our compliance score went from 71% to 98% in 6 weeks. The Employment Act 1955 and PDPA coverage is comprehensive and always up to date.',
    metrics: [{ label: 'Compliance score', value: '98%' }, { label: 'Audit prep time', value: '-90%' }, { label: 'Time to 98%', value: '6 weeks' }],
    tag: 'Enterprise — 4,500 Employees',
  },
  {
    name: 'Jonne Williams',
    title: 'Chief People Officer',
    company: 'Nexgen Digital Australia Pty Ltd',
    location: 'Sydney, Australia',
    flag: '🇦🇺',
    avatar: 'JW',
    color: 'from-blue-500 to-cyan-600',
    rating: 5,
    quote: "As a Sydney-based company with 800 staff under the Fair Work Act, compliance is critical. HRManager4U.ai handles our National Employment Standards entitlements, WHS obligations, and superannuation policy tracking automatically. The AI answered a complex Fair Work Act question in 2 seconds that would have cost us $800 in legal fees. I've recommended it to every CPO in our network.",
    metrics: [{ label: 'Legal fees saved/mo', value: 'AUD $4k' }, { label: 'NES compliance', value: '100%' }, { label: 'Staff managed', value: '800' }],
    tag: 'Mid-Market — 800 Employees',
  },
  {
    name: 'Priya Nair',
    title: 'Head of People & Culture',
    company: 'Berjaya Land Berhad',
    location: 'Petaling Jaya, Malaysia',
    flag: '🇲🇾',
    avatar: 'PN',
    color: 'from-rose-500 to-pink-600',
    rating: 5,
    quote: "The onboarding workflow wizard is a game-changer. New hires go through a structured 7-step digital onboarding, digital contract signing, and auto-generated policy acknowledgment — all without a single paper form. We reduced our onboarding time from 5 days to half a day. The document vault means we're always audit-ready. Absolutely worth every ringgit.",
    metrics: [{ label: 'Onboarding time', value: '4hrs' }, { label: 'Paper forms', value: '0' }, { label: 'Staff time saved', value: '4.5 days' }],
    tag: 'Enterprise — 3,200 Employees',
  },
];

export function LandingTestimonials() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active];

  const go = (dir: number) => setActive(a => (a + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section id="testimonials" className="landing-section relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/2 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
            <Star className="w-3 h-3 fill-current" /> 4.9/5 from 2,400+ HR Teams
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by real HR leaders.
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400"> Real results.</span>
          </h2>
          <p className="text-slate-400 text-lg">From KL to Sydney — HR directors share how HRManager4U.ai changed their operations.</p>
        </div>

        {/* Main testimonial */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
            >
              {/* Quote card - VIDEO STYLE */}
              <div className="relative overflow-hidden bg-[#0B0B18] border border-white/10 rounded-3xl mb-6 shadow-2xl group cursor-pointer hover:border-white/20 transition-all duration-500">
                
                {/* Video thumbnail background gradient (simulating a video frame) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-20 transition-opacity duration-500 group-hover:opacity-30`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B18] via-[#0B0B18]/80 to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl shadow-black/50 group-hover:scale-110 transition-transform duration-500">
                    <Play className="w-8 h-8 text-white fill-white ml-2" />
                  </div>
                </div>

                <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-between min-h-[400px]">
                  {/* Top section: Stars & Tag */}
                  <div className="flex justify-between items-start mb-12">
                    <div className="flex gap-1 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${t.color} text-white shadow-lg`}>
                      {t.tag}
                    </span>
                  </div>

                  {/* Bottom section: Quote, Author, Metrics */}
                  <div className="mt-auto">
                    <blockquote className="text-xl lg:text-2xl font-bold text-white leading-tight mb-8">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                      {/* Author Info */}
                      <div className="lg:col-span-5 flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-xl border border-white/20`}>
                          {t.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{t.name}</p>
                          <p className="text-slate-300 text-sm mb-1">{t.title}</p>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-400 font-medium">{t.company}</span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics Bar */}
                      <div className="lg:col-span-7 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex justify-between">
                        {t.metrics.map((m, i) => (
                          <div key={i} className="text-center px-4 first:pl-2 last:pr-2 border-l border-white/10 first:border-0">
                            <p className="text-2xl font-black text-white">{m.value}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {/* Person thumbnails */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                    i === active
                      ? 'border-white/20 bg-white/8'
                      : 'border-white/6 bg-white/2 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {item.avatar}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className={`text-xs font-semibold ${i === active ? 'text-white' : 'text-slate-500'}`}>{item.name}</p>
                    <p className="text-[9px] text-slate-600">{item.flag} {item.company.split(' ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button onClick={() => go(-1)} className="w-10 h-10 rounded-full bg-white/6 border border-white/12 flex items-center justify-center hover:bg-white/12 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              <button onClick={() => go(1)} className="w-10 h-10 rounded-full bg-white/6 border border-white/12 flex items-center justify-center hover:bg-white/12 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
