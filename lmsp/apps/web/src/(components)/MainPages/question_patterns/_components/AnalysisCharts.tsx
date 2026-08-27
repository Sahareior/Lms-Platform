import { BarChart3, BookOpen, Sparkles } from "lucide-react";
import {
  chartColors, getSubjectBadgeColor, getSubjectColor,
} from "./patternUtils";
import type { AnalysisData } from "./patternUtils";

// ─── Chart 1: Top Subjects ──────────────────────────────────
export function TopSubjectsChart({
  topSubjects,
  totalQuestions,
}: {
  topSubjects: [string, number][];
  totalQuestions: number;
}) {
  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-2 flex flex-col h-[460px]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h3 className="font-bold text-[#F5F7FA] text-sm flex items-center gap-2">
            <BookOpen size={16} className="text-[#2F80ED]" />
            Top Subjects
          </h3>
          <p className="text-xs text-[#A1A8B3] mt-0.5">By total question count</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3">
        {topSubjects.map(([subject, count], idx) => {
          const maxCount = topSubjects[0][1];
          const percentage = Math.round((count / maxCount) * 100);
          const totalPct = Math.round((count / totalQuestions) * 100);
          const gradient = getSubjectColor(subject);
          return (
            <div
              key={idx}
              className="bg-[#161920]/60 hover:bg-[#161920] border border-[#23262D] hover:border-[#323742] p-3.5 rounded-xl transition-all duration-200 group"
            >
              <div className="flex justify-between items-center text-xs mb-2">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-[10px] font-extrabold text-[#6B7280] w-4 text-center">
                    0{idx + 1}
                  </span>
                  <div className="flex items-center gap-2 pr-2">
                    <span className="font-semibold flex flex-grow text-[#F5F7FA] group-hover:text-[#2F80ED] leading-snug transition-colors break-words">
                      {subject}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#A1A8B3] font-medium">
                    ({totalPct}%)
                  </span>
                  <span className="text-xs font-bold text-[#F5F7FA] bg-[#1F2430] px-2 py-0.5 rounded-md border border-[#2B303C]">
                    {count} Qs
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-[#1C1F26] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chart 2: Subject Distribution (Donut) ──────────────────
export function SubjectDistributionChart({
  topSubjects,
  totalQuestions,
  examName,
}: {
  topSubjects: [string, number][];
  totalQuestions: number;
  examName?: string;
}) {
  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-2 flex flex-col h-[460px]">
      <div className="mb-4 shrink-0">
        <h3 className="font-bold text-[#F5F7FA] text-sm flex items-center gap-2">
          <BarChart3 size={16} className="text-[#00C8FF]" />
          Subject Distribution
        </h3>
        <p className="text-xs text-[#A1A8B3] mt-0.5">
          {examName || "Exam"} breakdown
        </p>
      </div>

      <div className="flex flex-col items-center justify-between flex-1 min-h-0">
        {/* Donut graphic */}
        <div className="relative w-36 h-36 shrink-0 my-auto">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#1C1F26"
              strokeWidth="4"
            />
            {topSubjects.map(([, count], idx) => {
              const percentage = (count / totalQuestions) * 100;
              const offset = topSubjects
                .slice(0, idx)
                .reduce((acc, [, c]) => acc + (c / totalQuestions) * 100, 0);
              return (
                <circle
                  key={idx}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke={chartColors[idx % chartColors.length]}
                  strokeWidth="4.5"
                  strokeDasharray={`${percentage}, 100`}
                  strokeDashoffset={`-${offset}`}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-extrabold text-[#F5F7FA]">
              {totalQuestions}
            </div>
            <div className="text-[9px] text-[#A1A8B3] font-bold uppercase tracking-widest">
              Questions
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full max-h-[170px] overflow-y-auto custom-scrollbar space-y-1.5 pr-1 shrink-0 mt-2">
          {topSubjects.map(([subject, count], idx) => {
            const percentage = Math.round((count / totalQuestions) * 100);
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#161920]/50 border border-[#23262D]/60 text-xs"
              >
                <span className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                  />
                  <span className="truncate text-[#A1A8B3] font-medium">
                    {subject}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0 font-bold text-[#F5F7FA]">
                  <span>{count}</span>
                  <span className="text-[10px] text-[#6B7280] font-normal">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Chart 3: Most Frequent Topics ──────────────────────────
export function FrequentTopicsChart({
  topTopics,
  raw,
}: {
  topTopics: [string, number][];
  raw: AnalysisData;
}) {
  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-2 flex flex-col h-[460px]">
      <div className="mb-4 shrink-0">
        <h3 className="font-bold text-[#F5F7FA] text-sm flex items-center gap-2">
          <Sparkles size={16} className="text-[#9B51E0]" />
          Most Frequent Topics
        </h3>
        <p className="text-xs text-[#A1A8B3] mt-0.5">Highest frequency across exam papers</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3 min-h-0">
        {topTopics.map(([topic, count], idx) => {
          const maxCount = topTopics[0][1];
          const percentage = (count / maxCount) * 100;
          const topicData = raw.categorized_questions.find((t) => t.topic === topic);

          return (
            <div
              key={idx}
              className="bg-[#161920]/80 hover:bg-[#161920] border border-[#23262D] hover:border-[#9B51E0]/40 p-2 rounded-xl transition-all duration-200 group flex flex-col justify-between"
            >
              {/* Header: Rank + Topic Name + Count Pill */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-[10px] font-extrabold text-[#9B51E0] bg-[#9B51E0]/10 border border-[#9B51E0]/20 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <h4 className="font-bold text-xs md:text-sm text-[#F5F7FA] group-hover:text-[#9B51E0] transition-colors leading-snug">
                    {topic}
                  </h4>
                </div>
                <span className="shrink-0 text-xs font-extrabold text-yellow-500 bg-[#9B51E0]/15 border border-[#9B51E0]/30 px-2.5 py-0.5 rounded-lg">
                  {count} Qs
                </span>
              </div>

              {/* Meta: Subject Badge */}
              {topicData && (
                <div className="flex items-center gap-2 my-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getSubjectBadgeColor(topicData.subject)}`}>
                    {topicData.subject}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#1C1F26] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-[#9B51E0] via-[#00C8FF] to-[#00E5B3] rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Highlight Pill */}
      {topTopics.length > 0 && (
        <div className="bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl p-3 text-xs text-[#00E5B3] font-semibold leading-relaxed flex items-center gap-2.5 shrink-0 mt-3">
          <span className="text-base leading-none">⚡</span>
          <span className="truncate">
            <strong className="text-white">{topTopics[0]?.[0]}</strong> is the top topic with{" "}
            <strong className="text-white">{topTopics[0]?.[1]} questions</strong>.
          </span>
        </div>
      )}
    </div>
  );
}
