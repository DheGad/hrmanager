'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft, Brain } from 'lucide-react';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSuccess(true);
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? err?.message ?? 'Something went wrong. Please try again.';
      setServerError(msg);
    }
  };

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

        {success ? (
          /* ─── Success State ────────────────────────────────── */
          <div className="animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Inbox</h2>
            <p className="text-slate-400 text-sm mb-2">We sent a password reset link to</p>
            <p className="text-indigo-400 font-medium mb-6 break-all">{submittedEmail}</p>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">
              Click the link in the email to reset your password. The link is valid for 1 hour. If you don&apos;t see it,
              check your spam folder.
            </p>
            <Link
              href="/login"
              className="btn-secondary w-full justify-center py-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          /* ─── Form State ─────────────────────────────────── */
          <>
            <h2 className="text-2xl font-bold text-white mb-1">Forgot Password?</h2>
            <p className="text-slate-400 text-sm mb-8">
              Enter your work email and we&apos;ll send you a link to reset your password.
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
              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-300">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    className={`input-field pl-10 ${
                      errors.email
                        ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                        : ''
                    }`}
                    placeholder="name@company.com"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'forgot-email-error' : undefined}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p id="forgot-email-error" className="text-xs text-red-400 flex items-center gap-1 mt-1" role="alert">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Reset Link…
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/8">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
