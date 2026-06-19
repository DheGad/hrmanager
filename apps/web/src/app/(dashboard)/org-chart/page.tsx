'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department?: { name: string };
  managerId?: string;
  avatarUrl?: string;
}

interface TreeNode {
  employee: Employee;
  reports: TreeNode[];
}

function buildTree(employees: Employee[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  employees.forEach(e => map.set(e.id, { employee: e, reports: [] }));

  const roots: TreeNode[] = [];
  employees.forEach(e => {
    const node = map.get(e.id)!;
    if (e.managerId && map.has(e.managerId)) {
      map.get(e.managerId)!.reports.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function OrgNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasReports = node.reports.length > 0;
  const initials = `${node.employee.firstName[0]}${node.employee.lastName[0]}`.toUpperCase();

  return (
    <div className={depth > 0 ? 'ml-8 pl-4 border-l border-white/8' : ''}>
      <div
        className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-colors cursor-pointer group mb-2 ${
          hasReports ? 'cursor-pointer' : ''
        }`}
        onClick={() => hasReports && setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {node.employee.firstName} {node.employee.lastName}
          </p>
          <p className="text-xs text-slate-500 truncate">{node.employee.jobTitle}</p>
          {node.employee.department && (
            <p className="text-[11px] text-indigo-400">{node.employee.department.name}</p>
          )}
        </div>
        {hasReports && (
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-[11px] text-slate-600">{node.reports.length}</span>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && hasReports && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {node.reports.map(child => (
              <OrgNode key={child.employee.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrgChartPage() {
  const { data: employees = [], isLoading, error } = useQuery<Employee[]>({
    queryKey: ['employees-org'],
    queryFn: () => api.get('/employees', { limit: 200 }),
    select: (data: any) => data?.data ?? data ?? [],
  });

  const tree = buildTree(employees);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Organisation Chart</h1>
          <p className="text-sm text-slate-500 mt-1">
            {employees.length} employees across your organisation
          </p>
        </div>
      </div>

      <div className="glass-panel p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3" style={{ marginLeft: `${(i % 3) * 32}px` }}>
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-white/10 rounded animate-pulse w-1/3" />
                  <div className="h-2 bg-white/6 rounded animate-pulse w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error || employees.length === 0 ? (
          <div className="py-16 text-center">
            <GitBranch className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Org Chart Data</h3>
            <p className="text-slate-500 text-sm">
              Add employees and assign managers to build your org chart.
            </p>
          </div>
        ) : (
          <div className="overflow-auto">
            {tree.map(root => (
              <OrgNode key={root.employee.id} node={root} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
