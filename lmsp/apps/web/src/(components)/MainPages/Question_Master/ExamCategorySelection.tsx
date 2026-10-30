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
import { useGetExamsQuery, useGetMeQuery } from "@my-monorepo/store";
import type { Exam } from "@my-monorepo/store";
import { useTheme } from "../../../theme/ThemeContext";
import ReusableHeader from "../../../reusable/ReusableHeader";

/** Map exam names to category-based icons & colours */
function examMeta(
  name: string
): { icon: ReactNode; color: string; subtitle: string } {
  const lower = name.toLowerCase();
  if (lower.includes("bcs"))
    return { icon: <Award size={28} />, color: "#2F80ED", subtitle: "বিসিএস প্রস্তুতি" };
  if (lower.includes("bank"))
    return { icon: <TrendingUp size={28} />, color: "#F2C94C", subtitle: "ব্যাংক জব প্রস্তুতি" };
  if (lower.includes("ssc"))
    return { icon: <BookOpen size={28} />, color: "#00E5B3", subtitle: "এসএসসি প্রস্তুতি" };
  if (lower.includes("hsc"))
    return { icon: <Clipboard size={28} />, color: "#9B51E0", subtitle: "এইচএসসি প্রস্তুতি" };
  if (lower.includes("teacher") || lower.includes("primary"))
    return { icon: <UserCheck size={28} />, color: "#EB5757", subtitle: "শিক্ষক নিবন্ধন প্রস্তুতি" };
  if (lower.includes("govt") || lower.includes("job") || lower.includes("government"))
    return { icon: <Zap size={28} />, color: "#00C8FF", subtitle: "সরকারি চাকরি প্রস্তুতি" };
  return { icon: <BookOpen size={28} />, color: "#9B51E0", subtitle: "পরীক্ষার প্রস্তুতি" };
}

// ─── Helper: pick a fun emoji-like label based on popularity or index ──
function matchLabel(index: number): string {
  const labels = ["৯৮% match", "৯৫% match", "৯২% match", "৯০% match", "৮৭% match", "৮৫% match"];
  return labels[index % labels.length];
}

export default function ExamCategorySelection() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { data: user, isLoading, isError } = useGetMeQuery();

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div 
        className="min-h-screen bg-[#e8e4db] text-[#1a1a1a]"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >

     <div className="md:p-4 p-1"> 
        <ReusableHeader title='Question Center' badge='Select Your Exam' subtitle=' Choose your target exam to access curated question banks, model tests, and past papers.' icon={BookOpen} />

     </div>

        {/* Content */}
        <div className="max-w-8xl mx-auto md:p-4 p-1 py-8 pb-20">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={36} className="text-[#b91c1c] animate-spin" />
              <p className="text-sm text-[#4a4a4a] font-serif italic">Loading exams...</p>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle size={36} className="text-[#b91c1c]" />
              <p className="text-sm text-[#4a4a4a] font-serif italic">Failed to load exams. Please try again later.</p>
            </div>
          )}

          {/* Exam Grid */}
          {user?.selectedExams && user?.selectedExams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-0 gap-5">
              {user?.selectedExams.map((exam: Exam, idx: number) => {
                const { icon, subtitle } = examMeta(exam.name);
                return (
                  <button
                    key={exam._id}
                    onClick={() => navigate(`/question-center/${exam._id}`)}
                    className="group md:w-80 relative flex h-full flex-col rounded-lg border transition-all duration-300 overflow-hidden text-left active:scale-[0.98] bg-[#f2efe9] border-[#d8d4cb] hover:border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a]"
                  >
                    {/* Top accent bar */}
                    <div className="h-1.5 w-full bg-[#b91c1c] transition-all duration-300 group-hover:h-2" />

                    <div className="flex flex-1 flex-col p-5">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9]">
                        {icon}
                      </div>

                      {/* Title */}
                      <h3 className="font-black text-lg mb-1 text-[#1a1a1a] font-serif">
                        {exam.name}
                      </h3>
                      <p className="text-xs font-medium mb-3 text-[#4a4a4a] font-serif italic">
                        {subtitle}
                      </p>

                      {/* Description */}
                      <p className="min-h-[3rem] text-sm leading-relaxed mb-4 line-clamp-2 text-[#4a4a4a] font-serif italic">
                        {exam.description || ""}
                      </p>

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#d8d4cb]">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] font-serif">
                            {matchLabel(idx)}
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className="group-hover:translate-x-0.5 transition-all text-[#4a4a4a] group-hover:text-[#b91c1c]"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {user?.selectedExams && user?.selectedExams.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <BookOpen size={36} className="text-[#1a1a1a]" />
              <p className="text-sm text-[#4a4a4a] font-serif italic">No exams available yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="md:p-4 p-1"> 
        <ReusableHeader title='Question Center' badge='Select Your Exam' subtitle=' Choose your target exam to access curated question banks, model tests, and past papers.' icon={BookOpen} />

     </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-[#9B51E0] animate-spin" />
            <p className="text-sm text-[#A1A8B3]">Loading exams...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle size={36} className="text-[#EB5757]" />
            <p className="text-sm text-[#A1A8B3]">Failed to load exams. Please try again later.</p>
          </div>
        )}

        {user?.selectedExams && user?.selectedExams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-0 gap-5">
            {user?.selectedExams.map((exam: Exam, idx: number) => {
              const { icon, color, subtitle } = examMeta(exam.name);
              return (
                <button
                  key={exam._id}
                  onClick={() => navigate(`/question-center/${exam._id}`)}
                  className="group relative flex h-full flex-col rounded-2xl border transition-all duration-300 overflow-hidden text-left active:scale-[0.98] bg-[#111318] border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.3)]"
                >
                  <div
                    className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                    style={{ backgroundColor: color }}
                  />

                  <div className="flex flex-1 flex-col p-5">
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

                    <h3 className="font-bold text-lg mb-1 text-[#F5F7FA]">
                      {exam.name}
                    </h3>
                    <p className="text-xs font-medium mb-3 text-[#A1A8B3]">
                      {subtitle}
                    </p>

                    <p className="min-h-[3rem] text-sm leading-relaxed mb-4 line-clamp-2 text-[#A1A8B3]">
                      {exam.description || ""}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#23262D]">
                      <div className="flex items-center gap-3">
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
                        className="group-hover:translate-x-0.5 transition-all text-[#6B7280] group-hover:text-[#F5F7FA]"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {user?.selectedExams && user?.selectedExams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <BookOpen size={36} className="text-[#6B7280]" />
            <p className="text-sm text-[#A1A8B3]">No exams available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}