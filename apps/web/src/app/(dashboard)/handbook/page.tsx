'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Loader2,
  Building2,
  CalendarDays,
  Umbrella,
  Shield,
  Coins,
  Eye,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Country = 'MY' | 'AU' | 'SG';

interface GeneralInfo {
  companyName: string;
  country: Country;
  effectiveDate: string;
  overview: string;
}

interface LeavePolicy {
  annualLeave: number;
  medicalLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  emergencyLeave: number;
  otherLeave: string;
}

interface ConductToggle {
  enabled: boolean;
  customText: string;
}

interface CodeOfConduct {
  antiHarassment: ConductToggle;
  dressCode: ConductToggle;
  socialMedia: ConductToggle;
  confidentiality: ConductToggle;
  conflictsOfInterest: ConductToggle;
  drugAndAlcohol: ConductToggle;
}

interface Benefits {
  epfCpfRate: string;
  socsosuperannuation: string;
  healthInsurance: string;
  otherBenefits: string;
}

interface WizardState {
  generalInfo: GeneralInfo;
  leavePolicy: LeavePolicy;
  codeOfConduct: CodeOfConduct;
  benefits: Benefits;
}

// ─── Country-aware defaults ───────────────────────────────────────────────────

const COUNTRY_LEAVE_DEFAULTS: Record<Country, { annual: number; medical: number; maternity: number; paternity: number; emergency: number }> = {
  MY: { annual: 12, medical: 14, maternity: 98, paternity: 7, emergency: 3 },
  AU: { annual: 20, medical: 10, maternity: 52, paternity: 52, emergency: 5 },
  SG: { annual: 14, medical: 14, maternity: 112, paternity: 14, emergency: 3 },
};

const COUNTRY_LABELS: Record<Country, string> = {
  MY: 'Malaysia (Employment Act 1955)',
  AU: 'Australia (Fair Work Act 2009)',
  SG: 'Singapore (Employment Act, Cap. 91A)',
};

const CONTRIBUTION_LABELS: Record<Country, string> = {
  MY: 'EPF Employer Contribution Rate (%)',
  AU: 'Superannuation Rate (%)',
  SG: 'CPF Employer Contribution Rate (%)',
};

const SOCSO_LABELS: Record<Country, string> = {
  MY: 'SOCSO / EIS Contribution',
  AU: 'Workcover / Workers Compensation',
  SG: 'SDL / FWL Contributions',
};

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: WizardState = {
  generalInfo: {
    companyName: '',
    country: 'MY',
    effectiveDate: new Date().toISOString().split('T')[0],
    overview: '',
  },
  leavePolicy: {
    annualLeave: COUNTRY_LEAVE_DEFAULTS.MY.annual,
    medicalLeave: COUNTRY_LEAVE_DEFAULTS.MY.medical,
    maternityLeave: COUNTRY_LEAVE_DEFAULTS.MY.maternity,
    paternityLeave: COUNTRY_LEAVE_DEFAULTS.MY.paternity,
    emergencyLeave: COUNTRY_LEAVE_DEFAULTS.MY.emergency,
    otherLeave: '',
  },
  codeOfConduct: {
    antiHarassment: { enabled: true, customText: '' },
    dressCode: { enabled: true, customText: '' },
    socialMedia: { enabled: false, customText: '' },
    confidentiality: { enabled: true, customText: '' },
    conflictsOfInterest: { enabled: true, customText: '' },
    drugAndAlcohol: { enabled: false, customText: '' },
  },
  benefits: {
    epfCpfRate: '13',
    socsosuperannuation: '',
    healthInsurance: '',
    otherBenefits: '',
  },
};

// ─── Markdown preview generator ───────────────────────────────────────────────

