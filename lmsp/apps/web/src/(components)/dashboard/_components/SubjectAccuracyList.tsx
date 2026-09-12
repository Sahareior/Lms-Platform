import { Layers, Target } from "lucide-react";

// ─── Subject-wise Accuracy panel ───────────────────────────
export default function SubjectAccuracyList({
  subjectData,
  scope,
  selectedExams,
  aiStats,
}: {
  subjectData: any[];
  scope: string;
  selectedExams: any[];
  aiStats: any;
}) {
  return (
    <div className="bg-[#111318] h-[400px] overflow-y-auto border border-[#23262D] rounded-2xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-[#F5F7FA]">Subject-wise Accuracy</h3>
          <p className="text-xs text-[#A1A8B3] mt-0.5">
            {subjectData.length > 0
              ? scope !== "all"
                ? aiStats?.exam
                  ? `Based on ${aiStats.exam} exam analysis`
                  : "Based on your quiz activity"
                : selectedExams.length > 1
                ? `Across all ${selectedExams.length} selected exams`
                : aiStats?.exam
                ? `Based on ${aiStats.exam} exam analysis`
                : "Based on your quiz activity"
              : "No analysis yet"}
          </p>
        </div>
      </div>
      {subjectData.length > 0 ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#23262D] bg-gradient-to-br from-[#161920] to-[#1C1F26] p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-[#2F80ED]/10 border border-[#2F80ED]/20">
                  <Layers size={14} className="text-[#2F80ED]" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A1A8B3]">
                  Performance snapshot
                </p>
              </div>
              <p className="text-sm font-semibold text-[#F5F7FA]">
                Avg. accuracy {(
                  subjectData.reduce((sum: number, item: any) => {
                    const accuracy = Number(item.accuracy ?? item.score ?? 0);
                    return sum + (Number.isFinite(accuracy) ? accuracy : 0);
                  }, 0) / subjectData.length
                ).toFixed(0)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#A1A8B3]">Strong / Needs work</p>
              <p className="text-sm font-bold text-[#00E5B3]">
                {subjectData.filter((item: any) => {
                  const accuracy = Number(item.accuracy ?? item.score ?? 0);
                  return Number.isFinite(accuracy) && accuracy >= 70;
                }).length}/{subjectData.length}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {subjectData.map((item: any, idx: number) => {
              const accuracy = Number(item.accuracy ?? item.score ?? 0);
              const safeAccuracy = Number.isFinite(accuracy) ? accuracy : 0;
              const isWeak = item.isWeak ?? safeAccuracy < 40;
              const isStrong = safeAccuracy >= 70;
              const subjectName = item.subject || item.name || "Subject";
              const badgeText = isWeak ? "Needs focus" : isStrong ? "Strong" : "Steady";
              const badgeClasses = isWeak
                ? "text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/20"
                : isStrong
                ? "text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/20"
                : "text-[#F2C94C] bg-[#F2C94C]/10 border-[#F2C94C]/20";
              const barClasses = isWeak
                ? "from-[#EB5757] to-[#F2C94C]"
                : "from-[#00E5B3] to-[#2F80ED]";

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#23262D] bg-[#161920] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#F5F7FA] truncate">
                        {subjectName}
                      </h4>
                      <p className="text-[11px] text-[#A1A8B3] mt-0.5">
                        {isWeak
                          ? "A bit more practice will boost this area quickly."
                          : "This subject is performing well and staying consistent."}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeClasses}`}>
                        {badgeText}
                      </span>
                      <div className="mt-2 flex items-end justify-end gap-1">
                        <span className={`text-lg font-extrabold ${isWeak ? "text-[#EB5757]" : "text-[#F5F7FA]"}`}>
                          {safeAccuracy}
                        </span>
                        <span className="text-[10px] font-bold mb-1 text-[#A1A8B3]">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#1C1F26] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barClasses}`}
                      style={{ width: `${Math.max(8, safeAccuracy)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
          <Target size={22} className="text-[#2F80ED]" />
          <p className="text-xs text-[#A1A8B3]">
            No subject data yet — complete quizzes to see your accuracy per subject.
          </p>
        </div>
      )}
    </div>
  );
}
