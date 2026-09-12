import { useState, useRef } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';

// ─── Draggable File Input ────────────────────────────────────
export default function FileDropzone({
  accept,
  label,
  selectedFile,
  onFileSelect,
  onClear,
}: {
  accept: string;
  label: string;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
          : selectedFile
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-[#2A2A2A] bg-[#0F0F0F]/50 hover:border-[#3A3A3A] hover:bg-[#121212]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
            <FileText size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-[#E8F5EC] text-sm">{selectedFile.name}</p>
            <p className="text-xs text-[#9BA8A0] mt-0.5">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
            <Upload size={26} className="text-[#7A8A80]" />
          </div>
          <div>
            <p className="font-bold text-[#C9DCCE] text-sm">
              Drop your {label} here or <span className="text-emerald-400">browse</span>
            </p>
            <p className="text-xs text-[#7A8A80] mt-0.5">Accepted format: {accept}</p>
          </div>
        </div>
      )}
    </div>
  );
}
