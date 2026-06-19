'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Bot, ShieldCheck, Settings, LogOut,
  ChevronLeft, ChevronRight, BarChart3, ClipboardCheck, BookOpen,
  Bell, Clock, FolderOpen, GitBranch, Building2, UserCheck, Rocket
} from 'lucide-react';
import { useAuthStore, type Role } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn, getInitials } from '@/lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
  roles?: Role[];
}

const navGroups: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/overview', icon: LayoutDashboard },
      { name: 'Get Started', path: '/onboarding', icon: Rocket, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] as Role[] },
    ],
  },
  {
    title: 'PEOPLE',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'MANAGER'],
    items: [
      { name: 'Employees', path: '/employees', icon: Users },
      { name: 'Org Chart', path: '/org-chart', icon: GitBranch, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'] },
      { name: 'Departments', path: '/departments', icon: Building2, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'] },
    ],
  },
  {
    title: 'WORKFLOWS',
    items: [
      { name: 'Approvals', path: '/workflows', icon: ClipboardCheck },
      { name: 'Leave Management', path: '/leave', icon: UserCheck, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'] },
    ],
  },
  {
    title: 'DOCUMENTS',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'AUDITOR'],
    items: [
      { name: 'Document Center', path: '/documents', icon: FolderOpen },
      { name: 'Notifications', path: '/notifications', icon: Bell },
    ],
  },
  {
    title: 'AI TOOLS',
    items: [
      { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
      { name: 'Handbook Generator', path: '/handbook', icon: BookOpen, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'] },
    ],
  },
  {
    title: 'COMPLIANCE',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'AUDITOR'],
    items: [
      { name: 'Compliance', path: '/compliance', icon: ShieldCheck },
      { name: 'Audit Logs', path: '/audit', icon: FileText, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'AUDITOR'] },
    ],
  },
  {
    title: 'ANALYTICS',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'],
    items: [{ name: 'Analytics', path: '/analytics', icon: BarChart3 }],
  },
  {
    title: 'SETTINGS',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    items: [
      { name: 'Control Center', path: '/control-center', icon: Settings },
      { name: 'Settings', path: '/settings', icon: Settings }
    ],
  },
];

const roleBadgeColors: Record<Role, string> = {
  SUPER_ADMIN:   'bg-rose-500/20 text-rose-300',
  COMPANY_ADMIN: 'bg-violet-500/20 text-violet-300',
  HR_MANAGER:    'bg-indigo-500/20 text-indigo-300',
  MANAGER:       'bg-blue-500/20 text-blue-300',
  EMPLOYEE:      'bg-emerald-500/20 text-emerald-300',
  AUDITOR:       'bg-amber-500/20 text-amber-300',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const userRole = user?.role as Role | undefined;

  const canAccess = (roles?: Role[]) => {
    if (!roles || roles.length === 0) return true;
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  const visibleGroups = navGroups
    .filter((g) => canAccess(g.roles))
    .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(i.roles)) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-[#0E1428] border-r border-white/6 transition-all duration-300 shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn('h-16 flex items-center border-b border-white/6 px-4 gap-3', sidebarCollapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent leading-tight whitespace-nowrap">
              HRManager4U
            </h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider">.ai</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            {!sidebarCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-600 mb-1.5 tracking-widest uppercase">
                {group.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    aria-label={item.name}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={cn(
                      'nav-item w-full',
                      isActive && 'active',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                  >
                    <item.icon className="w-4.5 h-4.5 flex-shrink-0" aria-hidden="true" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/6 p-3 space-y-2">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/4 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              {userRole && (
                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', roleBadgeColors[userRole])}>
                  {userRole.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          aria-label="Logout"
          title="Logout"
          className={cn(
            'flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-sm text-slate-500 hover:text-rose-400 hover:bg-rose-500/8 transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-400 hover:bg-white/4 transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
