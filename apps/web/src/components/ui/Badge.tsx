'use client';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'slate';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-slate-500/15  text-slate-300  border-slate-500/20',
  success:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning:  'bg-amber-500/15  text-amber-300   border-amber-500/20',
  danger:   'bg-rose-500/15   text-rose-300    border-rose-500/20',
  info:     'bg-indigo-500/15 text-indigo-300  border-indigo-500/20',
  purple:   'bg-violet-500/15 text-violet-300  border-violet-500/20',
  orange:   'bg-orange-500/15 text-orange-300  border-orange-500/20',
  slate:    'bg-slate-700/40  text-slate-400   border-slate-600/30',
};

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-slate-400',
  success:  'bg-emerald-400',
  warning:  'bg-amber-400',
  danger:   'bg-rose-400',
  info:     'bg-indigo-400',
  purple:   'bg-violet-400',
  orange:   'bg-orange-400',
  slate:    'bg-slate-500',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ variant = 'default', size = 'sm', dot, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
