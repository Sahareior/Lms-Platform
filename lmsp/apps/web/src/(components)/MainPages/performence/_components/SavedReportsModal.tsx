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
  isDark,
}: {
  open: boolean;
  onClose: () => void;
  reportHistory: ReportHistoryItem[];
  bestScore: number | null;
  avgScore: number | null;
  latestScore: number;
  improving: boolean;
  isDark: boolean;
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
        className={`relative w-full max-w-2xl max-h-[85vh] border rounded-2xl shadow-2xl flex flex-col overflow-hidden ${isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]'}`}
      >
        {/* Modal header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-[#23262D]' : 'border-[#d8d4cb]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${isDark ? 'bg-[#2F80ED]/10 border-[#2F80ED]/30' : 'bg-[#1a1a1a]/5 border-[#1a1a1a]/10'} border flex items-center justify-center`}>
              <History size={18} className={isDark ? 'text-[#2F80ED]' : 'text-[#1a1a1a]'} />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif'}`}>Saved Reports</h3>
              <p className={`text-[10px] ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
                Daily AI reports – track your improvement over time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${isDark ? 'text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#161920]' : 'text-[#4a4a4a] hover:text-[#1a1a1a] hover:bg-[#e8e4db]'}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {reportCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className={`w-14 h-14 rounded-full ${isDark ? 'bg-[#161920] border-[#23262D]' : 'bg-[#e8e4db] border-[#d8d4cb]'} border flex items-center justify-center`}>
                <Database size={22} className={isDark ? 'text-[#2F80ED]' : 'text-[#1a1a1a]'} />
              </div>
              <div>
                <p className={`font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif'}`}>No saved reports yet</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
                  Attempt quizzes and hit “Regenerate” to create your first daily AI report.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`border rounded-xl p-3 text-center ${isDark ? 'bg-[#161920] border-[#23262D]' : 'bg-[#e8e4db] border-[#d8d4cb]'}`}>
                  <div className={`text-[10px] mb-1 flex items-center justify-center gap-1 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a]'}`}>
                    <Calendar size={10} /> Reports
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`}>{reportCount}</div>
                </div>
                <div className={`border rounded-xl p-3 text-center ${isDark ? 'bg-[#161920] border-[#23262D]' : 'bg-[#e8e4db] border-[#d8d4cb]'}`}>
                  <div className={`text-[10px] mb-1 flex items-center justify-center gap-1 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a]'}`}>
                    <Award size={10} className={isDark ? 'text-[#F2C94C]' : 'text-[#b91c1c]'} /> Best
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'}`}>{bestScore?.toFixed(1)}%</div>
                </div>
                <div className={`border rounded-xl p-3 text-center ${isDark ? 'bg-[#161920] border-[#23262D]' : 'bg-[#e8e4db] border-[#d8d4cb]'}`}>
                  <div className={`text-[10px] mb-1 flex items-center justify-center gap-1 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a]'}`}>
                    <TrendingUp size={10} className={isDark ? 'text-[#2F80ED]' : 'text-[#1a1a1a]'} /> Avg
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`}>{avgScore?.toFixed(1)}%</div>
                </div>
              </div>

              {reportCount > 1 && (
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                    improving
                      ? isDark
                        ? 'bg-[#00E5B3]/10 border-[#00E5B3]/30 text-[#00E5B3]'
                        : 'bg-[#1a1a1a]/5 border-[#1a1a1a]/10 text-[#1a1a1a]'
                      : isDark
                        ? 'bg-[#EB5757]/10 border-[#EB5757]/30 text-[#EB5757]'
                        : 'bg-[#b91c1c]/5 border-[#b91c1c]/10 text-[#b91c1c]'
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
                      className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 transition ${isDark ? 'bg-[#161920] border-[#23262D] hover:border-[#323742]' : 'bg-[#e8e4db] border-[#d8d4cb] hover:border-[#1a1a1a]'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full ${isDark ? 'bg-[#2F80ED]/10 border-[#2F80ED]/30 text-[#2F80ED]' : 'bg-[#1a1a1a]/5 border-[#1a1a1a]/10 text-[#1a1a1a]'} border flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                          {reportCount - idx}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`}>
                            {new Date(h.generatedAt).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className={`text-[10px] truncate ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a]'}`}>
                            {h.exam} • {h.correct_answers}/{h.total_questions} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`}>
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
