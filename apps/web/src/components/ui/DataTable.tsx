'use client';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, SearchX } from 'lucide-react';
import { useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({ data, columns, loading, emptyMessage = 'No records found', emptyIcon: EmptyIcon = SearchX, onRowClick, className }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div className={cn('overflow-x-auto overflow-y-auto max-h-[600px] rounded-xl border border-white/8 glass-panel', className)}>
      <table className="w-full text-sm" role="grid">
        <thead className="sticky top-0 z-10 bg-[#0B0B18]/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 font-semibold text-slate-400 text-left select-none',
                  col.sortable && 'cursor-pointer hover:text-white transition-colors',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
                onClick={() => col.sortable && handleSort(col.key)}
                aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    sortKey === col.key
                      ? sortDir === 'asc'
                        ? <ChevronUp className="w-3 h-3 text-indigo-400" />
                        : <ChevronDown className="w-3 h-3 text-indigo-400" />
                      : <ChevronsUpDown className="w-3 h-3 opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="skeleton h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <EmptyIcon className="w-10 h-10 text-slate-600" />
                      <p className="text-slate-500 text-sm">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )
              : sorted.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-white/5 transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-white/4' : 'hover:bg-white/2',
                  )}
                  onClick={() => onRowClick?.(row)}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3.5 text-slate-300',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.cell ? col.cell(row) : String((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
