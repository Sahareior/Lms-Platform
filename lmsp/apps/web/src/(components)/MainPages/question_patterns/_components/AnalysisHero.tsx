import {
  BarChart3,
  BookOpen,
  Brain,
  Sparkles,
  Target,
} from "lucide-react";

// ─── Hero header ─────────────────────────────────────────────
export default function AnalysisHero({
  examName,
  versionName,
  topicCount,
  totalQuestions,
}: {
  examName: string | null;
  versionName?: string;
  topicCount: number;
  totalQuestions: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#111318] border border-[#23262D] p-7 md:p-10 shadow-sm">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#9B51E0]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#2F80ED]/15 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#9B51E0]/10 border border-[#9B51E0]/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Brain size={22} className="text-[#9B51E0]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Question Pattern Analysis
              </h1>
              <p className="text-sm text-[#A1A8B3] mt-1 max-w-xl">
                {examName
                  ? `High-probability topics and trends for ${examName}${
                      versionName ? ` • ${versionName}` : ""
                    }`
                  : "Discover high-probability topics and trends from exam data powered by AI analysis."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex md:mb-6 items-center gap-3 text-xs font-semibold bg-[#161920] text-[#F5F7FA] px-4 py-2.5 rounded-xl border border-[#23262D]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5B3] animate-pulse" />{" "}
            10 Years
          </span>
          <span className="w-px h-3.5 bg-[#23262D]" />
          <span>{topicCount} Topics</span>
          <span className="w-px h-3.5 bg-[#23262D]" />
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
          className={`bg-[#111318] rounded-2xl border ${stat.accent} p-4 flex items-center gap-3.5 hover:border-opacity-70 transition-all duration-200`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
            {stat.icon}
          </div>
          <div className="min-w-0">
            <div className="text-lg md:text-xl font-extrabold text-[#F5F7FA] leading-tight">
              {stat.number}
            </div>
            <div className="text-[11px] text-[#A1A8B3] font-semibold mt-0.5 truncate">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
