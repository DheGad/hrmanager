'use client';
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  X,
  Upload,
  FileText,
  Trash2,
  Users,
  Building2,
  Globe,
  FolderOpen,
  CalendarDays,
  UserPlus,
  PartyPopper,
  Loader2,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────
type Country = 'MY' | 'AU' | 'SG';

interface OnboardingData {
  // Step 1
  companyName: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  // Step 2
  country: Country;
  laborLawMode: string;
  agreedToLaborLaw: boolean;
  // Step 3
  departments: string[];
  // Step 4
  annualLeave: number;
  medicalLeave: number;
  emergencyLeave: number;
  maternityLeave: number;
  // Step 5
  invites: { email: string; role: string }[];
  // Step 6
  documents: File[];
}

// ─── Constants ────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Company Details', icon: Building2, required: true },
  { id: 2, label: 'Country & Compliance', icon: Globe, required: true },
  { id: 3, label: 'Departments', icon: FolderOpen, required: true },
  { id: 4, label: 'Leave Policies', icon: CalendarDays, required: false },
  { id: 5, label: 'Invite Employees', icon: UserPlus, required: false },
  { id: 6, label: 'Upload Documents', icon: Upload, required: false },
  { id: 7, label: "All Done! 🎉", icon: PartyPopper, required: false },
];

const STORAGE_KEY = 'hrm4u-onboarding-draft';

const COUNTRIES: { value: Country; label: string; flag: string; laborLaw: string; defaults: { annual: number; medical: number; emergency: number; maternity: number } }[] = [
  {
    value: 'MY',
    label: 'Malaysia',
    flag: '🇲🇾',
    laborLaw: 'Employment Act 1955 (Malaysia)',
    defaults: { annual: 12, medical: 14, emergency: 3, maternity: 60 },
  },
  {
    value: 'AU',
    label: 'Australia',
    flag: '🇦🇺',
    laborLaw: 'Fair Work Act 2009 (Australia)',
    defaults: { annual: 20, medical: 10, emergency: 3, maternity: 52 },
  },
  {
    value: 'SG',
    label: 'Singapore',
    flag: '🇸🇬',
    laborLaw: 'Employment Act (Singapore)',
    defaults: { annual: 14, medical: 14, emergency: 3, maternity: 70 },
  },
];

const DEFAULT_DEPARTMENTS = ['HR', 'Engineering', 'Finance', 'Marketing', 'Operations'];

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Manufacturing',
  'Retail & E-commerce', 'Education', 'Logistics', 'Construction',
  'Professional Services', 'Other',
];

const COMPANY_SIZES = ['1–50', '51–200', '201–500', '500+'];

const EMPLOYEE_ROLES = ['HR Manager', 'Manager', 'Employee'];

// ─── Default state ────────────────────────────────────────────
const defaultData: Omit<OnboardingData, 'documents'> = {
  companyName: '',
  description: '',
  website: '',
  industry: '',
  size: '',
  country: 'MY',
  laborLawMode: COUNTRIES[0].laborLaw,
  agreedToLaborLaw: false,
  departments: [...DEFAULT_DEPARTMENTS],
  annualLeave: 12,
  medicalLeave: 14,
  emergencyLeave: 3,
  maternityLeave: 60,
  invites: [],
};

// ─── FieldError component ─────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 flex items-center gap-1 mt-1" role="alert">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}

