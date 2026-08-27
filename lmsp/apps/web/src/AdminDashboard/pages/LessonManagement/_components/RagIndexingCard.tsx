import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import type { RagJobStatus } from '@my-monorepo/store';

const RAG_SUCCESS_STATUSES = ['completed', 'success', 'done', 'finished'];
const RAG_FAILURE_STATUSES = ['failed', 'error', 'errored'];

export const isRagTerminal = (status?: string) => {
  if (!status) return false;
  const s = status.toLowerCase();
  return RAG_SUCCESS_STATUSES.includes(s) || RAG_FAILURE_STATUSES.includes(s);
};

// ─── RAG Indexing Progress Card ──────────────────────────────
export default function RagIndexingCard({
  jobId,
  status,
  onDismiss,
}: {
  jobId: string;
  status: RagJobStatus | null;
  onDismiss: () => void;
}) {
  const s = (status?.status || '').toLowerCase();
  const isDone = RAG_SUCCESS_STATUSES.includes(s);
  const isFailed = RAG_FAILURE_STATUSES.includes(s);
  const total = status?.total || 0;
  const progress = status?.progress || 0;
  const percent = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;

  const label = isDone
    ? 'Indexing Complete'
    : isFailed
      ? 'Indexing Failed'
      : s === 'processing'
        ? 'Processing Document'
        : s === 'queued'
          ? 'Queued — Waiting to Start'
          : 'Indexing Document';

  const subtext = isDone
    ? 'Document indexed into the RAG knowledge base. The AI assistant can now reference this content.'
    : isFailed
      ? status?.error || 'An error occurred during indexing. Please try uploading again.'
      : status?.message || 'Upload accepted. Indexing runs in the background…';

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        isFailed
          ? 'border-red-500/30 bg-red-500/10'
          : 'border-emerald-500/25 bg-emerald-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isFailed ? (
            <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          ) : isDone ? (
            <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          ) : (
            <Loader2 size={20} className="text-emerald-400 mt-0.5 flex-shrink-0 animate-spin" />
          )}
          <div>
            <p
              className={`text-sm font-extrabold ${isFailed ? 'text-red-300' : 'text-emerald-300'}`}
            >
              {label}
            </p>
            <p className="text-xs text-[#9BA8A0] mt-1 leading-relaxed max-w-md">{subtext}</p>
            <p className="text-[10px] font-mono text-[#5F6B64] mt-1.5">Job ID: {jobId}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[#9BA8A0] hover:text-[#E8F5EC] flex-shrink-0"
          aria-label="Dismiss job status"
        >
          <X size={16} />
        </button>
      </div>

      {!isFailed && total > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-[#9BA8A0]">
              {isDone ? 'Progress' : 'Indexing progress'}
            </span>
            <span className="font-bold text-emerald-300">
              {percent}%{' '}
              <span className="text-[#5F6B64] font-medium">
                ({progress}/{total})
              </span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#1A1A1A] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
