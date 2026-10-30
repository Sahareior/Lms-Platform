import {
  BarChart3,
  BookOpen,
  Brain,
  Sparkles,
  Target,
} from "lucide-react";
import { useTheme } from "../../../../theme/ThemeContext";

// ─── Hero header ─────────────────────────────────────────────
export default function AnalysisHero({
  examName,
  subjectName,
  versionName,
  boardName,
  topicCount,
  totalQuestions,
}: {
  examName: string | null;
  subjectName?: string | null;
  versionName?: string | null;
  boardName?: string | null;
  topicCount: number;
  totalQuestions: number;
}) {
  const { isDark } = useTheme();
  const scopeParts = [
    examName,
    subjectName ? `Subject: ${subjectName}` : null,
    versionName ? `Year: ${versionName}` : null,
    boardName ? `Board: ${boardName}` : null,
  ].filter(Boolean);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        isDark
          ? "bg-[#111318] border-[#23262D] shadow-sm p-7 md:p-10"
          : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] p-7 md:p-10"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage:
                "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      {/* Ambient blurs (dark only feel right on vintage cream, so we suppress them in light) */}
      {isDark && (
        <>
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#9B51E0]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#2F80ED]/15 rounded-full blur-3xl" />
        </>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isDark
                  ? "bg-[#9B51E0]/10 border border-[#9B51E0]/30"
                  : "bg-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c]"
              }`}
            >
              <Brain
                size={22}
                className={isDark ? "text-[#9B51E0]" : "text-[#f2efe9]"}
              />
            </div>
            <div>
              <h1
                className={
                  isDark
                    ? "text-2xl md:text-3xl font-extrabold text-white tracking-tight"
                    : "text-2xl md:text-3xl font-black tracking-tight text-[#1a1a1a] font-serif"
                }
              >
                Question Pattern Analysis
              </h1>
              <p
                className={
                  isDark
                    ? "text-sm text-[#A1A8B3] mt-1 max-w-2xl"
                    : "text-sm text-[#333] mt-1 max-w-2xl font-serif"
                }
              >
                {scopeParts.length > 0
                  ? `Targeted high-probability topics and trends for ${scopeParts.join(
                      " • "
                    )}`
                  : "Discover high-probability topics and trends from exam data powered by AI analysis."}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex md:mb-6 items-center gap-3 text-xs px-4 py-2.5 rounded-xl border ${
            isDark
              ? "bg-[#161920] text-[#F5F7FA] border-[#23262D] font-semibold"
              : "bg-[#e8e4db] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] font-black font-serif"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDark ? "bg-[#00E5B3] animate-pulse" : "bg-[#b91c1c]"
              }`}
            />{" "}
            {versionName || "All Years"}
          </span>
          <span
            className={`w-px h-3.5 ${
              isDark ? "bg-[#23262D]" : "bg-[#1a1a1a]"
            }`}
          />
          <span>{topicCount} Topics</span>
          <span
            className={`w-px h-3.5 ${
              isDark ? "bg-[#23262D]" : "bg-[#1a1a1a]"
            }`}
          />
          <span>{totalQuestions}+ Qs</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stats row ───────────────────────────────────────────────
export function AnalysisStats({
  totalQuestions,
  topicCount,
  subjectCount,
}: {
  totalQuestions: number;
  topicCount: number;
  subjectCount: number;
}) {
  const { isDark } = useTheme();

  const stats = [
    {
      number: totalQuestions.toLocaleString() + "+",
      label: "Questions Analyzed",
      accent: "border-[#2F80ED]",
      iconBg: "bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30",
      icon: <BarChart3 size={18} />,
    },
    {
      number: topicCount,
      label: "Topics Identified",
      accent: "border-[#9B51E0]",
      iconBg: "bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30",
      icon: <Target size={18} />,
    },
    {
      number: subjectCount,
      label: "Subjects Covered",
      accent: "border-[#00E5B3]",
      iconBg: "bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30",
      icon: <BookOpen size={18} />,
    },
    {
      number: "91%",
      label: "Predicted Accuracy",
      accent: "border-[#00C8FF]",
      iconBg: "bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/30",
      icon: <Sparkles size={18} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all duration-200 ${
            isDark
              ? "bg-[#111318] " + stat.accent
              : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
          }`}
          style={
            isDark
              ? undefined
              : {
                  backgroundImage:
                    "radial-gradient(#d8d4cb 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }
          }
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDark
                ? stat.iconBg
                : "bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a]"
            }`}
          >
            {stat.icon}
          </div>
          <div className="min-w-0 relative z-10">
            <div
              className={
                isDark
                  ? "text-lg md:text-xl font-extrabold text-[#F5F7FA] leading-tight"
                  : "text-lg md:text-xl font-black text-[#1a1a1a] leading-tight font-serif"
              }
            >
              {stat.number}
            </div>
            <div
              className={
                isDark
                  ? "text-[11px] text-[#A1A8B3] font-semibold mt-0.5 truncate"
                  : "text-[11px] text-[#333] font-bold mt-0.5 truncate font-serif"
              }
            >
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}