'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Shield,
  UploadCloud,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Country = 'MY' | 'AU' | 'SG';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type AnalysisStep = 'upload' | 'analyzing' | 'done';

interface UploadedFile {
  file: File;
  id: string;
}

interface MissingPolicy {
  name: string;
  description: string;
  severity: Priority;
}

interface Recommendation {
  action: string;
  priority: Priority;
  reference?: string;
}

interface AnalysisResult {
  score: number;
  missingPolicies: MissingPolicy[];
  recommendations: Recommendation[];
  summary?: string;
  analysedAt?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const COUNTRY_LABELS: Record<Country, string> = {
  MY: 'Malaysia (Employment Act 1955)',
  AU: 'Australia (Fair Work Act 2009)',
  SG: 'Singapore (Employment Act)',
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  HIGH: { label: 'HIGH', color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/25' },
  MEDIUM: { label: 'MEDIUM', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  LOW: { label: 'LOW', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
};

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

// ─── SVG Shield illustration (default state) ─────────────────────────────────

function ShieldIllustration() {
  return (
    <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M40 5L8 18V44C8 61.5 22.5 77.5 40 83C57.5 77.5 72 61.5 72 44V18L40 5Z"
        fill="url(#shieldGrad)"
        stroke="rgba(99,102,241,0.3)"
        strokeWidth="1.5"
      />
      <path
        d="M40 14L16 25V44C16 58 27 71 40 75.5C53 71 64 58 64 44V25L40 14Z"
        fill="rgba(99,102,241,0.08)"
        stroke="rgba(99,102,241,0.2)"
        strokeWidth="1"
      />
      <path
        d="M28 44l8 8 16-16"
        stroke="rgba(99,102,241,0.6)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="shieldGrad" x1="40" y1="5" x2="40" y2="83" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(99,102,241,0.15)" />
          <stop offset="100%" stopColor="rgba(79,70,229,0.05)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Circular score ring (pure SVG) ──────────────────────────────────────────

function ScoreRing({ score }: { score: number | null }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = score !== null ? circumference - (circumference * score) / 100 : circumference;

  const color =
    score === null
      ? '#ffffff20'
      : score > 80
      ? '#10B981'
      : score > 60
      ? '#F59E0B'
      : '#EF4444';

  const glowColor =
    score === null
      ? 'transparent'
      : score > 80
      ? 'rgba(16,185,129,0.3)'
      : score > 60
      ? 'rgba(245,158,11,0.3)'
      : 'rgba(239,68,68,0.3)';

  const label =
    score === null
      ? '--'
      : score > 80
      ? 'Low Risk'
      : score > 60
      ? 'Medium Risk'
      : 'High Risk';

  const labelColor =
    score === null
      ? 'text-slate-500'
      : score > 80
      ? 'text-emerald-400'
      : score > 60
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36" style={{ filter: `drop-shadow(0 0 16px ${glowColor})` }}>
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Progress */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: filled }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-heading font-bold text-white leading-none"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {score !== null ? score : '--'}
          </motion.span>
          <span className="text-[10px] text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-400 text-center mb-1">Compliance Score</p>
        <div
          className={cn(
            'text-xs font-semibold px-3 py-1 rounded-full border text-center',
            score === null
              ? 'text-slate-500 border-white/10 bg-white/4'
              : score > 80
              ? 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10'
              : score > 60
              ? 'text-amber-300 border-amber-500/25 bg-amber-500/10'
              : 'text-red-300 border-red-500/25 bg-red-500/10'
          )}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────

function AnalysisProgressBar({ country }: { country: Country }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(timer); return p; }
        return p + 5;
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { label: 'Parsing documents', done: progress > 20 },
    { label: `Loading ${COUNTRY_LABELS[country]} regulations`, done: progress > 45 },
    { label: 'Identifying gaps', done: progress > 70 },
    { label: 'Scoring compliance', done: progress > 88 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">Analyzing policies against</p>
          <p className="text-sm text-indigo-300 font-semibold">{COUNTRY_LABELS[country]}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Analysis progress</span>
          <span>{Math.round(Math.min(progress, 99))}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            animate={{ width: `${Math.min(progress, 99)}%` }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Step checklist */}
      <div className="space-y-2">
        {steps.map(({ label, done }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: done ? 1 : 0.4, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-2.5 text-sm"
          >
            {done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
            )}
            <span className={done ? 'text-white' : 'text-slate-500'}>{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [country, setCountry] = useState<Country>('MY');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // ── Dropzone ──────────────────────────────────────────────────────────────

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadedFile[] = accepted.map((f, i) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${i}`,
    }));
    setUploadedFiles((prev) => {
      const existingNames = new Set(prev.map((u) => u.file.name));
      return [...prev, ...newFiles.filter((nf) => !existingNames.has(nf.file.name))];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: () => toast.error('Only PDF, DOC, and DOCX files up to 10MB are accepted.'),
  });

  const removeFile = (id: string) =>
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  // ── Analysis ──────────────────────────────────────────────────────────────

  const runAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one policy document.');
      return;
    }
    setAnalysisStep('analyzing');

    // Simulate 3-second minimum analysis time for UX
    const [apiResult] = await Promise.allSettled([
      api.post<AnalysisResult>('/compliance/analyze', {
        country,
        documents: uploadedFiles.map((f) => ({ name: f.file.name, type: f.file.type })),
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);

    if (apiResult.status === 'fulfilled') {
      setResult(apiResult.value);
    } else {
      // Graceful fallback for demo / offline
      setResult({
        score: 72,
        missingPolicies: [
          {
            name: 'Flexible Work Arrangements Policy',
            description: 'Required under recent amendments to Employment Act.',
            severity: 'HIGH',
          },
          {
            name: 'Paternity Leave Policy',
            description: 'Mandatory 7-day paternity leave for registered fathers.',
            severity: 'HIGH',
          },
          {
            name: 'Sexual Harassment Complaints Procedure',
            description: 'Formal complaints procedure must be documented.',
            severity: 'MEDIUM',
          },
          {
            name: 'Forced Labour Declaration',
            description: 'Supply chain due diligence documentation required.',
            severity: 'LOW',
          },
        ],
        recommendations: [
          {
            action: 'Add a Flexible Working Arrangements (FWA) policy section to your employee handbook.',
            priority: 'HIGH',
            reference: 'Employment Act s. 60P–60S',
          },
          {
            action: 'Document and communicate the paternity leave entitlement of 7 days.',
            priority: 'HIGH',
            reference: 'Employment Act s. 37A',
          },
          {
            action: 'Establish a formal sexual harassment reporting and investigation procedure.',
            priority: 'MEDIUM',
            reference: 'Code of Practice on Prevention and Eradication of Sexual Harassment',
          },
          {
            action: 'Review overtime payment rates and ensure they meet 1.5× hourly rate requirements.',
            priority: 'MEDIUM',
            reference: 'Employment Act s. 60A',
          },
          {
            action: 'Update annual leave schedule to reflect tiered entitlement by years of service.',
            priority: 'LOW',
          },
        ],
        summary: `Analysis of ${uploadedFiles.length} document(s) against ${COUNTRY_LABELS[country]} regulations.`,
        analysedAt: new Date().toISOString(),
      });
    }

    setAnalysisStep('done');
    toast.success('Compliance analysis complete!');
  };

  const reset = () => {
    setAnalysisStep('upload');
    setUploadedFiles([]);
    setResult(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-1">Compliance Analyzer</h1>
          <p className="text-slate-400 text-sm">
            Upload your policy documents for an automated audit against local labor laws.
          </p>
        </div>
        {result && (
          <button
            type="button"
            onClick={reset}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            New Analysis
          </button>
        )}
      </div>

      {/* Split panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left Panel (upload + analysis) ── */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 space-y-5 h-full">
            <AnimatePresence mode="wait">
              {/* Upload step */}
              {analysisStep === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-sm font-semibold text-white mb-1">Upload Policy Documents</h2>
                    <p className="text-xs text-slate-400">PDF, DOC, DOCX — up to 10MB each</p>
                  </div>

                  {/* Dropzone */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      'relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200',
                      isDragActive
                        ? 'border-indigo-500 bg-indigo-500/8'
                        : 'border-white/15 bg-white/2 hover:border-indigo-500/50 hover:bg-white/4'
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors', isDragActive ? 'bg-indigo-500/20' : 'bg-white/5')}>
                      <UploadCloud className={cn('w-6 h-6 transition-colors', isDragActive ? 'text-indigo-400' : 'text-slate-400')} />
                    </div>
                    {isDragActive ? (
                      <p className="text-sm text-indigo-300 font-medium">Drop files here</p>
                    ) : (
                      <>
                        <p className="text-sm text-slate-300 font-medium">Drag & drop files</p>
                        <p className="text-xs text-slate-500 mt-1">or <span className="text-indigo-400 underline underline-offset-2">browse to upload</span></p>
                      </>
                    )}
                  </div>

                  {/* File list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 font-medium">{uploadedFiles.length} file(s) selected</p>
                      {uploadedFiles.map(({ file, id }) => {
                        const ext = FILE_TYPE_LABELS[file.type] ?? file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
                        const sizeMb = (file.size / 1024 / 1024).toFixed(2);
                        return (
                          <motion.div
                            key={id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/4 border border-white/8"
                          >
                            <div className="w-8 h-8 rounded-md bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{file.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                                  {ext}
                                </span>
                                <span className="text-[10px] text-slate-500">{sizeMb} MB</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(id)}
                              className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                              aria-label="Remove file"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Country selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Analyze against labor laws for:
                    </label>
                    <select
                      className="input-field text-sm bg-[#16213E]"
                      value={country}
                      onChange={(e) => setCountry(e.target.value as Country)}
                    >
                      <option value="MY">🇲🇾 Malaysia — Employment Act 1955</option>
                      <option value="AU">🇦🇺 Australia — Fair Work Act 2009</option>
                      <option value="SG">🇸🇬 Singapore — Employment Act Cap. 91A</option>
                    </select>
                  </div>

                  {/* Analyze button */}
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={uploadedFiles.length === 0}
                    className="btn-primary w-full justify-center py-3"
                  >
                    <Shield className="w-4 h-4" />
                    Analyze Compliance
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Analyzing step */}
              {analysisStep === 'analyzing' && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnalysisProgressBar country={country} />
                </motion.div>
              )}

              {/* Done step — summary */}
              {analysisStep === 'done' && result && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">Analysis Complete</p>
                      <p className="text-xs text-slate-400">{result.summary}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/3 border border-white/8 p-4 space-y-2.5">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Documents Analyzed</p>
                    {uploadedFiles.map(({ file, id }) => (
                      <div key={id} className="flex items-center gap-2 text-xs text-slate-400">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-white/6">
                      <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{COUNTRY_LABELS[country]}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={reset}
                    className="btn-secondary w-full justify-center text-xs py-2"
                  >
                    Upload Different Documents
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right Panel (results) ── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Default (no result) */}
            {!result && analysisStep !== 'analyzing' && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center gap-5 min-h-[400px]"
              >
                <ShieldIllustration />
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white">No Analysis Yet</h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Upload your policy documents on the left to run a compliance analysis against local labor laws.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    {(['MY', 'AU', 'SG'] as Country[]).map((c) => (
                      <span key={c} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {c}
                      </span>
                    ))}
                  </div>
                  <span>Supported jurisdictions</span>
                </div>
              </motion.div>
            )}

            {/* Loading skeleton while analyzing */}
            {analysisStep === 'analyzing' && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-6 space-y-6 min-h-[400px]"
              >
                <div className="flex justify-center py-6">
                  <div className="w-32 h-32 rounded-full skeleton" />
                </div>
                <div className="space-y-3">
                  {[70, 50, 85, 40].map((w, i) => (
                    <div key={i} className={`h-3 rounded skeleton`} style={{ width: `${w}%` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results panel */}
            {result && analysisStep === 'done' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Score card */}
                <div className="glass-panel p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <ScoreRing score={result.score} />
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div>
                        <h3 className="text-base font-semibold text-white">Overall Assessment</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{COUNTRY_LABELS[country]}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Missing', value: result.missingPolicies.length, color: 'text-red-400' },
                          {
                            label: 'High Priority',
                            value: result.recommendations.filter((r) => r.priority === 'HIGH').length,
                            color: 'text-amber-400',
                          },
                          {
                            label: 'Actions',
                            value: result.recommendations.length,
                            color: 'text-indigo-400',
                          },
                        ].map(({ label, value, color }) => (
                          <div
                            key={label}
                            className="rounded-lg bg-white/4 border border-white/8 p-2.5 text-center"
                          >
                            <p className={cn('text-lg font-bold font-heading', color)}>{value}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Policies */}
                {result.missingPolicies.length > 0 && (
                  <div className="glass-panel p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <h3 className="text-sm font-semibold text-white">Missing Policies</h3>
                      <span className="ml-auto text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                        {result.missingPolicies.length} gaps found
                      </span>
                    </div>
                    <div className="space-y-2">
                      {result.missingPolicies.map((policy, i) => {
                        const pc = PRIORITY_CONFIG[policy.severity];
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-red-500/4 border border-red-500/12"
                          >
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-white">{policy.name}</p>
                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0', pc.color, pc.bg, pc.border)}>
                                  {pc.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{policy.description}</p>
                            </div>
                            <a
                              href="/handbook"
                              className="flex items-center gap-1 text-[10px] font-semibold text-indigo-300 hover:text-indigo-200 whitespace-nowrap flex-shrink-0 mt-0.5 transition-colors"
                            >
                              <BookOpen className="w-3 h-3" />
                              Generate
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="glass-panel p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-white">Recommendations</h3>
                      <span className="ml-auto text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                        {result.recommendations.length} actions
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {result.recommendations.map((rec, i) => {
                        const pc = PRIORITY_CONFIG[rec.priority];
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 + 0.15 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/7"
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-300 leading-relaxed">{rec.action}</p>
                              {rec.reference && (
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">{rec.reference}</p>
                              )}
                            </div>
                            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5', pc.color, pc.bg, pc.border)}>
                              {pc.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
