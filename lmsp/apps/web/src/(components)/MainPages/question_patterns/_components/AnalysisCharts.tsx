import { BarChart3, BookOpen, Sparkles } from "lucide-react";

import {
  chartColors, getSubjectBadgeColor, getSubjectColor,
} from "./patternUtils";
import type { AnalysisData } from "./patternUtils";
import { useTheme } from "../../../../theme/ThemeContext";

// ─── Chart 1: Top Subjects ──────────────────────────────────
export function TopSubjectsChart({
  topSubjects,
  totalQuestions,
}: {
  topSubjects: [string, number][];
  totalQuestions: number;
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-2 flex flex-col h-[460px] ${
        isDark
          ? "bg-[#111318] border-[#23262D]"
          : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage: "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      <div className="flex justify-between items-center mb-4 shrink-0 relative z-10">
        <div>
          <h3
            className={
              isDark
                ? "font-bold text-[#F5F7FA] text-sm flex items-center gap-2"
                : "font-black text-[#1a1a1a] text-sm flex items-center gap-2 font-serif"
            }
          >
            <BookOpen
              size={16}
              className={isDark ? "text-[#2F80ED]" : "text-[#b91c1c]"}
            />
            Top Subjects
          </h3>
          <p
            className={
              isDark
                ? "text-xs text-[#A1A8B3] mt-0.5"
                : "text-xs text-[#333] mt-0.5 font-serif"
            }
          >
            By total question count
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3 relative z-10">
        {topSubjects.map(([subject, count], idx) => {
          const maxCount = topSubjects[0][1];
          const percentage = Math.round((count / maxCount) * 100);
          const totalPct = Math.round((count / totalQuestions) * 100);
          const gradient = getSubjectColor(subject);
          return (
            <div
              key={idx}
              className={
                isDark
                  ? "bg-[#161920]/60 hover:bg-[#161920] border border-[#23262D] hover:border-[#323742] p-3.5 rounded-xl transition-all duration-200 group"
                  : "bg-[#e8e4db] hover:bg-[#f7f3ec] border border-[#d8d4cb] p-3.5 rounded-lg transition-all duration-200 group shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a]"
              }
            >
              <div className="flex justify-between items-center text-xs mb-2">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className={
                      isDark
                        ? "text-[10px] font-extrabold text-[#6B7280] w-4 text-center"
                        : "text-[10px] font-black text-[#333] w-4 text-center font-serif"
                    }
                  >
                    0{idx + 1}
                  </span>
                  <div className="flex items-center gap-2 pr-2">
                    <span
                      className={
                        isDark
                          ? "font-semibold flex flex-grow text-[#F5F7FA] group-hover:text-[#2F80ED] leading-snug transition-colors break-words"
                          : "font-black flex flex-grow text-[#1a1a1a] group-hover:text-[#b91c1c] leading-snug transition-colors break-words font-serif"
                      }
                    >
                      {subject}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={
                      isDark
                        ? "text-[10px] text-[#A1A8B3] font-medium"
                        : "text-[10px] text-[#333] font-medium font-serif"
                    }
                  >
                    ({totalPct}%)
                  </span>
                  <span
                    className={
                      isDark
                        ? "text-xs font-bold text-[#F5F7FA] bg-[#1F2430] px-2 py-0.5 rounded-md border border-[#2B303C]"
                        : "text-xs font-black text-[#1a1a1a] bg-[#f7f3ec] px-2 py-0.5 rounded-md border border-[#1a1a1a] font-serif"
                    }
                  >
                    {count} Qs
                  </span>
                </div>
              </div>
              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  isDark ? "bg-[#1C1F26]" : "bg-[#d8d4cb] border border-[#1a1a1a]"
                }`}
              >
                <div
                  className={`h-full ${
                    isDark ? "bg-gradient-to-r" : ""
                  } ${gradient} rounded-full transition-all duration-500`}
                  style={
                    !isDark ? { backgroundColor: "#b91c1c" } : undefined
                  }
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
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-2 flex flex-col h-[460px] ${
        isDark
          ? "bg-[#111318] border-[#23262D]"
          : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage: "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      <div className="mb-4 shrink-0 relative z-10">
        <h3
          className={
            isDark
              ? "font-bold text-[#F5F7FA] text-sm flex items-center gap-2"
              : "font-black text-[#1a1a1a] text-sm flex items-center gap-2 font-serif"
          }
        >
          <BarChart3
            size={16}
            className={isDark ? "text-[#00C8FF]" : "text-[#b91c1c]"}
          />
          Subject Distribution
        </h3>
        <p
          className={
            isDark
              ? "text-xs text-[#A1A8B3] mt-0.5"
              : "text-xs text-[#333] mt-0.5 font-serif"
          }
        >
          {examName || "Exam"} breakdown
        </p>
      </div>

      <div className="flex flex-col items-center justify-between flex-1 min-h-0 relative z-10">
        <div className="relative w-36 h-36 shrink-0 my-auto">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke={isDark ? "#1C1F26" : "#d8d4cb"}
              strokeWidth="4"
            />
            {topSubjects.map(([, count], idx) => {
              const percentage = (count / totalQuestions) * 100;
              const offset = topSubjects
                .slice(0, idx)
                .reduce((acc, [, c]) => acc + (c / totalQuestions) * 100, 0);

              // In light mode, cycle through vintage-friendly monochrome-ish tones
              const lightPalette = [
                "#1a1a1a",
                "#b91c1c",
                "#4a4a4a",
                "#8a8577",
                "#666666",
                "#7a3f3f",
              ];
              const strokeColor = isDark
                ? chartColors[idx % chartColors.length]
                : lightPalette[idx % lightPalette.length];

              return (
                <circle
                  key={idx}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="4.5"
                  strokeDasharray={`${percentage}, 100`}
                  strokeDashoffset={`-${offset}`}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={
                isDark
                  ? "text-2xl font-extrabold text-[#F5F7FA]"
                  : "text-2xl font-black text-[#1a1a1a] font-serif"
              }
            >
              {totalQuestions}
            </div>
            <div
              className={
                isDark
                  ? "text-[9px] text-[#A1A8B3] font-bold uppercase tracking-widest"
                  : "text-[9px] text-[#333] font-black uppercase tracking-widest font-serif"
              }
            >
              Questions
            </div>
          </div>
        </div>

        <div className="w-full max-h-[170px] overflow-y-auto custom-scrollbar space-y-1.5 pr-1 shrink-0 mt-2">
          {topSubjects.map(([subject, count], idx) => {
            const percentage = Math.round((count / totalQuestions) * 100);
            const lightPalette = [
              "#1a1a1a",
              "#b91c1c",
              "#4a4a4a",
              "#8a8577",
              "#666666",
              "#7a3f3f",
            ];
            const dotColor = isDark
              ? chartColors[idx % chartColors.length]
              : lightPalette[idx % lightPalette.length];

            return (
              <div
                key={idx}
                className={
                  isDark
                    ? "flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#161920]/50 border border-[#23262D]/60 text-xs"
                    : "flex items-center justify-between py-1.5 px-3 rounded-md bg-[#e8e4db] border border-[#d8d4cb] text-xs shadow-[1px_1px_0px_0px_#1a1a1a]"
                }
              >
                <span className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span
                    className={
                      isDark
                        ? "truncate text-[#A1A8B3] font-medium"
                        : "truncate text-[#1a1a1a] font-bold font-serif"
                    }
                  >
                    {subject}
                  </span>
                </span>
                <div
                  className={
                    isDark
                      ? "flex items-center gap-1.5 shrink-0 font-bold text-[#F5F7FA]"
                      : "flex items-center gap-1.5 shrink-0 font-black text-[#1a1a1a] font-serif"
                  }
                >
                  <span>{count}</span>
                  <span
                    className={
                      isDark
                        ? "text-[10px] text-[#6B7280] font-normal"
                        : "text-[10px] text-[#333] font-normal font-serif"
                    }
                  >
                    ({percentage}%)
                  </span>
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
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-2 flex flex-col h-[460px] ${
        isDark
          ? "bg-[#111318] border-[#23262D]"
          : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage: "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      <div className="mb-4 shrink-0 relative z-10">
        <h3
          className={
            isDark
              ? "font-bold text-[#F5F7FA] text-sm flex items-center gap-2"
              : "font-black text-[#1a1a1a] text-sm flex items-center gap-2 font-serif"
          }
        >
          <Sparkles
            size={16}
            className={isDark ? "text-[#9B51E0]" : "text-[#b91c1c]"}
          />
          Most Frequent Topics
        </h3>
        <p
          className={
            isDark
              ? "text-xs text-[#A1A8B3] mt-0.5"
              : "text-xs text-[#333] mt-0.5 font-serif"
          }
        >
          Highest frequency across exam papers
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-3 min-h-0 relative z-10">
        {topTopics.map(([topic, count], idx) => {
          const maxCount = topTopics[0][1];
          const percentage = (count / maxCount) * 100;
          const topicData = raw.categorized_questions.find(
            (t) => t.topic === topic
          );

          return (
            <div
              key={idx}
              className={
                isDark
                  ? "bg-[#161920]/80 hover:bg-[#161920] border border-[#23262D] hover:border-[#9B51E0]/40 p-2 rounded-xl transition-all duration-200 group flex flex-col justify-between"
                  : "bg-[#e8e4db] hover:bg-[#f7f3ec] border border-[#d8d4cb] p-2 rounded-lg transition-all duration-200 group flex flex-col justify-between shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a]"
              }
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={
                      isDark
                        ? "text-[10px] font-extrabold text-[#9B51E0] bg-[#9B51E0]/10 border border-[#9B51E0]/20 w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        : "text-[10px] font-black text-[#f2efe9] bg-[#1a1a1a] border border-[#1a1a1a] w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 font-serif"
                    }
                  >
                    #{idx + 1}
                  </span>
                  <h4
                    className={
                      isDark
                        ? "font-bold text-xs md:text-sm text-[#F5F7FA] group-hover:text-[#9B51E0] transition-colors leading-snug"
                        : "font-black text-xs md:text-sm text-[#1a1a1a] group-hover:text-[#b91c1c] transition-colors leading-snug font-serif"
                    }
                  >
                    {topic}
                  </h4>
                </div>
                <span
                  className={
                    isDark
                      ? "shrink-0 text-xs font-extrabold text-yellow-500 bg-[#9B51E0]/15 border border-[#9B51E0]/30 px-2.5 py-0.5 rounded-lg"
                      : "shrink-0 text-xs font-black text-[#1a1a1a] bg-[#f2efe9] border border-[#1a1a1a] px-2.5 py-0.5 rounded-md font-serif shadow-[1px_1px_0px_0px_#1a1a1a]"
                  }
                >
                  {count} Qs
                </span>
              </div>

              {topicData && (
                <div className="flex items-center gap-2 my-1">
                  <span
                    className={
                      isDark
                        ? `text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getSubjectBadgeColor(
                            topicData.subject
                          )}`
                        : "text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#1a1a1a] bg-[#f2efe9] text-[#1a1a1a] font-serif uppercase tracking-wider"
                    }
                  >
                    {topicData.subject}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${
                  isDark
                    ? "bg-[#1C1F26]"
                    : "bg-[#d8d4cb] border border-[#1a1a1a]"
                }`}
              >
                <div
                  className={`h-full ${
                    isDark
                      ? "bg-gradient-to-r from-[#9B51E0] via-[#00C8FF] to-[#00E5B3]"
                      : ""
                  } rounded-full transition-all duration-500`}
                  style={
                    !isDark
                      ? { width: `${percentage}%`, backgroundColor: "#b91c1c" }
                      : { width: `${percentage}%` }
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Highlight Pill */}
      {topTopics.length > 0 && (
        <div
          className={
            isDark
              ? "bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl p-3 text-xs text-[#00E5B3] font-semibold leading-relaxed flex items-center gap-2.5 shrink-0 mt-3"
              : "bg-[#f2efe9] border-2 border-[#1a1a1a] rounded-md p-3 text-xs text-[#1a1a1a] font-black leading-relaxed flex items-center gap-2.5 shrink-0 mt-3 font-serif shadow-[2px_2px_0px_0px_#b91c1c] relative z-10"
          }
        >
          <span className="text-base leading-none">⚡</span>
          <span className="truncate">
            <strong className={isDark ? "text-white" : "text-[#b91c1c]"}>
              {topTopics[0]?.[0]}
            </strong>{" "}
            is the top topic with{" "}
            <strong className={isDark ? "text-white" : "text-[#b91c1c]"}>
              {topTopics[0]?.[1]} questions
            </strong>
            .
          </span>
        </div>
      )}
    </div>
  );
}