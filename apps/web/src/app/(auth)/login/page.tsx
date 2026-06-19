'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Shield, Brain, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  mfaCode: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  // Restore remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('hrm4u-remembered-email');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login({
        email: data.email,
        password: data.password,
        ...(showMfa && data.mfaCode ? { mfaCode: data.mfaCode } : {}),
      } as any);

      // Handle remember me
      if (data.rememberMe) {
        const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem('hrm4u-remembered-email', data.email);
        localStorage.setItem('hrm4u-remember-expires', String(expires));
      } else {
        localStorage.removeItem('hrm4u-remembered-email');
        localStorage.removeItem('hrm4u-remember-expires');
      }

      toast.success('Welcome back!');
      router.push('/overview');
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? err?.message ?? 'Login failed';
      if (err?.response?.data?.requiresMfa || msg.toLowerCase().includes('mfa')) {
        setShowMfa(true);
        toast.info('Please enter your MFA code');
      } else {
        setServerError(msg);
      }
    }
  };

  const hasEmailError = !!errors.email || !!serverError;
  const hasPasswordError = !!errors.password || !!serverError;

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="glass-panel p-8 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">HRManager4U.ai</h1>
            <p className="text-xs text-slate-500">Enterprise HR Platform</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
        <p className="text-slate-400 mb-8 text-sm">Sign in to your HR workspace.</p>

        {/* Server-level error banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 mb-5 px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={`input-field w-full transition-all ${
                hasEmailError
                  ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                  : ''
              }`}
              placeholder="name@company.com"
              aria-invalid={hasEmailError ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-400 flex items-center gap-1 mt-1" role="alert">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`input-field w-full pr-10 transition-all ${
                  hasPasswordError
                    ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                    : ''
                }`}
                placeholder="••••••••"
                aria-invalid={hasPasswordError ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
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
            {errors.password && (
              <p id="password-error" className="text-xs text-red-400 flex items-center gap-1 mt-1" role="alert">
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* MFA Code (shown conditionally) */}
          {showMfa && (
            <div className="space-y-1.5 animate-fade-in">
              <label
                htmlFor="login-mfa"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Authenticator Code
              </label>
              <input
                id="login-mfa"
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                className="input-field w-full tracking-[0.4em] text-center font-mono text-lg"
                placeholder="000000"
                {...register('mfaCode', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  },
                })}
              />
              <p className="text-xs text-slate-500">
                Enter the 6-digit code from your authenticator app.
              </p>
              <Link
                href="/mfa"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Use a backup code instead →
              </Link>
            </div>
          )}

          {/* Remember me */}
          <div className="flex items-center gap-2.5">
            <input
              id="remember-me"
              type="checkbox"
              className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-indigo-500 cursor-pointer"
              {...register('rememberMe')}
            />
            <label htmlFor="remember-me" className="text-sm text-slate-400 cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Sign in to your account"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in…</span>
              </>
            ) : showMfa ? (
              <>
                <Shield className="w-4 h-4" />
                Verify &amp; Sign In
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Social login divider */}
        <div className="mt-6">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-600 whitespace-nowrap">or continue with</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Google SSO */}
            <div className="relative group">
              <button
                type="button"
                disabled
                aria-label="Sign in with Google (coming soon)"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/8 bg-white/3 text-slate-500 text-sm font-medium cursor-not-allowed opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <div
                role="tooltip"
                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-slate-800 border border-white/10 text-[10px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              >
                Coming soon
              </div>
            </div>

            {/* SAML SSO */}
            <div className="relative group">
              <button
                type="button"
                disabled
                aria-label="Sign in with SAML SSO (coming soon)"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/8 bg-white/3 text-slate-500 text-sm font-medium cursor-not-allowed opacity-60"
              >
                <Shield className="w-4 h-4" />
                SAML SSO
              </button>
              <div
                role="tooltip"
                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-slate-800 border border-white/10 text-[10px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              >
                Coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-6 pt-5 border-t border-white/8">
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Start free trial
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-5 flex items-center justify-center gap-4 flex-wrap">
          {(['SOC2 Type II', 'ISO 27001', 'PDPA Compliant'] as const).map((badge) => (
            <span key={badge} className="text-[10px] text-slate-600 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