function generateMarkdown(state: WizardState): string {
  const { generalInfo, leavePolicy, codeOfConduct, benefits } = state;
  const country = generalInfo.country;

  const conductSections = [
    { key: 'antiHarassment', label: 'Anti-Harassment Policy', data: codeOfConduct.antiHarassment },
    { key: 'dressCode', label: 'Dress Code Policy', data: codeOfConduct.dressCode },
    { key: 'socialMedia', label: 'Social Media Policy', data: codeOfConduct.socialMedia },
    { key: 'confidentiality', label: 'Confidentiality Policy', data: codeOfConduct.confidentiality },
    { key: 'conflictsOfInterest', label: 'Conflicts of Interest', data: codeOfConduct.conflictsOfInterest },
    { key: 'drugAndAlcohol', label: 'Drug & Alcohol Policy', data: codeOfConduct.drugAndAlcohol },
  ].filter((s) => s.data.enabled);

  return `# ${generalInfo.companyName || 'Your Company'} Employee Handbook

**Effective Date:** ${generalInfo.effectiveDate || 'TBD'}
**Jurisdiction:** ${COUNTRY_LABELS[country]}

---

## 1. Company Overview

${generalInfo.overview || '*[Company overview to be filled in]*'}

---

## 2. Leave Entitlements

| Leave Type | Days Entitlement |
|---|---|
| Annual Leave | ${leavePolicy.annualLeave} days |
| Medical Leave | ${leavePolicy.medicalLeave} days |
| Maternity Leave | ${leavePolicy.maternityLeave} days |
| Paternity Leave | ${leavePolicy.paternityLeave} days |
| Emergency Leave | ${leavePolicy.emergencyLeave} days |

${leavePolicy.otherLeave ? `### Additional Leave Types\n\n${leavePolicy.otherLeave}` : ''}

---

## 3. Code of Conduct

${conductSections.map(({ label, data }) => `### ${label}\n\nAll employees are expected to adhere to ${label.toLowerCase()} standards as outlined by ${COUNTRY_LABELS[country]}.\n\n${data.customText ? data.customText : ''}`).join('\n\n')}

---

## 4. Benefits & Compensation

### Statutory Contributions

- **${CONTRIBUTION_LABELS[country]}:** ${benefits.epfCpfRate}%
- **${SOCSO_LABELS[country]}:** ${benefits.socsosuperannuation || 'As per statutory rates'}

### Health Insurance

${benefits.healthInsurance || '*[Health insurance coverage details to be added]*'}

### Other Benefits

${benefits.otherBenefits || '*[Additional benefits to be listed]*'}

---

*This handbook is generated by HRManager4U.ai and complies with applicable employment laws in ${COUNTRY_LABELS[country]}.*
`;
}

// Basic markdown → HTML converter (no external deps)
function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-white mt-6 mb-2">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-indigo-300 mt-5 mb-2 border-b border-white/10 pb-1">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium text-white mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-400 italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 rounded text-indigo-300 text-xs">$1</code>')
    .replace(/^---$/gm, '<hr class="border-white/10 my-4" />')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cols = match.split('|').map((c) => c.trim()).filter(Boolean);
      return `<div class="flex gap-4 text-sm py-1 border-b border-white/5">${cols.map((c, i) => `<span class="${i === 0 ? 'text-slate-400 w-36 flex-shrink-0' : 'text-white'}">${c}</span>`).join('')}</div>`;
    })
    .replace(/^\|---\|.*$/gm, '')
    .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 text-sm text-slate-300 my-1"><span class="text-indigo-400 mt-0.5">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '</p><p class="text-sm text-slate-400 my-2">')
    .replace(/^(?!<)(.+)$/gm, '<p class="text-sm text-slate-400 my-1">$1</p>');
}

// ─── Step components ──────────────────────────────────────────────────────────

const inputCls = 'input-field py-2.5 text-sm';
const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5';
const textareaCls = 'input-field py-2.5 text-sm resize-none';

function Step1GeneralInfo({ state, onChange }: { state: WizardState; onChange: (s: WizardState) => void }) {
  const g = state.generalInfo;

  const setG = (patch: Partial<GeneralInfo>) => {
    const updated: WizardState = {
      ...state,
      generalInfo: { ...g, ...patch },
    };
    // Auto-update leave defaults when country changes
    if (patch.country && patch.country !== g.country) {
      const defaults = COUNTRY_LEAVE_DEFAULTS[patch.country];
      updated.leavePolicy = {
        ...state.leavePolicy,
        annualLeave: defaults.annual,
        medicalLeave: defaults.medical,
        maternityLeave: defaults.maternity,
        paternityLeave: defaults.paternity,
        emergencyLeave: defaults.emergency,
      };
    }
    onChange(updated);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Company Name</label>
        <input
          type="text"
          className={inputCls}
          placeholder="Acme Corporation Sdn Bhd"
          value={g.companyName}
          onChange={(e) => setG({ companyName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Country / Jurisdiction</label>
          <select
            className={cn(inputCls, 'bg-[#16213E]')}
            value={g.country}
            onChange={(e) => setG({ country: e.target.value as Country })}
          >
            <option value="MY">Malaysia (Employment Act 1955)</option>
            <option value="AU">Australia (Fair Work Act 2009)</option>
            <option value="SG">Singapore (Employment Act)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Handbook Effective Date</label>
          <input
            type="date"
            className={inputCls}
            value={g.effectiveDate}
            onChange={(e) => setG({ effectiveDate: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Brief Company Overview</label>
        <textarea
          rows={4}
          className={textareaCls}
          placeholder="Describe your company's mission, values, and what employees can expect..."
          value={g.overview}
          onChange={(e) => setG({ overview: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step2LeavePolicy({ state, onChange }: { state: WizardState; onChange: (s: WizardState) => void }) {
  const lp = state.leavePolicy;
  const country = state.generalInfo.country;
  const defaults = COUNTRY_LEAVE_DEFAULTS[country];

  const setLP = (patch: Partial<LeavePolicy>) =>
    onChange({ ...state, leavePolicy: { ...lp, ...patch } });

  const fieldRow = (label: string, key: keyof Omit<LeavePolicy, 'otherLeave'>, min: number, hint: string) => (
    <div>
      <label className={labelCls}>
        {label}
        <span className="ml-2 text-xs text-slate-500">min. {min} days</span>
      </label>
      <input
        type="number"
        min={min}
        className={inputCls}
        value={lp[key] as number}
        onChange={(e) => setLP({ [key]: parseInt(e.target.value) || min })}
      />
      <p className="text-xs text-slate-500 mt-1">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <span className="text-xs text-indigo-300">
          ✦ Leave defaults pre-filled for <strong>{COUNTRY_LABELS[country]}</strong>. Adjust as needed — values cannot go below statutory minimums.
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {fieldRow('Annual Leave (days)', 'annualLeave', defaults.annual, `Statutory min: ${defaults.annual} days`)}
        {fieldRow('Medical Leave (days)', 'medicalLeave', defaults.medical, `Statutory min: ${defaults.medical} days`)}
        {fieldRow('Maternity Leave (days)', 'maternityLeave', defaults.maternity, `Statutory min: ${defaults.maternity} days`)}
        {fieldRow('Paternity Leave (days)', 'paternityLeave', defaults.paternity, `Statutory min: ${defaults.paternity} days`)}
        {fieldRow('Emergency Leave (days)', 'emergencyLeave', defaults.emergency, 'Compassionate / family emergency')}
      </div>
      <div>
        <label className={labelCls}>Other Leave Types <span className="text-slate-500 font-normal">(optional)</span></label>
        <textarea
          rows={3}
          className={textareaCls}
          placeholder="e.g. Study leave (3 days/year), Hajj leave (once in employment), Bereavement leave..."
          value={lp.otherLeave}
          onChange={(e) => setLP({ otherLeave: e.target.value })}
        />
      </div>
    </div>
  );
}

const CONDUCT_SECTIONS: { key: keyof CodeOfConduct; label: string; description: string }[] = [
  { key: 'antiHarassment', label: 'Anti-Harassment Policy', description: 'Zero-tolerance policy for workplace harassment and discrimination' },
  { key: 'dressCode', label: 'Dress Code', description: 'Professional appearance standards for the workplace' },
  { key: 'socialMedia', label: 'Social Media Policy', description: 'Guidelines for social media use related to company matters' },
  { key: 'confidentiality', label: 'Confidentiality', description: 'Protection of company trade secrets and proprietary information' },
  { key: 'conflictsOfInterest', label: 'Conflicts of Interest', description: 'Disclosure and management of personal interests affecting work' },
  { key: 'drugAndAlcohol', label: 'Drug & Alcohol Policy', description: 'Prohibition of substance use in the workplace' },
];

function Step3CodeOfConduct({ state, onChange }: { state: WizardState; onChange: (s: WizardState) => void }) {
  const coc = state.codeOfConduct;

  const setSection = (key: keyof CodeOfConduct, patch: Partial<ConductToggle>) =>
    onChange({ ...state, codeOfConduct: { ...coc, [key]: { ...coc[key], ...patch } } });

  return (
    <div className="space-y-3">
      {CONDUCT_SECTIONS.map(({ key, label, description }) => {
        const section = coc[key];
        return (
          <div
            key={key}
            className={cn(
              'rounded-lg border transition-colors duration-200',
              section.enabled
                ? 'border-indigo-500/30 bg-indigo-500/5'
                : 'border-white/8 bg-white/2'
            )}
          >
            <div className="flex items-start justify-between p-4">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={section.enabled}
                onClick={() => setSection(key, { enabled: !section.enabled })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent',
                  section.enabled ? 'bg-indigo-600' : 'bg-white/15'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                    section.enabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
            <AnimatePresence>
              {section.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <textarea
                      rows={2}
                      className={cn(textareaCls, 'text-xs')}
                      placeholder={`Add custom text or clauses for ${label}... (optional)`}
                      value={section.customText}
                      onChange={(e) => setSection(key, { customText: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function Step4Benefits({ state, onChange }: { state: WizardState; onChange: (s: WizardState) => void }) {
  const b = state.benefits;
  const country = state.generalInfo.country;
  const setB = (patch: Partial<Benefits>) => onChange({ ...state, benefits: { ...b, ...patch } });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{CONTRIBUTION_LABELS[country]}</label>
          <div className="relative">
            <input
              type="text"
              className={cn(inputCls, 'pr-8')}
              placeholder="13"
              value={b.epfCpfRate}
              onChange={(e) => setB({ epfCpfRate: e.target.value })}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
          </div>
        </div>
        <div>
          <label className={labelCls}>{SOCSO_LABELS[country]}</label>
          <input
            type="text"
            className={inputCls}
            placeholder={country === 'MY' ? 'As per SOCSO schedule' : country === 'AU' ? '0.5% of insurable earnings' : 'SDL 0.25%, FWL varies'}
            value={b.socsosuperannuation}
            onChange={(e) => setB({ socsosuperannuation: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Health Insurance Coverage</label>
        <textarea
          rows={3}
          className={textareaCls}
          placeholder="e.g. Group hospitalisation and surgical insurance up to RM 50,000/year per employee, covering inpatient, outpatient, and dental..."
          value={b.healthInsurance}
          onChange={(e) => setB({ healthInsurance: e.target.value })}
        />
      </div>
      <div>
        <label className={labelCls}>Other Benefits <span className="text-slate-500 font-normal">(optional)</span></label>
        <textarea
          rows={3}
          className={textareaCls}
          placeholder="e.g. Flexible working hours, remote work policy, professional development allowance, staff discounts..."
          value={b.otherBenefits}
          onChange={(e) => setB({ otherBenefits: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step5Preview({ state }: { state: WizardState }) {
  const markdown = generateMarkdown(state);
  const html = markdownToHtml(markdown);
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.ceil(wordCount / 300);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Preview
          </div>
          <span className="text-xs text-slate-500">~{wordCount} words · ~{estimatedPages} pages</span>
        </div>
      </div>
      <div
        className="h-[360px] overflow-y-auto rounded-lg bg-[#0a0a14] border border-white/8 p-5 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

interface GenerateResult {
  downloadUrl?: string;
  docxUrl?: string;
  pdfUrl?: string;
  filename?: string;
}

function Step6Generate({
  state,
  onSuccess,
}: {
  state: WizardState;
  onSuccess: (result: GenerateResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'docx' | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const country = state.generalInfo.country;
  const enabledSections = Object.entries(state.codeOfConduct)
    .filter(([, v]) => v.enabled)
    .map(([k]) => CONDUCT_SECTIONS.find((s) => s.key === k)?.label)
    .filter(Boolean);

  const handleGenerate = async (format: 'pdf' | 'docx') => {
    if (!state.generalInfo.companyName) {
      toast.error('Please enter a company name in Step 1 before generating.');
      return;
    }
    setExportType(format);
    setLoading(true);
    try {
      const payload = {
        format,
        generalInfo: state.generalInfo,
        leavePolicy: state.leavePolicy,
        codeOfConduct: state.codeOfConduct,
        benefits: state.benefits,
        markdown: generateMarkdown(state),
      };
      const res = await api.post<GenerateResult>('/handbooks/generate', payload);
      setResult(res);
      onSuccess(res);
      toast.success(`${format.toUpperCase()} generated successfully!`);
    } catch {
      toast.error('Generation failed. Please try again or check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-6 space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Handbook Ready!</h3>
          <p className="text-sm text-slate-400 mt-1">
            Your {exportType?.toUpperCase()} has been generated for {state.generalInfo.companyName}.
          </p>
        </div>
        <div className="flex gap-3">
          {result.pdfUrl && (
            <a
              href={result.pdfUrl}
              download
              className="btn-primary"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          )}
          {result.docxUrl && (
            <a
              href={result.docxUrl}
              download
              className="btn-secondary"
            >
              <Download className="w-4 h-4" />
              Download DOCX
            </a>
          )}
          {result.downloadUrl && (
            <a
              href={result.downloadUrl}
              download
              className="btn-primary"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/8 bg-white/2 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">What will be generated</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-white">{state.generalInfo.companyName || 'Your Company'}</strong> Employee Handbook effective{' '}
              {state.generalInfo.effectiveDate || 'TBD'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>Leave policies compliant with <strong className="text-white">{COUNTRY_LABELS[country]}</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>
              Code of Conduct sections:{' '}
              <strong className="text-white">{enabledSections.join(', ') || 'None selected'}</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>Benefits & Compensation overview including statutory contributions</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>Grievance & Disciplinary procedures (auto-generated from templates)</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleGenerate('pdf')}
          disabled={loading}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
            'bg-gradient-to-br from-rose-500 to-red-600 text-white hover:from-rose-400 hover:to-red-500',
            'shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:-translate-y-0.5',
            'disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed'
          )}
        >
          {loading && exportType === 'pdf' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
          ) : (
            <><FileText className="w-4 h-4" /> Export as PDF</>
          )}
        </button>
        <button
          onClick={() => handleGenerate('docx')}
          disabled={loading}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
            'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500',
            'shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5',
            'disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed'
          )}
        >
          {loading && exportType === 'docx' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating DOCX...</>
          ) : (
            <><FileText className="w-4 h-4" /> Export as DOCX</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'General Info', shortLabel: 'General', icon: Building2 },
  { id: 2, label: 'Leave Policies', shortLabel: 'Leave', icon: CalendarDays },
  { id: 3, label: 'Code of Conduct', shortLabel: 'Conduct', icon: Shield },
  { id: 4, label: 'Benefits', shortLabel: 'Benefits', icon: Coins },
  { id: 5, label: 'Preview', shortLabel: 'Preview', icon: Eye },
  { id: 6, label: 'Generate', shortLabel: 'Generate', icon: Sparkles },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HandbookPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [wizardState, setWizardState] = useState<WizardState>(INITIAL_STATE);
  const [generated, setGenerated] = useState(false);

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const next = () => { if (step < STEPS.length) goTo(step + 1); };
  const prev = () => { if (step > 1) goTo(step - 1); };

  const variants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
  };

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-1">Handbook Generator</h1>
          <p className="text-slate-400 text-sm">
            Build an Employment Act–compliant employee handbook in minutes.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-indigo-300 font-medium">
            Step {step} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* Wizard card */}
      <div className="glass-panel p-6 md:p-8 max-w-3xl mx-auto">
        {/* Progress bar + steps */}
        <div className="mb-8">
          {/* Thin progress bar */}
          <div className="h-1 w-full bg-white/8 rounded-full mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          {/* Step bubbles */}
          <div className="flex justify-between relative">
            {STEPS.map(({ id, shortLabel, icon: Icon }) => {
              const done = step > id;
              const active = step === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { if (id < step) goTo(id); }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 group',
                    id < step ? 'cursor-pointer' : 'cursor-default pointer-events-none'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200',
                      done
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : active
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25 shadow-lg shadow-indigo-500/30'
                        : 'bg-white/5 border border-white/10 text-slate-500'
                    )}
                  >
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium transition-colors duration-200 hidden sm:block',
                      active ? 'text-indigo-300' : done ? 'text-slate-400' : 'text-slate-600'
                    )}
                  >
                    {shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step title */}
        <div className="mb-6">
          <h2 className="text-lg font-heading font-semibold text-white">
            {STEPS[step - 1].label}
          </h2>
          <div className="h-px w-full bg-white/8 mt-3" />
        </div>

        {/* Animated step content */}
        <div className="min-h-[340px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {step === 1 && <Step1GeneralInfo state={wizardState} onChange={setWizardState} />}
              {step === 2 && <Step2LeavePolicy state={wizardState} onChange={setWizardState} />}
              {step === 3 && <Step3CodeOfConduct state={wizardState} onChange={setWizardState} />}
              {step === 4 && <Step4Benefits state={wizardState} onChange={setWizardState} />}
              {step === 5 && <Step5Preview state={wizardState} />}
              {step === 6 && (
                <Step6Generate
                  state={wizardState}
                  onSuccess={() => setGenerated(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-white/8">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className="btn-primary px-6 py-2.5"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
