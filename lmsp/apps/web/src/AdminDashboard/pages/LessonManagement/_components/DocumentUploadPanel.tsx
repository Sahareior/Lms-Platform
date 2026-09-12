import { Loader2, Sparkles, Upload } from 'lucide-react';
import type { RagJobStatus } from '@my-monorepo/store';
import FileDropzone from './FileDropzone';
import RagIndexingCard from './RagIndexingCard';
import SectionCard from './SectionCard';

interface DocumentUploadPanelProps {
  docFile: File | null;
  isUploading: boolean;
  ragJobId: string | null;
  ragDisplay: RagJobStatus | null;
  ragJobActive: boolean;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onUpload: () => void;
  onDismissJob: () => void;
}

// ─── Document Upload tab ────────────────────────────────────
export default function DocumentUploadPanel({
  docFile,
  isUploading,
  ragJobId,
  ragDisplay,
  ragJobActive,
  onFileSelect,
  onClearFile,
  onUpload,
  onDismissJob,
}: DocumentUploadPanelProps) {
  return (
    <SectionCard
      icon={<Upload size={18} className="text-white" />}
      title="Document Upload"
      subtitle="Upload PDF, DOC, or TXT files for RAG-based knowledge ingestion"
      accentColor="emerald"
    >
      <div className="space-y-5">
        <FileDropzone
          accept=".pdf,.doc,.docx,.txt,.md"
          label="document"
          selectedFile={docFile}
          onFileSelect={onFileSelect}
          onClear={onClearFile}
        />

        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
          <Sparkles size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-300">
              RAG Knowledge Base
            </p>
            <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
              Uploaded documents will be processed, chunked, and indexed into the vector
              database. The AI assistant can then reference this content when answering
              student queries.
            </p>
          </div>
        </div>

        {/* RAG indexing job status (polled every 3s) */}
        {ragJobId && (
          <RagIndexingCard
            jobId={ragJobId}
            status={ragDisplay}
            onDismiss={onDismissJob}
          />
        )}

        <button
          onClick={onUpload}
          disabled={isUploading || !docFile || ragJobActive}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#04150B] py-3 rounded-xl font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-emerald-950/60 hover:shadow-md hover:shadow-emerald-950/70 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : ragJobActive ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Indexing in Progress...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload to RAG
            </>
          )}
        </button>
      </div>
    </SectionCard>
  );
}
