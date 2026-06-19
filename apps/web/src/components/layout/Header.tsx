'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, X, Check, CheckCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useMarkAllRead } from '@/lib/hooks/useNotifications';
import { formatRelativeTime, getInitials, cn } from '@/lib/utils';

const pathTitles: Record<string, string> = {
  '/overview':     'Dashboard',
  '/employees':    'Employees',
  '/org-chart':    'Org Chart',
  '/departments':  'Departments',
  '/workflows':    'Approvals',
  '/leave':        'Leave Management',
  '/documents':    'Document Center',
  '/notifications':'Notifications',
  '/ai-assistant': 'AI HR Assistant',
  '/handbook':     'Handbook Generator',
  '/compliance':   'Compliance',
  '/audit':        'Audit Logs',
  '/analytics':    'Analytics',
  '/settings':     'Settings',
};

function getBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: string[] = ['Dashboard'];
  let path = '';
  for (const seg of segments) {
    path += '/' + seg;
    const label = pathTitles[path] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    if (label !== 'Dashboard') crumbs.push(label);
  }
  return crumbs;
}

function NotificationIcon(type: string) {
  const map: Record<string, string> = {
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    error:   'bg-rose-500/15   text-rose-400',
    info:    'bg-indigo-500/15 text-indigo-400',
  };
  return map[type] ?? map.info;
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggleSidebar, unreadCount } = useUIStore();
  const uc = unreadCount();

  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const markAll = useMarkAllRead();

  const title = Object.entries(pathTitles).find(([k]) => pathname === k || pathname.startsWith(k + '/'))?.[1] ?? 'Dashboard';
  const breadcrumbs = getBreadcrumbs(pathname);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/6 bg-[#0F0F1A]/80 backdrop-blur-md flex-shrink-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-white leading-tight">{title}</h2>
          {breadcrumbs.length > 1 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 mt-0.5">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-600 text-xs">/</span>}
                  <span className={cn('text-xs', i === breadcrumbs.length - 1 ? 'text-indigo-400 font-medium' : 'text-slate-500')}>
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={cn('relative transition-all duration-200', searchOpen ? 'w-64' : 'w-9')}>
          {searchOpen ? (
            <div className="flex items-center gap-2 glass-panel px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                type="search"
                placeholder="Search employees, documents…"
                aria-label="Global search"
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 w-full"
                onBlur={() => setSearchOpen(false)}
              />
              <button onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label={`Notifications — ${uc} unread`}
            aria-expanded={notifOpen}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {uc > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {uc > 9 ? '9+' : uc}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 glass-panel animate-scale-in z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <button
                  onClick={() => { markAll.mutate(); }}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  aria-label="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">No notifications</div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div key={n.id} className={cn('flex gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer', !n.read && 'bg-indigo-500/4')}>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm', NotificationIcon(n.type))}>
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium truncate', n.read ? 'text-slate-300' : 'text-white')}>{n.title}</p>
                        <p className="text-xs text-slate-500 truncate">{n.body}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-white/8 px-4 py-2.5">
                <a href="/notifications" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  View all notifications →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer ring-2 ring-white/10 hover:ring-indigo-500/50 transition-all">
          {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
        </div>
      </div>
    </header>
  );
}
