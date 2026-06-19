const fs = require('fs');
const path = require('path');

const WEB_SRC = '/Users/DEERU/.gemini/antigravity/scratch/hrmanager4u/apps/web/src';

function writeFile(filePath, content) {
  const fullPath = path.join(WEB_SRC, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Created: ${filePath}`);
}

// -----------------------------------------------------------------------------
// APP SETUP
// -----------------------------------------------------------------------------
writeFile('app/globals.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 252 100% 64%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    background-image: radial-gradient(circle at top right, rgba(79, 70, 229, 0.1), transparent 400px);
    background-attachment: fixed;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading tracking-tight;
  }
}

.glass-panel {
  @apply bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-xl;
}

.glass-panel-hover {
  @apply hover:bg-white/10 transition-colors duration-200;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}
`);

writeFile('app/layout.tsx', `
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'HRManager4U.ai | Enterprise AI HR OS',
  description: 'AI-powered HR Operating System for SMEs in Malaysia and Australia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={\`\${inter.variable} \${sora.variable} font-sans min-h-screen bg-[#0F0F1A]\`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
`);

writeFile('app/providers.tsx', `
'use client';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster theme="dark" position="top-right" />
    </>
  );
}
`);

// -----------------------------------------------------------------------------
// UTILS & API
// -----------------------------------------------------------------------------
writeFile('lib/utils.ts', `
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`);

writeFile('lib/api.ts', `
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  const tenantId = useAuthStore.getState().tenantId;
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data?.data || response.data,
  async (error) => {
    // Add token refresh logic here
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);
`);

writeFile('store/auth.store.ts', `
import { create } from 'zustand';
import { api } from '../lib/api';

interface AuthState {
  user: any | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
  setTenantId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenantId: null,
  isAuthenticated: false,
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      set({ user: res.user, tenantId: res.user.tenantId, isAuthenticated: true });
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    }
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, tenantId: null });
    window.location.href = '/login';
  },
  setTenantId: (id) => set({ tenantId: id }),
}));
`);

// -----------------------------------------------------------------------------
// AUTH PAGES
// -----------------------------------------------------------------------------
writeFile('app/(auth)/layout.tsx', `
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-[#16213E] to-[#0F0F1A] border-r border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-heading font-bold mb-4 bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            HRManager4U.ai
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            The Enterprise AI HR Operating System for SMEs. Automate compliance, document generation, and employee management.
          </p>
          <div className="space-y-4 text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">✓</div>
              Employment Act 1955 Compliant
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">✓</div>
              Automated Document Generation
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">✓</div>
              24/7 AI Legal Assistant
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-[#0F0F1A]">
        {children}
      </div>
    </div>
  );
}
`);

writeFile('app/(auth)/login/page.tsx', `
'use client';
import { useState } from 'react';
import { useForm } from 'react-form';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Login successful');
      router.push('/overview');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="glass-panel p-8">
        <h2 className="text-2xl font-heading font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 mb-8 text-sm">Sign in to access your HR workspace.</p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account? <Link href="/register" className="text-indigo-400 hover:text-indigo-300">Register</Link>
        </p>
      </div>
    </div>
  );
}
`);

// -----------------------------------------------------------------------------
// DASHBOARD SHELL
// -----------------------------------------------------------------------------
writeFile('app/(dashboard)/layout.tsx', `
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0F0F1A] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
`);

writeFile('components/layout/Sidebar.tsx', `
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Bot, ShieldCheck, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore(s => s.logout);
  const user = useAuthStore(s => s.user);

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [{ name: 'Dashboard', path: '/overview', icon: LayoutDashboard }],
    },
    {
      title: 'PEOPLE',
      items: [{ name: 'Employees', path: '/employees', icon: Users }],
    },
    {
      title: 'DOCUMENTS',
      items: [{ name: 'Documents', path: '/documents', icon: FileText }],
    },
    {
      title: 'AI TOOLS',
      items: [
        { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
        { name: 'Handbook', path: '/handbook', icon: FileText },
      ],
    },
    {
      title: 'COMPLIANCE',
      items: [{ name: 'Compliance Score', path: '/compliance', icon: ShieldCheck }],
    },
    {
      title: 'SETTINGS',
      items: [{ name: 'Settings', path: '/settings', icon: Settings }],
    },
  ];

  return (
    <div className="w-[280px] bg-[#16213E] border-r border-white/5 flex flex-col h-full shrink-0">
      <div className="p-6 h-16 flex items-center border-b border-white/5">
        <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          HRManager4U
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i}>
            <h3 className="px-3 text-xs font-semibold text-slate-500 mb-2 tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500" 
                        : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@company.com'}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
`);

writeFile('components/layout/Header.tsx', `
'use client';
import { Bell, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const title = pathname.split('/')[1]?.charAt(0).toUpperCase() + pathname.split('/')[1]?.slice(1) || 'Dashboard';

  return (
    <header className="h-16 px-6 lg:px-8 flex items-center justify-between border-b border-white/5 bg-[#16213E]/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-lg font-heading font-medium text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search employees, docs... (Cmd+K)" 
            className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 transition-all focus:w-72"
          />
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
`);

// -----------------------------------------------------------------------------
// DASHBOARD PAGES
// -----------------------------------------------------------------------------
writeFile('app/(dashboard)/overview/page.tsx', `
import { Users, FileText, ShieldCheck, Activity } from 'lucide-react';

export default function OverviewPage() {
  const stats = [
    { label: 'Total Employees', value: '142', icon: Users, trend: '+12% this month' },
    { label: 'Active Contracts', value: '138', icon: FileText, trend: '+4% this month' },
    { label: 'Compliance Score', value: '92%', icon: ShieldCheck, trend: 'Low Risk', color: 'text-emerald-400' },
    { label: 'Documents Gen', value: '1,240', icon: Activity, trend: '+18% this month' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-1">Good morning.</h1>
          <p className="text-slate-400 text-sm">Here is what's happening in your organization today.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Generate Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-5 glass-panel-hover">
            <div className="flex items-start justify-between mb-4">
              <div className={\`p-2.5 rounded-lg bg-white/5 \${stat.color || 'text-indigo-400'}\`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-heading font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-300">{stat.label}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-lg font-heading font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">Employment Contract Generated</p>
                  <p className="text-xs text-slate-400">For John Doe • Prepared by Admin</p>
                </div>
                <span className="text-xs text-slate-500">2h ago</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
          <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" />
          <h3 className="text-lg font-heading font-medium text-white mb-2">Audit Ready</h3>
          <p className="text-sm text-slate-400 mb-6">Your organization is fully compliant with the Employment Act 1955.</p>
          <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors">
            View Compliance Report →
          </button>
        </div>
      </div>
    </div>
  );
}
`);

writeFile('app/(dashboard)/ai-assistant/page.tsx', `
'use client';
import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AiAssistantPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'SYSTEM', content: 'Hi, I am your HR Legal Assistant. I can help answer questions based on the Employment Act 1955 and your Company Handbook.' }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'USER', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Mock response delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        content: 'Under Section 60A of the Employment Act 1955, an employee shall not be required under his contract of service to work more than 8 hours in one day or more than 45 hours in one week.',
        citations: [{ source: 'Employment Act 1955', clause: 'Section 60A(1)' }]
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-fade-in">
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
        {/* System Disclaimer */}
        <div className="bg-indigo-900/30 border-b border-indigo-500/20 p-3 text-xs text-indigo-200 text-center flex-shrink-0">
          Answers are grounded in legal acts and company policies. Verify with legal counsel for critical decisions.
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-4 max-w-[80%]", msg.role === 'USER' ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", 
                msg.role === 'USER' ? "bg-indigo-600 text-white" : 
                msg.role === 'SYSTEM' ? "bg-emerald-600 text-white" : "bg-[#16213E] border border-white/10 text-indigo-400"
              )}>
                {msg.role === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn("p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'USER' ? "bg-indigo-600 text-white rounded-tr-sm" : 
                msg.role === 'SYSTEM' ? "bg-white/5 border border-white/10 text-slate-300 rounded-tl-sm" : "bg-[#16213E] border border-white/10 text-slate-300 rounded-tl-sm"
              )}>
                {msg.content}
                {msg.citations && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs font-semibold text-slate-400 mb-2">SOURCES</p>
                    {msg.citations.map((c: any, j: number) => (
                      <div key={j} className="text-xs bg-black/20 p-2 rounded border border-white/5 inline-flex flex-col">
                        <span className="text-indigo-400">{c.source}</span>
                        <span className="text-slate-500">{c.clause}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-[#16213E] border border-white/10 text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-[#16213E] border border-white/10 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#16213E]/50 border-t border-white/10 flex-shrink-0">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question about HR laws or company policy..."
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
`);
