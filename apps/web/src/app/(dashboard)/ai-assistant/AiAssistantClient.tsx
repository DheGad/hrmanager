'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, ChevronDown, ChevronUp, Plus, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime } from '@/lib/utils';

interface Citation {
  document: string;
  clause?: string;
  page?: number;
  excerpt: string;
}

interface AiMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  confidence?: number;
  citations?: Citation[];
  sourcesUsed?: string[];
  createdAt: string;
}

interface Conversation {
  id: string;
  title?: string;
  createdAt: string;
}

const SUGGESTED_QUESTIONS = [
  'What is the minimum annual leave entitlement in Malaysia?',
  'How do I handle an employee on probation who is underperforming?',
  'What are the legal requirements for termination in Australia?',
  'How many days of medical leave is an employee entitled to?',
];

function confidenceBadge(score?: number) {
  if (score === undefined) return null;
  if (score >= 0.9) return <Badge variant="success">High Confidence</Badge>;
  if (score >= 0.75) return <Badge variant="warning">Medium Confidence</Badge>;
  return <Badge variant="danger">Low Confidence — Verify with legal counsel</Badge>;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-indigo-400" />
      </div>
      <div className="glass-panel px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((d) => (
            <motion.span
              key={d}
              className="w-2 h-2 rounded-full bg-indigo-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: d }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CitationBlock({ citations }: { citations: Citation[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        aria-expanded={open}
      >
        <BookOpen className="w-3.5 h-3.5" />
        {citations.length} citation{citations.length > 1 ? 's' : ''}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2 space-y-2"
          >
            {citations.map((c, i) => (
              <a 
                key={i} 
                href={`#citation-\${i}`} 
                className="block rounded-lg bg-white/3 border border-white/8 p-3 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Opening \${c.document} at page \${c.page || 1}`);
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-indigo-300">{c.document}</p>
                  {c.page && <span className="text-[10px] text-slate-400 bg-black/20 px-1.5 py-0.5 rounded">Page {c.page}</span>}
                </div>
                {c.clause && <p className="text-xs text-slate-400 mt-0.5">§ {c.clause}</p>}
                <p className="text-xs text-slate-500 italic mt-1.5 leading-relaxed">"{c.excerpt}"</p>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === 'USER';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-end gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-indigo-500 text-white' : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400'
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] space-y-2', isUser && 'items-end')}>
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'glass-panel text-slate-200 rounded-bl-sm'
        )}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
        </div>

        {!isUser && (
          <div className="px-1 space-y-2">
            {confidenceBadge(message.confidence)}
            {message.citations && message.citations.length > 0 && (
              <CitationBlock citations={message.citations} />
            )}
            {message.sourcesUsed && message.sourcesUsed.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {message.sourcesUsed.map((src, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-slate-400">
                    {src}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] text-slate-600 px-1">{formatRelativeTime(message.createdAt)}</p>
      </div>
    </motion.div>
  );
}

export function AiAssistantClient() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['ai-conversations'],
    queryFn: () => api.get('/ai/conversations'),
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);

    const userMsg: AiMessage = {
      id: crypto.randomUUID(),
      role: 'USER',
      content: question,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.post<{
        answer: string;
        confidence: number;
        citations: Citation[];
        sourcesUsed: string[];
        conversationId: string;
      }>('/ai/query', { question, conversationId });

      const assistantMsg: AiMessage = {
        id: crypto.randomUUID(),
        role: 'ASSISTANT',
        content: res.answer,
        confidence: res.confidence,
        citations: res.citations,
        sourcesUsed: res.sourcesUsed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!conversationId) setConversationId(res.conversationId);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.message;
      const errorContent = apiMessage
        ? `Something went wrong: ${apiMessage}`
        : 'Unable to reach the AI service. Please check that the API server is running.';
      const errMsg: AiMessage = {
        id: crypto.randomUUID(),
        role: 'ASSISTANT',
        content: errorContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startNew = () => {
    setConversationId(null);
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem-4rem)] gap-0 overflow-hidden rounded-2xl border border-white/8">
      {/* ── Left: Conversation List ── */}
      <aside className="w-56 flex-shrink-0 border-r border-white/8 bg-white/2 flex flex-col hidden lg:flex">
        <div className="p-3 border-b border-white/8">
          <button onClick={startNew} className="btn-primary w-full justify-center text-xs">
            <Plus className="w-3.5 h-3.5" />New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setConversationId(c.id)}
              aria-label={c.title ?? 'Conversation'}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors',
                c.id === conversationId ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
              )}
            >
              <p className="font-medium truncate">{c.title ?? 'Untitled'}</p>
              <p className="text-slate-600 mt-0.5">{formatRelativeTime(c.createdAt)}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Center: Chat ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">AI HR Assistant</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-sm">
                Ask me anything about HR law, employment policies, and workplace regulations in Malaysia and Australia.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left p-3.5 glass-panel glass-panel-hover text-sm text-slate-300 rounded-xl transition-all hover:-translate-y-0.5"
                    aria-label={q}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              {isLoading && <TypingIndicator />}
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/8 p-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about HR law, leave entitlements, termination procedures…"
              aria-label="AI chat message input"
              rows={1}
              disabled={isLoading}
              className="input-field flex-1 resize-none leading-relaxed min-h-[42px] disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 text-center">
            AI responses are for guidance only. Always consult a qualified HR professional for legal matters.
          </p>
        </div>
      </main>

      {/* ── Right: Context Panel ── */}
      <aside className="w-60 flex-shrink-0 border-l border-white/8 bg-white/2 flex flex-col hidden xl:flex">
        <div className="p-4 border-b border-white/8">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Reference</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Key Legislation</p>
            {[
              { label: 'Employment Act 1955', sub: 'Malaysia — Federal' },
              { label: 'Industrial Relations Act 1967', sub: 'Malaysia' },
              { label: 'Fair Work Act 2009', sub: 'Australia — Federal' },
              { label: 'Work Health & Safety Act 2011', sub: 'Australia' },
            ].map((doc) => (
              <div key={doc.label} className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-300">{doc.label}</p>
                  <p className="text-[11px] text-slate-600">{doc.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />Disclaimer
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              This AI provides general HR guidance based on legislated employment standards. It does not constitute legal advice. Consult a qualified employment lawyer for specific situations.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
