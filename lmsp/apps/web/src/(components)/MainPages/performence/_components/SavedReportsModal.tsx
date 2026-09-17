import { Award, Calendar, Database, History, TrendingUp, X } from 'lucide-react';
import DeltaBadge from './DeltaBadge';

interface ReportHistoryItem {
  generatedAt: string;
  score_percentage: number;
  exam?: string;
  correct_answers: number;
  total_questions: number;
  delta: number | null;
}

// ─── Saved Reports modal ───────────────────────────────────
export default function SavedReportsModal({
  open,
  onClose,
  reportHistory,
  bestScore,
  avgScore,
  latestScore,
  improving,
}: {
  open: boolean;
  onClose: () => void;
  reportHistory: ReportHistoryItem[];
  bestScore: number | null;
  avgScore: number | null;
  latestScore: number;
  improving: boolean;
}) {
  if (!open) return null;
  const reportCount = reportHistory.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#111318] border border-[#23262D] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#23262D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 flex items-center justify-center">
              <History size={18} className="text-[#2F80ED]" />
            </div>
            <div>
              <h3 className="font-bold text-[#F5F7FA]">Saved Reports</h3>
              <p className="text-[10px] text-[#A1A8B3]">
                Daily AI reports – track your improvement over time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#161920] transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {reportCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#161920] border border-[#23262D] flex items-center justify-center">
                <Database size={22} className="text-[#2F80ED]" />
              </div>
              <div>
                <p className="font-bold text-[#F5F7FA]">No saved reports yet</p>
                <p className="text-xs text-[#A1A8B3] mt-1">
                  Attempt quizzes and hit “Regenerate” to create your first daily AI report.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#161920] border border-[#23262D] rounded-xl p-3 text-center">
                  <div className="text-[10px] text-[#A1A8B3] mb-1 flex items-center justify-center gap-1">
                    <Calendar size={10} /> Reports
                  </div>
                  <div className="text-lg font-bold text-[#F5F7FA]">{reportCount}</div>
                </div>
                <div className="bg-[#161920] border border-[#23262D] rounded-xl p-3 text-center">
                  <div className="text-[10px] text-[#A1A8B3] mb-1 flex items-center justify-center gap-1">
                    <Award size={10} className="text-[#F2C94C]" /> Best
                  </div>
                  <div className="text-lg font-bold text-[#00E5B3]">{bestScore?.toFixed(1)}%</div>
                </div>
                <div className="bg-[#161920] border border-[#23262D] rounded-xl p-3 text-center">
                  <div className="text-[10px] text-[#A1A8B3] mb-1 flex items-center justify-center gap-1">
                    <TrendingUp size={10} className="text-[#2F80ED]" /> Avg
                  </div>
                  <div className="text-lg font-bold text-[#F5F7FA]">{avgScore?.toFixed(1)}%</div>
                </div>
              </div>

              {reportCount > 1 && (
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                    improving
                      ? 'bg-[#00E5B3]/10 border-[#00E5B3]/30 text-[#00E5B3]'
                      : 'bg-[#EB5757]/10 border-[#EB5757]/30 text-[#EB5757]'
                  }`}
                >
                  <TrendingUp size={14} />
                  {improving
                    ? `Your latest score (${latestScore?.toFixed(1)}%) is ${(latestScore - reportHistory[0].score_percentage).toFixed(1)} pts above your first report — keep it up!`
                    : `Your latest score (${latestScore?.toFixed(1)}%) hasn't topped your first report yet — review your weak areas and try again.`}
                </div>
              )}

              {/* Report list */}
              <div className="space-y-2">
                {reportHistory
                  .slice()
                  .reverse()
                  .map((h, idx) => (
                    <div
                      key={h.generatedAt}
                      className="flex items-center justify-between gap-3 bg-[#161920] border border-[#23262D] rounded-xl px-4 py-3 hover:border-[#323742] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 flex items-center justify-center text-[#2F80ED] text-xs font-bold flex-shrink-0">
                          {reportCount - idx}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#F5F7FA]">
                            {new Date(h.generatedAt).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[10px] text-[#A1A8B3] truncate">
                            {h.exam} • {h.correct_answers}/{h.total_questions} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-[#F5F7FA]">
                          {h.score_percentage.toFixed(1)}%
                        </div>
                        {h.delta !== null && (
                          <DeltaBadge delta={h.delta} suffix="%" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
