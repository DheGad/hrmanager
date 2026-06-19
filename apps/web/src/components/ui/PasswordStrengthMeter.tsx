'use client';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

type StrengthLevel = {
  label: string;
  color: string;
  bars: number;
  score: number;
};

function getStrength(password: string): StrengthLevel {
  if (!password) return { label: '', color: '', bars: 0, score: 0 };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels: StrengthLevel[] = [
    { label: 'Too Weak',  color: 'bg-rose-500',   bars: 1, score: 1 },
    { label: 'Weak',      color: 'bg-orange-500',  bars: 2, score: 2 },
    { label: 'Fair',      color: 'bg-amber-400',   bars: 3, score: 3 },
    { label: 'Strong',    color: 'bg-emerald-400', bars: 4, score: 4 },
    { label: 'Very Strong', color: 'bg-emerald-500', bars: 5, score: 5 },
  ];

  return levels[Math.min(score, 4)] ?? levels[0];
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = getStrength(password);

  if (!password) return null;

  const textColor =
    strength.bars <= 1 ? 'text-rose-400' :
    strength.bars === 2 ? 'text-orange-400' :
    strength.bars === 3 ? 'text-amber-400' :
    'text-emerald-400';

  return (
    <div className={cn('mt-2 space-y-1.5', className)} aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < strength.bars ? strength.color : 'bg-white/10'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', textColor)}>
        {strength.label}
      </p>
    </div>
  );
}