// ─── CSS Confetti (no external lib) ──────────────────────────
const ConfettiStyles = () => (
  <style>{`
    @keyframes confetti-fall {
      0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    .confetti-piece {
      position: fixed;
      width: 8px;
      height: 8px;
      top: -10px;
      animation: confetti-fall linear infinite;
      border-radius: 2px;
      pointer-events: none;
      z-index: 9999;
    }
  `}</style>
);

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${pseudoRandom(i) * 100}%`,
    delay: `${pseudoRandom(i + 40) * 3}s`,
    duration: `${2 + pseudoRandom(i + 80) * 3}s`,
    color: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'][Math.floor(pseudoRandom(i + 120) * 6)],
    size: `${6 + pseudoRandom(i + 160) * 8}px`,
  }));

  return (
    <>
      <ConfettiStyles />
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </>
  );
}

// ─── Main Onboarding Component ────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Omit<OnboardingData, 'documents'>>({ ...defaultData });
  const [documents, setDocuments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState('Employee');
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pct = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  // ─── Persist draft ────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed.data ?? defaultData);
        setCurrentStep(parsed.step ?? 1);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const persistDraft = useCallback(
    (updatedData: Omit<OnboardingData, 'documents'>, step: number) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: updatedData, step }));
      } catch {
        // ignore storage errors
      }
    },
    []
  );

  const updateData = useCallback(
    (patch: Partial<Omit<OnboardingData, 'documents'>>) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        persistDraft(next, currentStep);
        return next;
      });
    },
    [currentStep, persistDraft]
  );

  // ─── Country change → auto-fill leave defaults ────────────
  const handleCountryChange = useCallback(
    (country: Country) => {
      const meta = COUNTRIES.find((c) => c.value === country)!;
      updateData({
        country,
        laborLawMode: meta.laborLaw,
        agreedToLaborLaw: false,
        annualLeave: meta.defaults.annual,
        medicalLeave: meta.defaults.medical,
        emergencyLeave: meta.defaults.emergency,
        maternityLeave: meta.defaults.maternity,
      });
    },
    [updateData]
  );

  const countryMeta = COUNTRIES.find((c) => c.value === data.country)!;

  // ─── Step validation ──────────────────────────────────────
  const validateStep = useCallback(
    (step: number): Record<string, string> => {
      const errs: Record<string, string> = {};
      if (step === 1) {
        if (!data.companyName.trim()) errs.companyName = 'Company name is required';
        if (!data.industry) errs.industry = 'Please select an industry';
        if (!data.size) errs.size = 'Please select a company size';
      }
      if (step === 2) {
        if (!data.agreedToLaborLaw) errs.agreedToLaborLaw = 'You must agree to configure the system for the selected labor laws';
      }
      if (step === 3) {
        if (data.departments.length === 0) errs.departments = 'Add at least one department';
      }
      return errs;
    },
    [data]
  );

  // ─── Navigation ───────────────────────────────────────────
  const handleNext = useCallback(() => {
    const required = STEPS.find((s) => s.id === currentStep)?.required ?? false;
    if (required) {
      const errs = validateStep(currentStep);
      if (Object.keys(errs).length > 0) {
        setStepErrors(errs);
        return;
      }
    }
    setStepErrors({});
    const next = Math.min(STEPS.length, currentStep + 1);
    setCurrentStep(next);
    persistDraft(data, next);
  }, [currentStep, validateStep, data, persistDraft]);

  const handleBack = useCallback(() => {
    setStepErrors({});
    const prev = Math.max(1, currentStep - 1);
    setCurrentStep(prev);
    persistDraft(data, prev);
  }, [currentStep, data, persistDraft]);

  const handleSaveLater = useCallback(async () => {
    setSaving(true);
    persistDraft(data, currentStep);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Draft saved. You can continue later.');
  }, [data, currentStep, persistDraft]);

  // ─── Departments ──────────────────────────────────────────
  const addDepartment = useCallback(() => {
    const name = newDeptName.trim();
    if (!name || data.departments.includes(name)) return;
    updateData({ departments: [...data.departments, name] });
    setNewDeptName('');
  }, [newDeptName, data.departments, updateData]);

  const removeDepartment = useCallback(
    (dept: string) => {
      updateData({ departments: data.departments.filter((d) => d !== dept) });
    },
    [data.departments, updateData]
  );

  // ─── Invites ──────────────────────────────────────────────
  const addInvite = useCallback(() => {
    const email = newInviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (data.invites.some((i) => i.email === email)) {
      toast.error('This email is already in the list');
      return;
    }
    updateData({ invites: [...data.invites, { email, role: newInviteRole }] });
    setNewInviteEmail('');
  }, [newInviteEmail, newInviteRole, data.invites, updateData]);

  const removeInvite = useCallback(
    (email: string) => {
      updateData({ invites: data.invites.filter((i) => i.email !== email) });
    },
    [data.invites, updateData]
  );

  // ─── File upload ──────────────────────────────────────────
  const ACCEPTED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const valid = Array.from(files).filter((f) => ACCEPTED_TYPES.includes(f.type));
      if (valid.length !== files.length) {
        toast.error('Only PDF, DOC, and DOCX files are accepted');
      }
      setDocuments((prev) => {
        const combined = [...prev];
        for (const f of valid) {
          if (!combined.find((x) => x.name === f.name)) combined.push(f);
        }
        return combined;
      });
    },
    []
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeDocument = useCallback((name: string) => {
    setDocuments((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─── Complete onboarding ──────────────────────────────────
  const handleComplete = useCallback(async () => {
    setCompleting(true);
    try {
      await api.post('/onboarding/complete', {
        ...data,
        invites: data.invites,
      });
      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Onboarding complete! Welcome aboard 🎉');
      router.push('/overview');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to complete onboarding. Please try again.';
      toast.error(msg);
    } finally {
      setCompleting(false);
    }
  }, [data, router]);

  // ─── Step indicator ───────────────────────────────────────
  const StepIndicator = () => (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500">Step {currentStep} of {STEPS.length}</span>
        <span className="text-xs text-indigo-400 font-medium">{pct}% complete</span>
      </div>
      <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className="flex items-center gap-1 shrink-0">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : isCurrent
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-white/5 text-slate-600 border border-white/8'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span className="w-3 h-3 flex items-center justify-center">{step.id}</span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-3 h-px ${isCompleted ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Nav buttons ──────────────────────────────────────────
  const NavButtons = ({
    onNext,
    nextLabel = 'Continue',
    canSkip = false,
    onSkip,
  }: {
    onNext?: () => void;
    nextLabel?: string;
    canSkip?: boolean;
    onSkip?: () => void;
  }) => (
    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/8">
      {currentStep > 1 && (
        <button type="button" onClick={handleBack} className="btn-secondary px-4 py-2.5 justify-center">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}

      <button
        type="button"
        onClick={handleSaveLater}
        disabled={saving}
        className="btn-secondary px-4 py-2.5 justify-center gap-1.5 text-xs"
        title="Save draft and continue later"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        Save draft
      </button>

      <div className="flex-1" />

      {canSkip && (
        <button
          type="button"
          onClick={onSkip ?? handleNext}
          className="btn-secondary px-4 py-2.5 justify-center text-sm"
        >
          Skip for now
        </button>
      )}

      <button
        type="button"
        onClick={onNext ?? handleNext}
        className="btn-primary px-6 py-2.5 justify-center"
      >
        {nextLabel} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  // ─── Render steps ─────────────────────────────────────────

  /* Step 1 — Company Details */
  const renderStep1 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Company Details</h2>
        <p className="text-slate-400 text-sm">Tell us about your company so we can set things up correctly.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ob-company-name" className="block text-sm font-medium text-slate-300">
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          id="ob-company-name"
          type="text"
          className={`input-field ${stepErrors.companyName ? 'border-red-500/60' : ''}`}
          placeholder="Acme Corp Sdn. Bhd."
          value={data.companyName}
          onChange={(e) => updateData({ companyName: e.target.value })}
        />
        <FieldError message={stepErrors.companyName} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ob-description" className="block text-sm font-medium text-slate-300">
          Company Description
        </label>
        <textarea
          id="ob-description"
          rows={3}
          className="input-field resize-none"
          placeholder="Briefly describe what your company does…"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ob-website" className="block text-sm font-medium text-slate-300">
          Website
        </label>
        <input
          id="ob-website"
          type="url"
          className="input-field"
          placeholder="https://acmecorp.com"
          value={data.website}
          onChange={(e) => updateData({ website: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="ob-industry" className="block text-sm font-medium text-slate-300">
            Industry <span className="text-red-400">*</span>
          </label>
          <select
            id="ob-industry"
            className={`input-field ${stepErrors.industry ? 'border-red-500/60' : ''}`}
            value={data.industry}
            onChange={(e) => updateData({ industry: e.target.value })}
          >
            <option value="">Select…</option>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
          </select>
          <FieldError message={stepErrors.industry} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ob-size" className="block text-sm font-medium text-slate-300">
            Company Size <span className="text-red-400">*</span>
          </label>
          <select
            id="ob-size"
            className={`input-field ${stepErrors.size ? 'border-red-500/60' : ''}`}
            value={data.size}
            onChange={(e) => updateData({ size: e.target.value })}
          >
            <option value="">Select…</option>
            {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
          </select>
          <FieldError message={stepErrors.size} />
        </div>
      </div>

      <NavButtons nextLabel="Next: Country & Compliance" />
    </div>
  );

  /* Step 2 — Country & Compliance */
  const renderStep2 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Country &amp; Compliance</h2>
        <p className="text-slate-400 text-sm">Select your primary country to auto-configure labor law settings.</p>
      </div>

      {/* Country selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-300">Primary Country <span className="text-red-400">*</span></p>
        <div className="grid grid-cols-3 gap-3">
          {COUNTRIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleCountryChange(c.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                data.country === c.value
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                  : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20 hover:bg-white/6'
              }`}
            >
              <span className="text-2xl">{c.flag}</span>
              <span>{c.label}</span>
              {data.country === c.value && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Labor law mode */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Labor Law Mode:</span>
          <span className="text-white font-medium">{data.laborLawMode}</span>
        </div>
        <p className="text-xs text-slate-500">
          This determines leave entitlements, working hour regulations, and compliance document templates.
        </p>
      </div>

      {/* Compliance agreement */}
      <div className={`p-4 rounded-xl border transition-all ${
        stepErrors.agreedToLaborLaw ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-white/3'
      }`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border border-white/20 bg-white/5 accent-indigo-500 shrink-0"
            checked={data.agreedToLaborLaw}
            onChange={(e) => updateData({ agreedToLaborLaw: e.target.checked })}
          />
          <span className="text-sm text-slate-300 leading-relaxed">
            I agree to configure the system for <strong className="text-white">{countryMeta.label}</strong> labor laws
            and understand that HR policies will be pre-configured according to the{' '}
            <strong className="text-indigo-400">{data.laborLawMode}</strong>.
          </span>
        </label>
        <FieldError message={stepErrors.agreedToLaborLaw} />
      </div>

      <NavButtons nextLabel="Next: Departments" />
    </div>
  );

  /* Step 3 — Departments */
  const renderStep3 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Departments</h2>
        <p className="text-slate-400 text-sm">Define your company&apos;s departments. You can edit these later.</p>
      </div>

      {/* Department list */}
      <div className="flex flex-wrap gap-2">
        {data.departments.map((dept) => (
          <span
            key={dept}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-sm text-indigo-300"
          >
            {dept}
            <button
              type="button"
              aria-label={`Remove ${dept} department`}
              onClick={() => removeDepartment(dept)}
              className="text-indigo-400/70 hover:text-red-400 transition-colors ml-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {data.departments.length === 0 && (
          <p className="text-sm text-slate-500 italic">No departments added yet.</p>
        )}
      </div>
      <FieldError message={stepErrors.departments} />

      {/* Add department */}
      <div className="flex gap-2">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="e.g. Customer Success"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDepartment(); } }}
        />
        <button
          type="button"
          onClick={addDepartment}
          disabled={!newDeptName.trim()}
          className="btn-secondary px-4 py-2 justify-center disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <NavButtons nextLabel="Next: Leave Policies" />
    </div>
  );

  /* Step 4 — Leave Policies */
  const renderStep4 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Leave Policies</h2>
        <p className="text-slate-400 text-sm">
          Pre-filled based on <strong className="text-white">{countryMeta.label}</strong> defaults. Adjust as needed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'annualLeave', label: 'Annual Leave', unit: 'days/year', description: 'Paid annual leave entitlement' },
          { key: 'medicalLeave', label: 'Medical Leave', unit: 'days/year', description: 'Paid sick leave entitlement' },
          { key: 'emergencyLeave', label: 'Emergency Leave', unit: 'days/year', description: 'Compassionate / emergency leave' },
          { key: 'maternityLeave', label: 'Maternity Leave', unit: 'days', description: 'Paid maternity leave' },
        ].map(({ key, label, unit, description }) => (
          <div key={key} className="p-4 rounded-xl border border-white/10 bg-white/3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min={0}
                max={365}
                className="input-field w-20 text-center font-mono text-lg py-1"
                value={(data as any)[key]}
                onChange={(e) => updateData({ [key]: parseInt(e.target.value) || 0 } as any)}
              />
              <span className="text-xs text-slate-500">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/8 text-xs text-amber-400 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>These are starting defaults. You can configure more detailed policies (public holidays, carry-forward, etc.) in Settings → Leave Policies after onboarding.</span>
      </div>

      <NavButtons nextLabel="Next: Invite Employees" canSkip onSkip={handleNext} />
    </div>
  );

  /* Step 5 — Invite Employees */
  const renderStep5 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Invite Employees</h2>
        <p className="text-slate-400 text-sm">Invite your team members. You can add more anytime from the Employees section.</p>
      </div>

      {/* Add invite row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="email"
            className="input-field pl-10"
            placeholder="colleague@company.com"
            value={newInviteEmail}
            onChange={(e) => setNewInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInvite(); } }}
          />
        </div>
        <select
          className="input-field w-36"
          value={newInviteRole}
          onChange={(e) => setNewInviteRole(e.target.value)}
        >
          {EMPLOYEE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          type="button"
          onClick={addInvite}
          className="btn-secondary px-3 py-2 justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Invites list */}
      {data.invites.length > 0 ? (
        <div className="space-y-2">
          {data.invites.map((invite) => (
            <div
              key={invite.email}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {invite.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{invite.email}</p>
                  <p className="text-xs text-slate-500">{invite.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeInvite(invite.email)}
                aria-label={`Remove ${invite.email}`}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-slate-600 text-sm">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No invitations added yet.
        </div>
      )}

      <NavButtons
        nextLabel={data.invites.length > 0 ? `Invite Now (${data.invites.length})` : 'Next: Documents'}
        canSkip
        onSkip={handleNext}
      />
    </div>
  );

  /* Step 6 — Upload Documents */
  const renderStep6 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Upload Documents</h2>
        <p className="text-slate-400 text-sm">Upload core policy documents. Accepted: PDF, DOC, DOCX.</p>
      </div>

      {/* Dropzone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500/60 bg-indigo-500/8'
            : 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload documents"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`} />
        <p className="text-sm text-slate-300 mb-1">
          <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-500">PDF, DOC, DOCX — up to 20MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
        />
      </div>

      {/* Uploaded files */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium">{documents.length} file{documents.length > 1 ? 's' : ''} uploaded</p>
          {documents.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDocument(file.name)}
                aria-label={`Remove ${file.name}`}
                className="text-slate-500 hover:text-red-400 transition-colors shrink-0 ml-3"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <NavButtons nextLabel="Next: Review & Finish" canSkip onSkip={handleNext} />
    </div>
  );

  /* Step 7 — All Done */
  const renderStep7 = () => (
    <div className="animate-fade-in">
      <Confetti />

      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-white/15 flex items-center justify-center mx-auto mb-5 text-4xl">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h2>
        <p className="text-slate-400 text-sm">
          HRManager4U.ai has been configured for <strong className="text-white">{data.companyName || 'your company'}</strong>.
        </p>
      </div>

      {/* Summary card */}
      <div className="glass-panel p-5 space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Configuration Summary</h3>
        {[
          { label: 'Company', value: data.companyName || '—', icon: Building2 },
          { label: 'Country', value: `${countryMeta.flag} ${countryMeta.label}`, icon: Globe },
          { label: 'Departments', value: `${data.departments.length} departments`, icon: FolderOpen },
          {
            label: 'Leave Policy',
            value: `${data.annualLeave}d annual, ${data.medicalLeave}d medical`,
            icon: CalendarDays,
          },
          {
            label: 'Team Invites',
            value: data.invites.length > 0 ? `${data.invites.length} invite${data.invites.length > 1 ? 's' : ''} queued` : 'None',
            icon: UserPlus,
          },
          {
            label: 'Documents',
            value: documents.length > 0 ? `${documents.length} file${documents.length > 1 ? 's' : ''} uploaded` : 'None',
            icon: FileText,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Icon className="w-4 h-4 text-slate-500" />
              {label}
            </div>
            <span className="text-sm font-medium text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={completing}
        className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {completing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Setting up your workspace…
          </>
        ) : (
          <>
            Go to Dashboard →
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleBack}
        className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors mt-4"
      >
        ← Go back and make changes
      </button>
    </div>
  );

  const stepRenderers: Record<number, () => React.ReactElement> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
    7: renderStep7,
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 pt-10">
      <div className="w-full max-w-2xl">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">HRManager4U.ai</h1>
            <p className="text-xs text-slate-500">Company Onboarding</p>
          </div>
        </div>

        <div className="glass-panel p-7 md:p-10">
          <StepIndicator />
          {(stepRenderers[currentStep] ?? renderStep1)()}
        </div>
      </div>
    </div>
  );
}
