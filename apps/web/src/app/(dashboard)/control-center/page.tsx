'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Settings, Save, CheckCircle2, AlertCircle, Shield, Database, Mail, Building2, Server } from 'lucide-react';

export default function ControlCenterPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('ai');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [costs, setCosts] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [confRes, healthRes]: [any, any] = await Promise.all([
        api.get('/control-center/config'),
        api.get('/control-center/health')
      ]);
      setConfig(confRes.data);
      setHealth(healthRes.data);

      if (user?.role === 'SUPER_ADMIN') {
        const costsRes: any = await api.get('/control-center/costs');
        setCosts(costsRes.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setConfig(null); // Disabled
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: string) => {
    setSaving(true);
    try {
      await api.put('/control-center/config', {
        category,
        config: config[category]
      });
      alert('Configuration saved successfully');
      fetchData();
    } catch (e) {
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading Control Center...</div>;
  }

  if (!config) {
    return (
      <div className="p-8 text-white flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400">The Platform Control Center is currently disabled via environment configuration.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'ai', label: 'AI Settings', icon: Server },
    { id: 'email', label: 'Email (SMTP)', icon: Mail },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'company', label: 'Company Info', icon: Building2 },
  ];

  const handleInputChange = (category: string, key: string, value: string) => {
    setConfig({
      ...config,
      [category]: {
        ...config[category],
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            Platform Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {user?.role === 'SUPER_ADMIN' ? 'Global system configuration and overrides.' : 'Tenant-specific feature overrides.'}
          </p>
        </div>
        {user?.role === 'SUPER_ADMIN' && costs && (
          <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Est. Monthly Cost</p>
              <p className="text-lg font-mono font-bold text-emerald-400">${costs.totalEstimateUsd}</p>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">AI Queries</p>
              <p className="text-lg font-mono font-bold text-white">{costs.totalAiQueries}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}

          <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">System Health</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Database</span>
                {health?.database === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">AI Chat API</span>
                {health?.ai?.chatStatus === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Embeddings API</span>
                {health?.ai?.embeddingStatus === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-[#151B2B] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white capitalize">{activeTab} Configuration</h2>
              <button
                onClick={() => handleSave(activeTab)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-5">
              {Object.keys(config[activeTab]).map(key => {
                const value = config[activeTab][key];
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-300 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type={value && value.toString().startsWith('****') ? 'password' : 'text'}
                      value={value || ''}
                      onChange={(e) => handleInputChange(activeTab, key, e.target.value)}
                      placeholder={value && value.toString().startsWith('****') ? 'Unchanged (Hidden)' : `Enter ${key}`}
                      className="w-full bg-[#0B0F19] border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-3 py-2"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
