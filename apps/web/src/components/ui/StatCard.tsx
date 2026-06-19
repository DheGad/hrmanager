'use client';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: { value: number; label: string };
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  href?: string;
  suffix?: string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    ref.current = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      ref.current = Math.floor(ease * target);
      setCount(ref.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

export function StatCard({ title, value, delta, icon: Icon, iconColor = 'text-indigo-400', iconBg = 'bg-indigo-500/10', trend, loading, href, suffix }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
  const displayCount = useCountUp(numericValue);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';

  const card = (
    <div className={cn('metric-card hover-lift p-5 cursor-default relative group', href && 'cursor-pointer')}>
      {/* Decorative gradient blur based on trend */}
      {trend === 'up' && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />}
      {trend === 'down' && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors pointer-events-none" />}
      {trend === 'neutral' && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />}
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-3 w-32" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
            {trend && (
              <TrendIcon className={cn('w-4 h-4', trendColor)} aria-hidden="true" />
            )}
          </div>
          <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] tabular-nums">
            {typeof value === 'number' ? displayCount.toLocaleString() : value}
            {suffix && <span className="text-lg text-slate-400 ml-1">{suffix}</span>}
          </p>
          {delta && (
            <p className={cn('text-xs mt-2 font-medium', trendColor)}>
              {delta.value > 0 ? '+' : ''}{delta.value}% {delta.label}
            </p>
          )}
        </>
      )}
    </div>
  );

  if (href) return <Link href={href} aria-label={title}>{card}</Link>;
  return card;
}
