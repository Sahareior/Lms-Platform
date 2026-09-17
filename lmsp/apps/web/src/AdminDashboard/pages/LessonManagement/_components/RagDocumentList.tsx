import React, { useState, useMemo } from 'react';
import {
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Database,
  Layers,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  useGetRagDocumentsQuery,
  useDeleteRagDocumentMutation,
  getDocumentFileUrl,
  type RagDocument,
} from '@my-monorepo/store';

interface RagDocumentListProps {
  onShowToast: (type: 'success' | 'error', message: string) => void;
  // Optional callback when indexing finishes to trigger reload
  refreshTrigger?: number;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function RagDocumentList({ onShowToast }: RagDocumentListProps) {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useGetRagDocumentsQuery();

  const [deleteRagDocument, { isLoading: isDeleting }] = useDeleteRagDocumentMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [docToDelete, setDocToDelete] = useState<RagDocument | null>(null);

  const documents = useMemo(() => data?.documents || [], [data]);

  // Filtered by search
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter((d) => d.filename.toLowerCase().includes(term));
  }, [documents, searchTerm]);

  // Aggregate stats
  const totalChunks = useMemo(
    () => documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0),
    [documents]
  );
  const totalSize = useMemo(
    () => documents.reduce((acc, d) => acc + (d.file_size || 0), 0),
    [documents]
  );

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      const res = await deleteRagDocument(docToDelete.id).unwrap();
      onShowToast(
        'success',
        res.message || `Deleted "${docToDelete.filename}" and cleaned vector embeddings.`
      );
      setDocToDelete(null);
    } catch (err: any) {
      const msg = err?.data?.detail || err?.message || 'Failed to delete document.';
      onShowToast('error', msg);
    }
  };

  const handleOpenDoc = (doc: RagDocument) => {
    const fileUrl = getDocumentFileUrl(doc.id);
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* ────── STATS BAR ────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0B150F] border border-emerald-500/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <Database size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#8FA896]">Total Documents</div>
            <div className="text-lg font-black text-[#E8F5EC]">{documents.length}</div>
          </div>
        </div>

        <div className="bg-[#0B150F] border border-emerald-500/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#8FA896]">Indexed Chunks</div>
            <div className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
              {totalChunks}
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                In Qdrant
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0B150F] border border-emerald-500/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <HardDrive size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#8FA896]">Storage Footprint</div>
            <div className="text-lg font-black text-[#E8F5EC]">{formatBytes(totalSize)}</div>
          </div>
        </div>
      </div>

      {/* ────── TOOLBAR: SEARCH & REFRESH ────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8A80]"
          />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0F1A12] border border-[#1F2B22] rounded-xl text-xs text-[#E8F5EC] placeholder-[#5A6B60] focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A80] hover:text-[#E8F5EC]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0F1A12] border border-[#1F2B22] hover:border-emerald-500/30 rounded-xl text-xs font-semibold text-[#9BA8A0] hover:text-[#E8F5EC] transition-colors disabled:opacity-50"
            title="Refresh documents list"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ────── DOCUMENT LIST / TABLE ────── */}
      <div className="bg-[#0A100C] border border-[#1F2B22] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#7A8A80]">
            <Loader2 size={24} className="animate-spin text-emerald-400" />
            <p className="text-xs">Loading uploaded documents...</p>
          </div>
        ) : isError ? (
          <div className="py-10 px-4 text-center">
            <AlertTriangle size={24} className="text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-amber-300 font-semibold">Failed to load documents</p>
            <p className="text-[11px] text-[#7A8A80] mt-1">
              Ensure the AI backend service is running on port 8000.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-600/30 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <FileText size={22} />
            </div>
            {searchTerm ? (
              <>
                <p className="text-xs font-bold text-[#E8F5EC]">No documents match "{searchTerm}"</p>
                <p className="text-[11px] text-[#7A8A80] mt-0.5">Try a different search term</p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-[#E8F5EC]">No documents in Knowledge Base yet</p>
                <p className="text-[11px] text-[#7A8A80] mt-0.5 max-w-sm mx-auto">
                  Upload PDF documents using the dropzone above to index them into the RAG vector
                  database.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#17221A]">
            {filteredDocuments.map((doc) => {
              const isIndexed = doc.status === 'indexed' || (doc.chunk_count && doc.chunk_count > 0);

              return (
                <div
                  key={doc.id}
                  className="p-3.5 sm:p-4 hover:bg-[#0E1711] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Icon & File Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0 text-rose-400 mt-0.5">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs sm:text-sm font-bold text-[#E8F5EC] truncate max-w-xs sm:max-w-md group-hover:text-emerald-300 transition-colors"
                          title={doc.filename}
                        >
                          {doc.filename}
                        </span>

                        {/* Status Badge */}
                        {isIndexed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Indexed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                            <Clock size={10} />
                            Uploaded
                          </span>
                        )}

                        {/* Chunks Badge */}
                        {doc.chunk_count !== undefined && doc.chunk_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#16251B] border border-[#233829] text-[#A2B5A8]">
                            <Sparkles size={9} className="text-emerald-400" />
                            {doc.chunk_count} {doc.chunk_count === 1 ? 'chunk' : 'chunks'}
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-[11px] text-[#7A8A80] mt-1">
                        <span>{formatBytes(doc.file_size)}</span>
                        <span>&bull;</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      onClick={() => handleOpenDoc(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#142018] hover:bg-[#1A2C20] border border-emerald-500/20 text-[#C1D2C7] hover:text-[#E8F5EC] text-xs font-semibold transition-colors"
                      title="View PDF document"
                    >
                      <ExternalLink size={13} className="text-emerald-400" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors"
                      title="Delete document and remove embeddings"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ────── CONFIRMATION MODAL ────── */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0B150F] border border-emerald-500/30 rounded-2xl p-5 md:p-6 max-w-md w-full shadow-2xl shadow-black/80 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0 text-rose-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#E8F5EC]">Delete RAG Document?</h4>
                <p className="text-xs text-[#8FA896] mt-0.5">
                  Are you sure you want to remove this document from the knowledge base?
                </p>
              </div>
            </div>

            <div className="bg-[#070D09] border border-[#1E2D22] rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6B7E72]">Filename:</span>
                <span className="font-semibold text-[#E8F5EC] truncate max-w-[200px]" title={docToDelete.filename}>
                  {docToDelete.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7E72]">Indexed Chunks:</span>
                <span className="font-semibold text-emerald-400">{docToDelete.chunk_count || 0} chunks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7E72]">File Size:</span>
                <span className="font-semibold text-[#E8F5EC]">{formatBytes(docToDelete.file_size)}</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
              ⚠️ This will delete the file and permanently purge all corresponding vector embeddings
              from Qdrant so the AI assistant will no longer reference it.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#9BA8A0] hover:text-[#E8F5EC] hover:bg-[#142018] border border-[#1F2B22] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
