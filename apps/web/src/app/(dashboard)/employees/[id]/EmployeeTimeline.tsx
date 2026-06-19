'use client';
import { motion } from 'framer-motion';
import {
  UserPlus, TrendingUp, ArrowRightLeft, Activity,
  FileText, CheckCircle
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface LifecycleEvent {
  id: string;
  eventType: string;
  fromStatus?: string;
  toStatus: string;
  description?: string;
  changedById?: string;
  changedBy?: { firstName: string; lastName: string };
  occurredAt: string;
}

const eventConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  HIRED:             { icon: UserPlus,       color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: 'Hired' },
  PROMOTION:         { icon: TrendingUp,     color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Promotion' },
  TRANSFER:          { icon: ArrowRightLeft, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Transfer' },
  STATUS_CHANGE:     { icon: Activity,       color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Status Change' },
  DOCUMENT_GENERATED:{ icon: FileText,       color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', label: 'Document Generated' },
  CONFIRMED:         { icon: CheckCircle,    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Confirmed' },
};

export function EmployeeTimeline({ events }: { events: LifecycleEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No lifecycle events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0" role="list" aria-label="Employee lifecycle timeline">
      {events.map((event, i) => {
        const cfg = eventConfig[event.eventType] ?? eventConfig.STATUS_CHANGE;
        return (
          <motion.div
            key={event.id}
            role="listitem"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="flex gap-4 pb-6 relative"
          >
            {/* Vertical line */}
            {i < events.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/8" aria-hidden="true" />
            )}

            {/* Icon */}
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border', cfg.color)}>
              <cfg.icon className="w-4.5 h-4.5" aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{cfg.label}</p>
                  {event.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
                  )}
                  {event.fromStatus && event.toStatus && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {event.fromStatus.replace('_', ' ')} → <span className="text-white">{event.toStatus.replace('_', ' ')}</span>
                    </p>
                  )}
                  {event.changedBy && (
                    <p className="text-xs text-slate-600 mt-1">
                      By {event.changedBy.firstName} {event.changedBy.lastName}
                    </p>
                  )}
                </div>
                <time
                  dateTime={event.occurredAt}
                  className="text-xs text-slate-600 flex-shrink-0 mt-0.5"
                >
                  {formatDate(event.occurredAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                </time>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
