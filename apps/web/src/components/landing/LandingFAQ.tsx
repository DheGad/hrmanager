'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'Is HRManager4U.ai compliant with the Employment Act 1955 (Malaysia)?',
    a: 'Yes. Our compliance engine is built specifically around the Employment Act 1955, including all amendments up to 2022. It covers minimum entitlements for leave, overtime, termination, maternity benefits, and public holidays. Our AI Assistant is trained on the full Act and can provide clause-level references.',
  },
  {
    q: 'Can I manage employees across multiple countries simultaneously?',
    a: 'Absolutely. HRManager4U.ai supports multi-country operations with separate compliance profiles per entity. You can manage employees under Malaysian, Australian, and Singaporean labour laws simultaneously, with each set of policies isolated by tenant and company.',
  },
  {
    q: 'How does the AI HR Assistant work? Is it reliable for legal guidance?',
    a: 'Our AI Assistant uses Retrieval Augmented Generation (RAG) — it retrieves relevant sections from verified legal documents (Employment Act 1955, Fair Work Act 2009, etc.) before generating answers. Every response includes a confidence score and source citations. For complex matters, it recommends consulting qualified legal counsel.',
  },
  {
    q: 'Is my company and employee data secure?',
    a: 'Yes. We are SOC 2 Type II certified and ISO 27001 aligned. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). Each company\'s data is fully isolated in our multi-tenant architecture. We never use customer data to train AI models. MinIO-based document storage with per-tenant encryption keys.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), bank transfers, and for Enterprise clients, we support invoice-based billing with NET-30 terms. Payments are processed securely via Stripe.',
  },
  {
    q: 'Can I migrate data from my existing HR system?',
    a: 'Yes. We provide a structured data migration service. We support bulk import from Excel/CSV for employee records, and API-based integration with popular HRMS platforms including SAP SuccessFactors, Workday, and BambooHR. Our implementation team will guide you through the migration.',
  },
  {
    q: "What's the typical implementation timeline?",
    a: 'For Starter and Business plans, you can be fully operational within 1-3 days — onboarding is entirely self-service with our guided setup wizard. Enterprise implementations with custom integrations and data migrations typically take 2-4 weeks with dedicated support from our solutions team.',
  },
  {
    q: 'Do you offer dedicated customer support?',
    a: 'Starter plans receive email support with a 48-hour SLA. Business plans get priority email and chat support with a 4-hour SLA. Enterprise clients receive a dedicated Customer Success Manager, phone support, and a guaranteed 1-hour critical response SLA.',
  },
];

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="landing-section relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400">
            Everything you need to know about HRManager4U.ai.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                'rounded-xl border transition-colors duration-200',
                open === i
                  ? 'border-indigo-500/30 bg-indigo-500/5'
                  : 'border-white/8 bg-white/3 hover:border-white/15'
              )}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200',
                    open === i && 'rotate-180 text-indigo-400'
                  )}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center glass-panel p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-slate-400 text-sm mb-5">
            Our team is available to answer any questions about enterprise HR compliance.
          </p>
          <a
            href="mailto:sales@hrmanager4u.ai"
            className="btn-primary"
          >
            Contact Sales Team
          </a>
        </div>
      </div>
    </section>
  );
}
