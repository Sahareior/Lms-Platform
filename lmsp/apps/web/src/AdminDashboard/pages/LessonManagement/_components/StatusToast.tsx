import { AlertCircle, CheckCircle, X } from 'lucide-react';

// ─── Status Toast ────────────────────────────────────────────
export default function StatusToast({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-in slide-in-from-right ${
        type === 'success'
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
          : 'bg-red-950/90 border-red-500/30 text-red-300'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
