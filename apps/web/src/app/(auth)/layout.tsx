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
