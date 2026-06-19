'use client';

import { useState, useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Shield, AlertCircle, Brain } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const DIGIT_COUNT = 6;

export default function MfaPage() {
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // ─── OTP digit handlers ──────────────────────────────────
  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);
      setServerError(null);

      if (digit && index < DIGIT_COUNT - 1) {
        focusInput(index + 1);
      }
    },
    [digits, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[index]) {
          const newDigits = [...digits];
          newDigits[index] = '';
          setDigits(newDigits);
        } else if (index > 0) {
          focusInput(index - 1);
          const newDigits = [...digits];
          newDigits[index - 1] = '';
          setDigits(newDigits);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1);
      } else if (e.key === 'ArrowRight' && index < DIGIT_COUNT - 1) {
        focusInput(index + 1);
      }
    },
    [digits, focusInput]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGIT_COUNT);
      if (!pasted) return;
      const newDigits = Array(DIGIT_COUNT).fill('');
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      // Focus the last filled input or the next empty one
      const focusIndex = Math.min(pasted.length, DIGIT_COUNT - 1);
      focusInput(focusIndex);
    },
    [focusInput]
  );

  // ─── Shake animation on error ─────────────────────────────
  const triggerShake = useCallback(() => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  }, []);

  // ─── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setServerError(null);
    setIsSubmitting(true);

    const code = useBackupCode ? backupCode : digits.join('');

    if (!useBackupCode && code.length !== DIGIT_COUNT) {
      setServerError('Please enter all 6 digits.');
      triggerShake();
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/auth/mfa/verify', { code, isBackupCode: useBackupCode });
      toast.success('Verification successful!');
      router.push('/overview');
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? err?.message ?? 'Invalid verification code. Please try again.';
      setServerError(msg);
      triggerShake();
      // Clear digits on error
      if (!useBackupCode) {
        setDigits(Array(DIGIT_COUNT).fill(''));
        focusInput(0);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = useBackupCode
    ? backupCode.trim().length > 0
    : digits.every((d) => d !== '');

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

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-6">
          <Shield className="w-7 h-7 text-indigo-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
        <p className="text-slate-400 text-sm mb-8">
          {useBackupCode
            ? 'Enter one of your backup codes to verify your identity.'
            : 'Enter the 6-digit code from your authenticator app.'}
        </p>

        {/* Error banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 mb-5 px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {!useBackupCode ? (
          /* ─── OTP digit inputs ─────────────────────────────── */
          <div
            className={`flex gap-3 justify-center mb-6 ${shakeError ? 'animate-[shake_0.6s_ease-in-out]' : ''}`}
            style={shakeError ? { animation: 'shake 0.6s ease-in-out' } : {}}
          >
            <style>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 50%, 90% { transform: translateX(-6px); }
                30%, 70% { transform: translateX(6px); }
              }
            `}</style>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${i + 1} of ${DIGIT_COUNT}`}
                className={`w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border transition-all outline-none
                  bg-white/5
                  ${digit ? 'border-indigo-500/60 text-white' : 'border-white/15 text-slate-400'}
                  focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] focus:text-white
                  ${serverError ? 'border-red-500/50' : ''}
                `}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
        ) : (
          /* ─── Backup code input ─────────────────────────────── */
          <div className="mb-6 space-y-1.5 animate-fade-in">
            <label htmlFor="backup-code" className="block text-sm font-medium text-slate-300">
              Backup Code
            </label>
            <input
              id="backup-code"
              type="text"
              autoComplete="off"
              spellCheck={false}
              className={`input-field font-mono tracking-wider text-center text-lg ${
                serverError ? 'border-red-500/60' : ''
              }`}
              placeholder="xxxx-xxxx-xxxx"
              value={backupCode}
              onChange={(e) => {
                setBackupCode(e.target.value);
                setServerError(null);
              }}
            />
          </div>
        )}

        {/* Verify button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !isComplete}
          className="btn-primary w-full justify-center py-2.5 mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Verify
            </>
          )}
        </button>

        {/* Backup code toggle */}
        <button
          type="button"
          onClick={() => {
            setUseBackupCode((v) => !v);
            setServerError(null);
            setDigits(Array(DIGIT_COUNT).fill(''));
            setBackupCode('');
          }}
          className="w-full text-center text-sm text-slate-400 hover:text-indigo-400 transition-colors py-1"
        >
          {useBackupCode
            ? '← Use authenticator app instead'
            : 'Use a backup code instead'}
        </button>

        {/* Back to login */}
        <div className="mt-6 pt-5 border-t border-white/8">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
