'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ─── Schemas ────────────────────────────────────────────────
const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  country: z.enum(['MY', 'AU', 'SG'] as const, { error: 'Please select a country' }),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select a company size'),
});

const step2Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  phone: z.string().min(7, 'Enter a valid phone number'),
});

const step3Schema = z
  .object({
    email: z.string().email('Please enter a valid work email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, { error: 'You must accept the terms to continue' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormValues = z.infer<typeof fullSchema>;

// ─── Password strength helper ────────────────────────────────
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 1, label: 'Too Weak', color: 'bg-red-500' },
    { score: 2, label: 'Weak', color: 'bg-orange-500' },
    { score: 3, label: 'Fair', color: 'bg-yellow-500' },
    { score: 4, label: 'Strong', color: 'bg-emerald-500' },
    { score: 5, label: 'Very Strong', color: 'bg-emerald-400' },
  ];
  return levels[Math.min(score, 5) - 1] ?? { score: 0, label: '', color: '' };
}

// ─── PasswordStrengthMeter ───────────────────────────────────
function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      {label && (
        <p className={`text-xs font-medium ${score >= 4 ? 'text-emerald-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
          {label}
        </p>
      )}
    </div>
  );
}

// ─── FieldError ─────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 flex items-center gap-1 mt-1" role="alert">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Manufacturing',
  'Retail & E-commerce', 'Education', 'Logistics', 'Construction',
  'Media & Entertainment', 'Professional Services', 'Other',
];

const COMPANY_SIZES = ['1–50', '51–200', '201–500', '500+'];

const COUNTRIES = [
  { value: 'MY', label: '🇲🇾 Malaysia' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'SG', label: '🇸🇬 Singapore' },
];

const STEP_TITLES = ['Company Info', 'Your Profile', 'Account'];

// ─── Main Component ─────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const schemas = [step1Schema, step2Schema, step3Schema] as const;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    mode: 'onBlur',
    defaultValues: {
      country: 'MY',
      industry: '',
      companySize: '',
      agreeToTerms: undefined,
    },
  });

  const passwordValue = watch('password') ?? '';
  const emailValue = watch('email') ?? '';

  const step1Fields = ['companyName', 'country', 'industry', 'companySize'] as const;
  const step2Fields = ['firstName', 'lastName', 'jobTitle', 'phone'] as const;

  const handleNext = useCallback(async () => {
    const fieldsToValidate = step === 1 ? step1Fields : step2Fields;
    const valid = await trigger(fieldsToValidate as any);
    if (valid) setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  }, [step, trigger]);

  const handleBack = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }, []);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await api.post('/auth/register', {
        companyName: data.companyName,
        country: data.country,
        industry: data.industry,
        companySize: data.companySize,
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? err?.message ?? 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  // ─── Success state ─────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full max-w-md animate-scale-in">
        <div className="glass-panel p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-slate-400 text-sm mb-2">
            We sent a verification link to
          </p>
          <p className="text-indigo-400 font-medium mb-6">{registeredEmail}</p>
          <p className="text-xs text-slate-500 mb-8">
            Click the link in the email to verify your account and get started. The link expires in 24 hours.
          </p>
          <Link href="/login" className="btn-primary justify-center w-full">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="glass-panel p-8 md:p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">HRManager4U.ai</h1>
            <p className="text-xs text-slate-500">Enterprise HR Platform</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-slate-400 mb-6 text-sm">Join HRManager4U.ai to automate your HR operations.</p>

        {/* Step indicator */}
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          {STEP_TITLES.map((title, i) => (
            <span key={title} className={step === i + 1 ? 'text-indigo-400 font-medium' : ''}>
              {i + 1}. {title}
            </span>
          ))}
        </div>
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                step >= i ? 'bg-indigo-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Server error banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 mb-5 px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ─── Step 1: Company Info ───────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-semibold text-white">Company Info</h3>

              <div className="space-y-1.5">
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-300">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  autoComplete="organization"
                  className={`input-field ${errors.companyName ? 'border-red-500/60' : ''}`}
                  placeholder="Acme Corp Sdn. Bhd."
                  {...register('companyName')}
                />
                <FieldError message={errors.companyName?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="country" className="block text-sm font-medium text-slate-300">
                  Country <span className="text-red-400">*</span>
                </label>
                <select
                  id="country"
                  className={`input-field ${errors.country ? 'border-red-500/60' : ''}`}
                  {...register('country')}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <FieldError message={errors.country?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="industry" className="block text-sm font-medium text-slate-300">
                  Industry <span className="text-red-400">*</span>
                </label>
                <select
                  id="industry"
                  className={`input-field ${errors.industry ? 'border-red-500/60' : ''}`}
                  {...register('industry')}
                >
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <FieldError message={errors.industry?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="companySize" className="block text-sm font-medium text-slate-300">
                  Company Size <span className="text-red-400">*</span>
                </label>
                <select
                  id="companySize"
                  className={`input-field ${errors.companySize ? 'border-red-500/60' : ''}`}
                  {...register('companySize')}
                >
                  <option value="">Select company size…</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>{size} employees</option>
                  ))}
                </select>
                <FieldError message={errors.companySize?.message} />
              </div>

              <button type="button" onClick={handleNext} className="btn-primary w-full justify-center py-2.5 mt-2">
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── Step 2: Your Profile ──────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-semibold text-white">Your Profile</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-300">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`input-field ${errors.firstName ? 'border-red-500/60' : ''}`}
                    placeholder="John"
                    {...register('firstName')}
                  />
                  <FieldError message={errors.firstName?.message} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-300">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={`input-field ${errors.lastName ? 'border-red-500/60' : ''}`}
                    placeholder="Doe"
                    {...register('lastName')}
                  />
                  <FieldError message={errors.lastName?.message} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-300">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  autoComplete="organization-title"
                  className={`input-field ${errors.jobTitle ? 'border-red-500/60' : ''}`}
                  placeholder="HR Manager"
                  {...register('jobTitle')}
                />
                <FieldError message={errors.jobTitle?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  className={`input-field ${errors.phone ? 'border-red-500/60' : ''}`}
                  placeholder="+60 12 345 6789"
                  {...register('phone')}
                />
                <FieldError message={errors.phone?.message} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={handleBack} className="btn-secondary flex-none px-4 py-2.5 justify-center">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={handleNext} className="btn-primary flex-1 justify-center py-2.5">
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Account ───────────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-semibold text-white">Account Details</h3>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Work Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-field ${errors.email ? 'border-red-500/60' : ''}`}
                  placeholder="name@company.com"
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input-field pr-10 ${errors.password ? 'border-red-500/60' : ''}`}
                    placeholder="Min. 8 characters"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={passwordValue} />
                <FieldError message={errors.password?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500/60' : ''}`}
                    placeholder="Re-enter your password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError message={errors.confirmPassword?.message} />
              </div>

              {/* Terms */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-3 p-3.5 rounded-lg border border-white/8 bg-white/3">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded border border-white/20 bg-white/5 accent-indigo-500 cursor-pointer shrink-0"
                    {...register('agreeToTerms')}
                  />
                  <label htmlFor="agreeToTerms" className="text-xs text-slate-400 cursor-pointer leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</a>
                    . I understand that HRManager4U.ai will process my company data in accordance with applicable data protection laws.
                  </label>
                </div>
                <FieldError message={(errors as any).agreeToTerms?.message} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={handleBack} className="btn-secondary flex-none px-4 py-2.5 justify-center">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Login link */}
        <div className="mt-6 pt-5 border-t border-white/8">
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
