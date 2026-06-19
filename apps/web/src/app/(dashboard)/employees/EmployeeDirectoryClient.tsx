'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, LayoutGrid, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useEmployees, type Employee, type EmployeeFilters } from '@/lib/hooks/useEmployees';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { Users } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'orange' | 'slate'> = {
  ACTIVE:        'success',
  PROBATION:     'warning',
  NOTICE_PERIOD: 'orange',
  RESIGNED:      'slate',
  TERMINATED:    'danger',
  RETIRED:       'slate',
};

const typeVariant: Record<string, 'info' | 'success' | 'warning' | 'slate' | 'purple'> = {
  FULL_TIME: 'info',
  PART_TIME: 'success',
  CONTRACT:  'warning',
  INTERN:    'purple',
  TEMPORARY: 'slate',
};

function EmployeeAvatar({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-3">
      {employee.avatarUrl
        ? <img src={employee.avatarUrl} alt={`${employee.firstName} ${employee.lastName}`} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10" />
        : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(`${employee.firstName} ${employee.lastName}`)}
          </div>
        )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{employee.firstName} {employee.lastName}</p>
        <p className="text-xs text-slate-500">{employee.employeeNumber}</p>
      </div>
    </div>
  );
}

function EmployeeCard({ employee, onClick }: { employee: Employee; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`View profile of ${employee.firstName} ${employee.lastName}`}
      className="glass-panel glass-panel-hover p-4 text-left w-full transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3 mb-3">
        {employee.avatarUrl
          ? <img src={employee.avatarUrl} alt={`${employee.firstName} ${employee.lastName}`} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10" />
          : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {getInitials(`${employee.firstName} ${employee.lastName}`)}
            </div>
          )}
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{employee.firstName} {employee.lastName}</p>
          <p className="text-xs text-slate-500 truncate">{employee.employeeNumber}</p>
        </div>
      </div>
      <p className="text-sm text-slate-300 truncate mb-1">{employee.jobTitle}</p>
      <p className="text-xs text-slate-500 truncate mb-3">{employee.department?.name ?? '—'}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={statusVariant[employee.employmentStatus] ?? 'default'} dot>
          {employee.employmentStatus.replace('_', ' ')}
        </Badge>
        <Badge variant={typeVariant[employee.employmentType] ?? 'default'}>
          {employee.employmentType.replace('_', ' ')}
        </Badge>
      </div>
      <p className="text-xs text-slate-600 mt-3">Joined {formatDate(employee.hireDate)}</p>
    </button>
  );
}

export function EmployeeDirectoryClient() {
  const router = useRouter();
  const { hasAnyRole } = useAuthStore();
  const canCreate = hasAnyRole(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER']);

  const [view, setView] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, limit: 20 });
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setFilters((f) => ({ ...f, search: value || undefined, page: 1 }));
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const { data, isLoading } = useEmployees(filters);
  const employees = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1, page: 1, limit: 20 };

  const goToProfile = useCallback((emp: Employee) => router.push(`/employees/${emp.id}`), [router]);

  const tableColumns = [
    {
      key: 'firstName', header: 'Employee', sortable: true,
      cell: (row: Employee) => <EmployeeAvatar employee={row} />,
    },
    {
      key: 'jobTitle', header: 'Role & Department',
      cell: (row: Employee) => (
        <div>
          <p className="text-sm text-white">{row.jobTitle}</p>
          <p className="text-xs text-slate-500">{row.department?.name ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'employmentType', header: 'Type',
      cell: (row: Employee) => <Badge variant={typeVariant[row.employmentType] ?? 'default'}>{row.employmentType.replace('_', ' ')}</Badge>,
    },
    {
      key: 'employmentStatus', header: 'Status',
      cell: (row: Employee) => <Badge variant={statusVariant[row.employmentStatus] ?? 'default'} dot>{row.employmentStatus.replace('_', ' ')}</Badge>,
    },
    {
      key: 'hireDate', header: 'Hire Date', sortable: true,
      cell: (row: Employee) => <span className="text-sm text-slate-400">{formatDate(row.hireDate)}</span>,
    },
    {
      key: 'actions', header: '',
      cell: (row: Employee) => (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/employees/${row.id}`); }}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          aria-label={`View ${row.firstName}'s profile`}
        >
          View →
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="search"
            value={searchValue}
            onChange={handleSearch}
            placeholder="Search by name, email, employee number…"
            aria-label="Search employees"
            className="input-field pl-9 w-full"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status filter */}
          <select
            className="input-field text-sm"
            aria-label="Filter by employment status"
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Statuses</option>
            {['ACTIVE', 'PROBATION', 'NOTICE_PERIOD', 'RESIGNED', 'TERMINATED'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            className="input-field text-sm"
            aria-label="Filter by employment type"
            onChange={(e) => setFilters((f) => ({ ...f, employmentType: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Types</option>
            {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY'].map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setView('table')}
              aria-label="Table view"
              aria-pressed={view === 'table'}
              className={cn('px-2.5 py-2 transition-colors', view === 'table' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={cn('px-2.5 py-2 transition-colors', view === 'grid' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {canCreate && (
            <button
              onClick={() => router.push('/employees/new')}
              className="btn-primary flex-shrink-0"
              aria-label="Add new employee"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {!isLoading && (
        <p className="text-xs text-slate-500">
          Showing {employees.length} of {meta.total.toLocaleString()} employees
        </p>
      )}

      {/* Table View */}
      {view === 'table' && (
        <DataTable
          data={employees}
          columns={tableColumns as any}
          loading={isLoading}
          onRowClick={goToProfile}
          emptyMessage="No employees found. Try adjusting your filters."
        />
      )}

      {/* Grid View */}
      {view === 'grid' && (
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                </div>
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" description="Try adjusting your search filters." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((emp) => (
              <EmployeeCard key={emp.id} employee={emp} onClick={() => goToProfile(emp)} />
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
              disabled={meta.page <= 1}
              aria-label="Previous page"
              className="btn-secondary py-1.5 px-2.5 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-white px-2">{meta.page}</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.min(meta.totalPages, (f.page ?? 1) + 1) }))}
              disabled={meta.page >= meta.totalPages}
              aria-label="Next page"
              className="btn-secondary py-1.5 px-2.5 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
