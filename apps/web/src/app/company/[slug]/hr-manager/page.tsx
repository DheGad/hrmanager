import { AiAssistantClient } from '@/app/(dashboard)/ai-assistant/AiAssistantClient';

export default function CompanyAiPortalPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-slate-200">
      <header className="px-6 py-4 border-b border-white/8 bg-white/2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {params.slug.toUpperCase()} HR Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">AI-Powered Employee Support</p>
        </div>
      </header>
      <main className="p-6 max-w-6xl mx-auto h-[calc(100vh-80px)]">
        <AiAssistantClient />
      </main>
    </div>
  );
}
