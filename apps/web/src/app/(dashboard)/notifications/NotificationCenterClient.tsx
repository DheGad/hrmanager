'use client';
import { useState } from 'react';
import { Bell, CheckCheck, CheckCircle, AlertTriangle, FileText, Info, Mail, MessageSquare, Phone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/lib/hooks/useNotifications';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Notification } from '@/store/ui.store';

type FilterKey = 'all' | 'unread' | 'info' | 'warning' | 'error' | 'success';

const typeIconMap: Record<string, { Icon: React.ComponentType<any>; color: string; bg: string }> = {
  success: { Icon: CheckCircle,    color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  warning: { Icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  error:   { Icon: AlertTriangle,  color: 'text-rose-400',    bg: 'bg-rose-500/15' },
  info:    { Icon: Info,           color: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
};

function NotificationRow({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const cfg = typeIconMap[notification.type] ?? typeIconMap.info;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => !notification.read && onRead(notification.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !notification.read && onRead(notification.id)}
      aria-label={`Notification: ${notification.title} — ${notification.read ? 'read' : 'unread'}`}
      className={cn(
        'flex items-start gap-4 px-5 py-4 border-b border-white/5 last:border-0 transition-colors cursor-pointer',
        !notification.read ? 'bg-indigo-500/4 hover:bg-indigo-500/6' : 'hover:bg-white/3'
      )}
    >
      {/* Icon */}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
        <cfg.Icon className={cn('w-4.5 h-4.5', cfg.color)} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium truncate', notification.read ? 'text-slate-300' : 'text-white')}>
            {notification.title}
          </p>
          <span className="text-[11px] text-slate-600 flex-shrink-0 mt-0.5">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notification.body}</p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-2" aria-label="Unread" />
      )}
    </motion.div>
  );
}

function ChannelToggle({ label, icon: Icon, enabled, onToggle }: {
  label: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${label} notifications`}
        onClick={onToggle}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors',
          enabled ? 'bg-indigo-500' : 'bg-white/15'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}

export function NotificationCenterClient() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [prefs, setPrefs] = useState({ email: true, whatsapp: false, sms: false, inApp: true });

  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const tabs: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'all',     label: 'All',       count: notifications.length },
    { key: 'unread',  label: 'Unread',    count: unreadCount },
    { key: 'info',    label: 'Updates' },
    { key: 'warning', label: 'Alerts' },
    { key: 'error',   label: 'Critical' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Notification List ── */}
      <div className="lg:col-span-2 glass-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white">All Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            onClick={() => markAll.mutate()}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Mark all notifications as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />Mark all read
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-white/8 overflow-x-auto px-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              role="tab"
              aria-selected={filter === t.key}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                filter === t.key ? 'text-indigo-300 border-b-2 border-indigo-500 -mb-px' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={cn('px-1.5 py-0.5 rounded-full text-[10px]', filter === t.key ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/8 text-slate-500')}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4">
                <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description={filter === 'unread' ? 'You are all caught up!' : 'No notifications in this category.'} className="border-none rounded-none" />
          ) : (
            filtered.map((n) => (
              <NotificationRow key={n.id} notification={n} onRead={(id) => markRead.mutate(id)} />
            ))
          )}
        </div>
      </div>

      {/* ── Preferences Panel ── */}
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white mb-4">Notification Channels</h3>
          <div className="space-y-0">
            <ChannelToggle label="Email" icon={Mail} enabled={prefs.email} onToggle={() => setPrefs((p) => ({ ...p, email: !p.email }))} />
            <ChannelToggle label="WhatsApp" icon={MessageSquare} enabled={prefs.whatsapp} onToggle={() => setPrefs((p) => ({ ...p, whatsapp: !p.whatsapp }))} />
            <ChannelToggle label="SMS" icon={Phone} enabled={prefs.sms} onToggle={() => setPrefs((p) => ({ ...p, sms: !p.sms }))} />
            <ChannelToggle label="In-App" icon={Monitor} enabled={prefs.inApp} onToggle={() => setPrefs((p) => ({ ...p, inApp: !p.inApp }))} />
          </div>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white mb-3">Notification Types</h3>
          <div className="space-y-3">
            {[
              { label: 'Approval requests', desc: 'When you need to approve or reject' },
              { label: 'Document expiry', desc: 'Documents expiring within 30 days' },
              { label: 'Compliance alerts', desc: 'Compliance score changes' },
              { label: 'AI query responses', desc: 'When AI answers are ready' },
              { label: 'System updates', desc: 'Platform maintenance and updates' },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-300">{item.label}</p>
                  <p className="text-[11px] text-slate-600">{item.desc}</p>
                </div>
                <span className="text-xs text-emerald-400">On</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
