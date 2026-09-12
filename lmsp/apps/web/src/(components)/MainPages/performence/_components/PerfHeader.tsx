import { Calendar, ChevronDown, Database, RefreshCw, Target } from 'lucide-react';
import DeltaBadge from './DeltaBadge';

// ─── Performance page header ───────────────────────────────
export default function PerfHeader({
  examName,
  verdict,
  verdictColor,
  scoreDelta,
  isLoading,
  isRegenerating,
  subtitle,
  generatedAt,
  isCached,
  reportCount,
  onRegenerate,
  onOpenSavedReports,
}: {
  examName?: string;
  verdict?: string;
  verdictColor: string;
  scoreDelta: number | null;
  isLoading: boolean;
  isRegenerating: boolean;
  subtitle: string;
  generatedAt: string | null;
  isCached: boolean;
  reportCount: number;
  onRegenerate: () => void;
  onOpenSavedReports: () => void;
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111318] p-4 rounded-2xl border border-[#23262D]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED] flex items-center justify-center font-bold text-lg">
          AI
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-[#F5F7FA]">
              {examName || 'Performance Analytics'}
            </h1>
            {verdict && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border" style={{ color: verdictColor, background: `${verdictColor}14`, borderColor: `${verdictColor}40` }}>
                <Target size={10} className="inline mr-0.5" /> {verdict}
              </span>
            )}
            {scoreDelta !== null && scoreDelta !== 0 && (
              <DeltaBadge delta={scoreDelta} suffix="%" />
            )}
          </div>
          <p className="text-xs text-[#A1A8B3]">{subtitle}</p>
          {generatedAt && !isLoading && (
            <p className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-0.5">
              <Database size={10} /> Updated {new Date(generatedAt).toLocaleString()}
              {isCached && ' • cached for today'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={onRegenerate}
          disabled={isRegenerating || isLoading}
          title="Generate a fresh AI report for today (overrides the saved one)"
          className="flex items-center justify-center gap-1 text-xs bg-[#00E5B3] text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-[#00C298] transition w-full md:w-auto active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={isRegenerating || isLoading ? 'animate-spin' : ''} />
          {isRegenerating || isLoading ? 'Generating…' : 'Regenerate'}
        </button>
        <button
          onClick={onOpenSavedReports}
          className="flex items-center justify-center gap-1 text-xs border border-[#23262D] px-3 py-1.5 rounded-lg hover:bg-[#161920] text-[#A1A8B3] bg-[#111318] w-full md:w-auto transition active:scale-95"
        >
          <Calendar size={14} /> Saved reports
          {reportCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2F80ED]/15 text-[#2F80ED] font-bold">
              {reportCount}
            </span>
          )}
          <ChevronDown size={12} />
        </button>
      </div>
    </header>
  );
}
