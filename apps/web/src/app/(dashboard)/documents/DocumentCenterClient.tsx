'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Upload, FileText, Download, Eye, ArchiveIcon,
  AlertTriangle, X, CheckCircle, FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface Document {
  id: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'ACKNOWLEDGED' | 'ARCHIVED';
  employeeId?: string;
  employee?: { firstName: string; lastName: string };
  generatedAt?: string;
  expiresAt?: string;
  pdfUrl?: string;
  fileSize?: number;
  description?: string;
}

const typeIcons: Record<string, string> = {
  EMPLOYMENT_CONTRACT: '📄', OFFER_LETTER: '✉️', WARNING_LETTER: '⚠️',
  TERMINATION_LETTER: '🚫', EMPLOYEE_HANDBOOK: '📚', CUSTOM: '📝', DEFAULT: '📋',
};

const statusVariant: Record<string, 'slate' | 'info' | 'success' | 'warning' | 'purple'> = {
  DRAFT: 'slate', GENERATED: 'info', SENT: 'warning', ACKNOWLEDGED: 'success', ARCHIVED: 'purple',
};

function expiryColor(expiresAt?: string) {
  if (!expiresAt) return 'text-slate-500';
  const days = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24);
  if (days < 7) return 'text-rose-400';
  if (days < 30) return 'text-amber-400';
  return 'text-emerald-400';
}

function UploadDropzone({ onUpload }: { onUpload: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'] },
    maxSize: 20 * 1024 * 1024,
    onDrop: onUpload,
  });

  return (
    <div
      {...getRootProps()}
      aria-label="Upload document dropzone"
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
        isDragActive ? 'border-indigo-500 bg-indigo-500/8' : 'border-white/15 hover:border-white/30 hover:bg-white/3'
      )}
    >
      <input {...getInputProps()} />
      <Upload className={cn('w-8 h-8 mx-auto mb-3', isDragActive ? 'text-indigo-400' : 'text-slate-500')} />
      <p className="text-sm text-slate-300 font-medium">
        {isDragActive ? 'Drop files here…' : 'Drag & drop or click to upload'}
      </p>
      <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX — max 20MB</p>
    </div>
  );
}

