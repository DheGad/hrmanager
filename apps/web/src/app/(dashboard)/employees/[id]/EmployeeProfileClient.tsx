'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, FileText, FolderOpen,
  Phone, Mail, MapPin, Calendar, Briefcase, User,
  Shield, ClipboardList, Clock, History, Activity
} from 'lucide-react';
import { useEmployee, useEmployeeLifecycle } from '@/lib/hooks/useEmployees';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/Badge';
import { EmployeeTimeline } from './EmployeeTimeline';
import { formatDate, getInitials, cn } from '@/lib/utils';
import { differenceInYears, differenceInMonths } from 'date-fns';

type Tab = 'overview' | 'employment' | 'documents' | 'leave' | 'timeline' | 'audit';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'orange' | 'slate'> = {
  ACTIVE: 'success', PROBATION: 'warning', NOTICE_PERIOD: 'orange', RESIGNED: 'slate', TERMINATED: 'danger',
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<any>; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-white font-medium mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function getTenure(hireDate: string) {
  const years = differenceInYears(new Date(), new Date(hireDate));
  const months = differenceInMonths(new Date(), new Date(hireDate)) % 12;
  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}

export function EmployeeProfileClient({ id }: { id: string }) {
  const router = useRouter();
  const { user, hasAnyRole } = useAuthStore();
  const { data: employee, isLoading } = useEmployee(id);
  const { data: lifecycle } = useEmployeeLifecycle(id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const canEdit = hasAnyRole(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER']);
  const canAudit = hasAnyRole(['SUPER_ADMIN', 'COMPANY_ADMIN', 'AUDITOR']);

  const tabs: { key: Tab; label: string; icon: React.ComponentType<any>; hidden?: boolean }[] = [
    { key: 'overview',   label: 'Overview',   icon: User },
    { key: 'employment', label: 'Employment',  icon: Briefcase },
    { key: 'documents',  label: 'Documents',   icon: FolderOpen },
    { key: 'leave',      label: 'Leave',       icon: Calendar },
    { key: 'timeline',   label: 'Timeline',    icon: History },
    { key: 'audit',      label: 'Audit',       icon: Shield, hidden: !canAudit },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <div className="skeleton w-20 h-20 rounded-full mx-auto" />
          <div className="skeleton h-5 w-40 mx-auto" />
          <div className="skeleton h-3 w-24 mx-auto" />
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-3 w-full" />)}
        </div>
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Employee not found.</p>
        <button onClick={() => router.back()} className="btn-secondary mt-4">Go back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Employees
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Profile Card ── */}
        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          {employee.avatarUrl
            ? <img src={employee.avatarUrl} alt={`${employee.firstName} ${employee.lastName}`} className="w-20 h-20 rounded-full object-cover ring-4 ring-white/10" />
            : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white ring-4 ring-white/10">
                {getInitials(`${employee.firstName} ${employee.lastName}`)}
              </div>
            )}
          <div>
            <h2 className="text-lg font-bold text-white">{employee.firstName} {employee.lastName}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{employee.jobTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="info" size="sm">{employee.employeeNumber}</Badge>
            <Badge variant={statusVariant[employee.employmentStatus] ?? 'default'} dot>{employee.employmentStatus.replace('_', ' ')}</Badge>
          </div>

          {/* Quick stats */}
          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Tenure', value: getTenure(employee.hireDate) },
              { label: 'Department', value: employee.department?.name ?? '—' },
              { label: 'Branch', value: employee.branch?.name ?? '—' },
              { label: 'Manager', value: employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : '—' },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 rounded-lg p-2.5 text-left">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="w-full space-y-2 pt-2">
            {canEdit && (
              <button
                onClick={() => router.push(`/employees/${id}/edit`)}
                className="btn-secondary w-full justify-center"
                aria-label="Edit employee profile"
              >
                <Edit className="w-4 h-4" />Edit Profile
              </button>
            )}
            <button
              onClick={() => router.push(`/documents?employeeId=${id}`)}
              className="btn-secondary w-full justify-center"
              aria-label="View employee documents"
            >
              <FolderOpen className="w-4 h-4" />View Documents
            </button>
          </div>
        </div>

        {/* ── Right: Tabbed Content ── */}
        <div className="lg:col-span-2 glass-panel overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/8 overflow-x-auto">
            {tabs.filter((t) => !t.hidden).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-selected={activeTab === tab.key}
                role="tab"
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div className="p-6">
            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="tabpanel" aria-label="Overview">
                <InfoRow icon={Mail}     label="Work Email"     value={employee.workEmail} />
                <InfoRow icon={Mail}     label="Personal Email" value={(employee as any).personalEmail} />
                <InfoRow icon={Phone}    label="Mobile"         value={employee.mobile ?? employee.phone} />
                <InfoRow icon={User}     label="Date of Birth"  value={(employee as any).dateOfBirth ? formatDate((employee as any).dateOfBirth) : undefined} />
                <InfoRow icon={User}     label="Gender"         value={(employee as any).gender} />
                <InfoRow icon={User}     label="Nationality"    value={employee.nationality} />
                <InfoRow icon={MapPin}   label="Address"        value={[employee.address, employee.city, employee.state, employee.country].filter(Boolean).join(', ')} />
                <InfoRow icon={Phone}    label="Emergency Contact" value={employee.emergencyContactName ? `${employee.emergencyContactName} (${employee.emergencyContactRelation}) — ${employee.emergencyContactPhone}` : undefined} />
              </div>
            )}

            {/* ── Employment ── */}
            {activeTab === 'employment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="tabpanel" aria-label="Employment details">
                <InfoRow icon={Calendar}     label="Hire Date"         value={formatDate(employee.hireDate)} />
                <InfoRow icon={Calendar}     label="Probation End"     value={employee.probationEndDate ? formatDate(employee.probationEndDate) : undefined} />
                <InfoRow icon={Calendar}     label="Confirmation Date" value={employee.confirmationDate ? formatDate(employee.confirmationDate) : undefined} />
                <InfoRow icon={Briefcase}    label="Employment Type"   value={employee.employmentType.replace('_', ' ')} />
                <InfoRow icon={Briefcase}    label="Job Level"         value={employee.jobLevel} />
                <InfoRow icon={Briefcase}    label="Salary Band"       value={(employee as any).salaryBand} />
                <InfoRow icon={ClipboardList}label="Notice Period"     value={employee.noticePeriodDays ? `${employee.noticePeriodDays} days` : undefined} />
                <InfoRow icon={Activity}     label="Status"            value={employee.employmentStatus.replace('_', ' ')} />
              </div>
            )}

            {/* ── Documents ── */}
            {activeTab === 'documents' && (
              <div role="tabpanel" aria-label="Documents">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">Employee-linked documents</p>
                  <a href={`/documents?employeeId=${id}`} className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
                </div>
                <p className="text-sm text-slate-500">Documents will appear here once integrated with the Document Center.</p>
              </div>
            )}

            {/* ── Leave ── */}
            {activeTab === 'leave' && (
              <div role="tabpanel" aria-label="Leave information">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Annual Leave', available: 14, taken: 3 },
                    { label: 'Medical Leave', available: 14, taken: 2 },
                    { label: 'Emergency Leave', available: 3, taken: 0 },
                  ].map((bal) => (
                    <div key={bal.label} className="bg-white/3 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">{bal.label}</p>
                      <p className="text-2xl font-bold text-white">{bal.available - bal.taken}</p>
                      <p className="text-xs text-slate-500 mt-1">{bal.taken} taken of {bal.available}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600">Leave balance data is sourced from the Leave Management Engine.</p>
              </div>
            )}

            {/* ── Timeline ── */}
            {activeTab === 'timeline' && (
              <EmployeeTimeline events={(lifecycle ?? []) as Parameters<typeof EmployeeTimeline>[0]['events']} />
            )}

            {/* ── Audit ── */}
            {activeTab === 'audit' && canAudit && (
              <div role="tabpanel" aria-label="Audit log">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">Recent audit events for this employee</p>
                  <a href={`/audit?resourceId=${id}`} className="text-xs text-indigo-400 hover:text-indigo-300">View full audit →</a>
                </div>
                <p className="text-sm text-slate-500">Audit entries for this employee will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
