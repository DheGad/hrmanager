'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, Brain } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ─── Password Strength ───────────────────────────────────────
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

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-white/10'}`}
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

// ─── Zod Schema ──────────────────────────────────────────────
const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

// ─── Inner Component (needs useSearchParams) ─────────────────
function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    if (!token) {
      setServerError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? err?.message ?? 'Failed to reset password. The link may have expired.';
      setServerError(msg);
    }
  };

  if (!token) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
        <p className="text-slate-400 text-sm mb-8">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn-primary justify-center w-full">
          Request New Reset Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
        <p className="text-slate-400 text-sm mb-2">
          Your password has been changed successfully.
        </p>
        <p className="text-xs text-slate-500 mb-8">Redirecting you to sign in…</p>
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Redirecting…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
      <p className="text-slate-400 text-sm mb-8">
        Enter your new password below. Make sure it&apos;s strong and unique.
      </p>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 mb-5 px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="reset-password" className="block text-sm font-medium text-slate-300">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/60' : ''}`}
              placeholder="Min. 8 characters"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'reset-password-error' : undefined}
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
          {errors.password && (
            <p id="reset-password-error" className="text-xs text-red-400 flex items-center gap-1 mt-1" role="alert">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-slate-300">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500/60' : ''}`}
              placeholder="Re-enter your password"
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
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
          {errors.confirmPassword && (
            <p id="reset-confirm-error" className="text-xs text-red-400 flex items-center gap-1 mt-1" role="alert">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password requirements hint */}
        <ul className="text-xs text-slate-500 space-y-1 pl-1">
          {[
            { check: passwordValue.length >= 8, label: 'At least 8 characters' },
            { check: /[A-Z]/.test(passwordValue), label: 'One uppercase letter' },
            { check: /[0-9]/.test(passwordValue), label: 'One number' },
          ].map(({ check, label }) => (
            <li key={label} className={`flex items-center gap-1.5 transition-colors ${check ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-3 h-3 ${check ? 'text-emerald-400' : 'text-slate-600'}`} />
              {label}
            </li>
          ))}
        </ul>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting Password…
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Reset Password
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-white/8">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back to Sign In
        </Link>
      </div>
    </>
  );
}

// ─── Page Component (wraps with Suspense for useSearchParams) ─
export default function ResetPasswordPage() {
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

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