function DocumentCard({ doc, onPreview, onDownload, onArchive }: {
  doc: Document;
  onPreview: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onArchive: (id: string) => void;
}) {
  const icon = typeIcons[doc.type] ?? typeIcons.DEFAULT;
  const color = expiryColor(doc.expiresAt);

  return (
    <div className="glass-panel glass-panel-hover p-4 flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
            {icon}
          </div>
          <Badge variant={statusVariant[doc.status] ?? 'slate'} size="sm">{doc.status}</Badge>
        </div>
        <h3 className="text-sm font-semibold text-white leading-tight mb-1">{doc.title}</h3>
        {doc.description && <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>}
        {doc.employee && (
          <p className="text-xs text-slate-400 mt-2">
            👤 {doc.employee.firstName} {doc.employee.lastName}
          </p>
        )}
        {doc.generatedAt && (
          <p className="text-xs text-slate-600 mt-1">Generated {formatDate(doc.generatedAt)}</p>
        )}
        {doc.expiresAt && (
          <p className={cn('text-xs mt-1 font-medium', color)}>
            Expires {formatDate(doc.expiresAt)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-1 border-t border-white/6">
        <button
          onClick={() => onPreview(doc)}
          aria-label={`Preview ${doc.title}`}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />Preview
        </button>
        {doc.pdfUrl && (
          <button
            onClick={() => onDownload(doc)}
            aria-label={`Download ${doc.title}`}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />Download
          </button>
        )}
        <button
          onClick={() => onArchive(doc.id)}
          aria-label={`Archive ${doc.title}`}
          className="flex items-center justify-center p-1.5 text-xs text-slate-600 hover:text-amber-400 hover:bg-amber-500/8 rounded-lg transition-colors"
        >
          <ArchiveIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function DocumentCenterClient() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', search, statusFilter, typeFilter],
    queryFn: () => api.get('/documents', { search: search || undefined, status: statusFilter || undefined, type: typeFilter || undefined }),
  });

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => api.postForm('/documents/upload', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
      setUploadOpen(false);
      setUploadFiles([]);
      setUploadTitle('');
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/documents/${id}`, { status: 'ARCHIVED' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); toast.success('Document archived'); },
  });

  const handleUploadSubmit = () => {
    if (!uploadFiles.length || !uploadTitle.trim()) return;
    const fd = new FormData();
    fd.append('file', uploadFiles[0]);
    fd.append('title', uploadTitle);
    uploadMutation.mutate(fd);
  };

  const handleDownload = (doc: Document) => {
    if (doc.pdfUrl) window.open(doc.pdfUrl, '_blank');
  };

  const expiring = documents.filter((d) => {
    if (!d.expiresAt) return false;
    const days = (new Date(d.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24);
    return days <= 30;
  });

  const filtered = documents.filter((d) =>
    (!search || d.title.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || d.status === statusFilter) &&
    (!typeFilter || d.type === typeFilter)
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            aria-label="Search documents"
            className="input-field pl-9 w-full"
          />
        </div>
        <select className="input-field text-sm" aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['DRAFT', 'GENERATED', 'SENT', 'ACKNOWLEDGED', 'ARCHIVED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="input-field text-sm" aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {['EMPLOYMENT_CONTRACT', 'OFFER_LETTER', 'WARNING_LETTER', 'TERMINATION_LETTER', 'EMPLOYEE_HANDBOOK', 'CUSTOM'].map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button onClick={() => setUploadOpen(true)} className="btn-primary flex-shrink-0" aria-label="Upload document">
          <Upload className="w-4 h-4" />Upload
        </button>
      </div>

      {/* Expiry Banner */}
      {!bannerDismissed && expiring.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">{expiring.length} document{expiring.length > 1 ? 's' : ''} expiring within 30 days</p>
            <p className="text-xs text-amber-500 mt-0.5">Review and renew these documents to maintain compliance.</p>
          </div>
          <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss expiry alert">
            <X className="w-4 h-4 text-amber-500 hover:text-amber-300" />
          </button>
        </div>
      )}

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-panel p-4 space-y-3">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents found" description="Upload or generate HR documents to see them here." action={<button onClick={() => setUploadOpen(true)} className="btn-primary text-sm">Upload Document</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <DocumentCard doc={doc} onPreview={setPreviewDoc} onDownload={handleDownload} onArchive={(id) => archiveMutation.mutate(id)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        description="Supported formats: PDF, DOC, DOCX — maximum 20MB"
        footer={
          <>
            <button onClick={() => setUploadOpen(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleUploadSubmit}
              disabled={!uploadFiles.length || !uploadTitle.trim() || uploadMutation.isPending}
              className="btn-primary disabled:opacity-40"
            >
              {uploadMutation.isPending ? 'Uploading…' : 'Upload Document'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="doc-title" className="block text-sm font-medium text-slate-300 mb-1.5">Document Title *</label>
            <input
              id="doc-title"
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., Employment Contract — John Doe"
              className="input-field w-full"
            />
          </div>
          <UploadDropzone onUpload={setUploadFiles} />
          {uploadFiles.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">{uploadFiles[0].name} ({(uploadFiles[0].size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Preview Drawer */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewDoc(null)} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="w-full max-w-2xl bg-[#0e1428] border-l border-white/10 flex flex-col h-full"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="font-bold text-white">{previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} aria-label="Close preview" className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-5">
              {previewDoc.pdfUrl ? (
                <iframe src={previewDoc.pdfUrl} className="w-full h-full rounded-lg border border-white/10" title={`Preview of ${previewDoc.title}`} />
              ) : (
                <EmptyState icon={FileText} title="No preview available" description="Download the document to view its contents." />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
