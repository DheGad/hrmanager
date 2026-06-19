'use client';

import { Settings, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState({
    leaveRequests: true,
    complianceAlerts: true,
    systemUpdates: false,
    weeklyDigest: true,
  });

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal account preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">
            {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          </div>
          <div>
            <p className="text-base font-semibold text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {user?.role?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name</label>
            <input className="input-field w-full" defaultValue={user?.firstName} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name</label>
            <input className="input-field w-full" defaultValue={user?.lastName} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
            <input className="input-field w-full opacity-60 cursor-not-allowed" defaultValue={user?.email} disabled />
            <p className="text-[11px] text-slate-600 mt-1">Email changes require administrator approval.</p>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={() => toast.info('Profile update coming soon')} className="btn-primary">
            Save Profile
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Notification Preferences</h2>
        </div>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => {
            const labels: Record<string, { title: string; desc: string }> = {
              leaveRequests: { title: 'Leave Requests', desc: 'Notify when employees submit leave requests' },
              complianceAlerts: { title: 'Compliance Alerts', desc: 'Notify when compliance issues are detected' },
              systemUpdates: { title: 'System Updates', desc: 'Notify about platform updates and maintenance' },
              weeklyDigest: { title: 'Weekly Digest', desc: 'Receive a weekly summary of HR activities' },
            };
            const label = labels[key];
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{label.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    value ? 'bg-indigo-600' : 'bg-white/10'
                  }`}
                  aria-checked={value}
                  role="switch"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-5">
          <button onClick={handleSaveNotifications} className="btn-primary">
            Save Preferences
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Security</h2>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => toast.info('Password reset email sent')}
            className="w-full text-left px-4 py-3 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 transition-colors"
          >
            <p className="text-sm font-medium text-white">Change Password</p>
            <p className="text-xs text-slate-500 mt-0.5">Send a password reset link to your email</p>
          </button>
          <button
            onClick={() => toast.info('MFA setup coming soon')}
            className="w-full text-left px-4 py-3 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 transition-colors"
          >
            <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
            <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account</p>
          </button>
        </div>
      </div>

      {/* For Super Admin — link to Control Center */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="glass-panel p-5 border-indigo-500/25 bg-indigo-500/5">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Platform Control Center</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure AI providers, email, storage, and system-wide settings.{' '}
                <a href="/control-center" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Go to Control Center →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
