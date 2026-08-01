import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  Award,
  TrendingUp,
  BookOpen,
  UserCheck,
  Zap,
  Clipboard,
  ChevronRight,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useGetExamsQuery } from "@my-monorepo/store";
import type { Exam } from "@my-monorepo/store";

/** Map exam names to category-based icons & colours */
function examMeta(
  name: string
): { icon: ReactNode; color: string; subtitle: string } {
  const lower = name.toLowerCase();
  if (lower.includes("bcs"))
    return {
      icon: <Award size={28} />,
      color: "#2F80ED",
      subtitle: "বিসিএস প্রস্তুতি",
    };
  if (lower.includes("bank"))
    return {
      icon: <TrendingUp size={28} />,
      color: "#F2C94C",
      subtitle: "ব্যাংক জব প্রস্তুতি",
    };
  if (lower.includes("ssc"))
    return {
      icon: <BookOpen size={28} />,
      color: "#00E5B3",
      subtitle: "এসএসসি প্রস্তুতি",
    };
  if (lower.includes("hsc"))
    return {
      icon: <Clipboard size={28} />,
      color: "#9B51E0",
      subtitle: "এইচএসসি প্রস্তুতি",
    };
  if (lower.includes("teacher") || lower.includes("primary"))
    return {
      icon: <UserCheck size={28} />,
      color: "#EB5757",
      subtitle: "শিক্ষক নিবন্ধন প্রস্তুতি",
    };
  if (lower.includes("govt") || lower.includes("job") || lower.includes("government"))
    return {
      icon: <Zap size={28} />,
      color: "#00C8FF",
      subtitle: "সরকারি চাকরি প্রস্তুতি",
    };
  // Default
  return {
    icon: <BookOpen size={28} />,
    color: "#9B51E0",
    subtitle: "পরীক্ষার প্রস্তুতি",
  };
}

// ─── Helper: pick a fun emoji-like label based on popularity or index ──
function matchLabel(index: number): string {
  const labels = ["৯৮% match", "৯৫% match", "৯২% match", "৯০% match", "৮৭% match", "৮৫% match"];
  return labels[index % labels.length];
}

export default function ExamCategorySelection() {
  const navigate = useNavigate();
  const { data: exams, isLoading, isError } = useGetExamsQuery();
  console.log(exams)

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Header */}
      <div className="bg-[#111318]/95 backdrop-blur-xl border-b border-[#23262D] top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-[#9B51E0]/10 text-[#9B51E0] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-[#9B51E0]/30">
              <Star size={11} />
              <span>Question Center</span>
              <Star size={11} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Select Your Exam
            </h1>
            <p className="text-[#A1A8B3] text-sm max-w-xl mx-auto">
              Choose your target exam to access curated question banks, model tests, and past papers.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-[#9B51E0] animate-spin" />
            <p className="text-[#A1A8B3] text-sm">Loading exams...</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle size={36} className="text-[#EB5757]" />
            <p className="text-[#A1A8B3] text-sm">Failed to load exams. Please try again later.</p>
          </div>
        )}

        {/* Exam Grid */}
        {exams && exams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {exams.map((exam: Exam, idx: number) => {
              const { icon, color, subtitle } = examMeta(exam.name);
              return (
                <button
                  key={exam._id}
                  onClick={() => navigate(`/question-center/${exam._id}`)}
                  className="group relative bg-[#111318] rounded-2xl border border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.3)] transition-all duration-300 overflow-hidden text-left active:scale-[0.98]"
                >
                  {/* Top accent bar */}
                  <div
                    className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                    style={{ backgroundColor: color }}
                  />

                  <div className="p-5">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${color}1A`,
                        border: `1px solid ${color}4D`,
                        color: color,
                      }}
                    >
                      {icon}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-[#F5F7FA] mb-1">
                      {exam.name}
                    </h3>
                    <p className="text-xs font-medium text-[#A1A8B3] mb-3">
                      {subtitle}
                    </p>

                    {/* Description */}
                    {exam.description && (
                      <p className="text-sm text-[#A1A8B3] leading-relaxed mb-4 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#23262D]">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-medium text-[#6B7280]">
                          {exam.applicants || "N/A"} applicants
                        </span>
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${color}1A`,
                            color: color,
                            border: `1px solid ${color}4D`,
                          }}
                        >
                          {matchLabel(idx)}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-[#6B7280] group-hover:text-[#F5F7FA] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {exams && exams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <BookOpen size={36} className="text-[#6B7280]" />
            <p className="text-[#A1A8B3] text-sm">No exams available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
