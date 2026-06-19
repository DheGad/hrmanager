'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Building2, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  description?: string;
  _count?: { employees: number };
  managerId?: string;
  manager?: { firstName: string; lastName: string };
}

export default function DepartmentsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments'),
    select: (data: any) => data?.data ?? data ?? [],
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => api.post('/departments', data),
    onSuccess: () => {
      toast.success('Department created');
      qc.invalidateQueries({ queryKey: ['departments'] });
      setShowForm(false);
      setNewName('');
      setNewDesc('');
    },
    onError: () => toast.error('Failed to create department'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      toast.success('Department deleted');
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => toast.error('Cannot delete department with active employees'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">{departments.length} departments configured</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-5 border-indigo-500/30">
          <h3 className="text-sm font-semibold text-white mb-4">New Department</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="input-field w-full"
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="input-field w-full"
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => createMutation.mutate({ name: newName, description: newDesc || undefined })}
              disabled={!newName.trim() || createMutation.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create Department'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-panel p-5 h-32 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
              <div className="h-3 bg-white/6 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Departments Yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create departments to organise your workforce.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" />
            Create First Department
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map(dept => (
            <div key={dept.id} className="glass-panel p-5 group hover:border-white/15 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteMutation.mutate(dept.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label={`Delete ${dept.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-white">{dept.name}</p>
                {dept.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                )}
                {dept.manager && (
                  <p className="text-xs text-indigo-400 mt-1.5">
                    Head: {dept.manager.firstName} {dept.manager.lastName}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/6 flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                {dept._count?.employees ?? 0} employee{(dept._count?.employees ?? 0) !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
