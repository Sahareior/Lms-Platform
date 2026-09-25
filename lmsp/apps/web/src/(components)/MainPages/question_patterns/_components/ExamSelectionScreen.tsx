import { useNavigate } from "react-router-dom";
import { useGetMeQuery } from "@my-monorepo/store";
import {
  BookOpen,
  BarChart3,
  Sparkles,
  ArrowRight,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../../../theme/ThemeContext";


/* ==================================================================
   EXAM SELECTION SCREEN (shown when no examId is in the URL)
   ================================================================== */
export default function ExamSelectionScreen({
  onSelectExam,
}: {
  onSelectExam: (examId: string) => void;
}) {
  const navigate = useNavigate();
  const { data: userData, isLoading: profileLoading } = useGetMeQuery();
  const { isDark } = useTheme();
  const selectedExams = userData?.selectedExams || [];

  const accentColors = [
    "border-[#9B51E0]/50 hover:border-[#9B51E0]",
    "border-[#2F80ED]/50 hover:border-[#2F80ED]",
    "border-[#00E5B3]/50 hover:border-[#00E5B3]",
    "border-[#F2C94C]/50 hover:border-[#F2C94C]",
    "border-[#EB5757]/50 hover:border-[#EB5757]",
  ];

  if (profileLoading) {
    return (
      <div className={`flex-1 min-h-screen flex items-center justify-center ${isDark ? "bg-[#0B0D12]" : "bg-[#e8e4db]"}`}>
        <div className="text-center space-y-4">
          <Loader2 size={32} className={`animate-spin mx-auto ${isDark ? "text-[#9B51E0]" : "text-[#b91c1c]"}`} />
          <p className={isDark ? "text-[#A1A8B3] font-semibold" : "text-[#4a4a4a] font-serif font-semibold"}>Loading your exams...</p>
        </div>
      </div>
    );
  }

  if (!selectedExams || selectedExams.length === 0) {
    return (
      <div className={`flex-1 min-h-screen flex items-center justify-center ${isDark ? "bg-[#0B0D12]" : "bg-[#e8e4db]"}`}>
        <div className={`text-center max-w-md p-10 rounded-2xl border ${isDark ? "bg-[#111318] border-[#23262D]" : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"}`}>
          <div className={`w-16 h-16 border rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-[#161920] border-[#23262D]" : "bg-[#e8e4db] border-[#d8d4cb]"}`}>
            <BookOpen size={28} className={isDark ? "text-[#6B7280]" : "text-[#1a1a1a]"} />
          </div>
          <h3 className={isDark ? "text-lg font-bold text-[#F5F7FA] mb-2" : "text-lg font-black text-[#1a1a1a] mb-2 font-serif"}>No Exams Selected Yet</h3>
          <p className={isDark ? "text-sm text-[#A1A8B3] mb-6" : "text-sm text-[#4a4a4a] mb-6 font-serif italic leading-relaxed"}>
            You haven't selected any exams yet. Start by enrolling in a course from your dashboard.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${isDark ? "bg-[#2F80ED] text-white hover:bg-[#256BCE]" : "bg-[#1a1a1a] text-[#f2efe9] hover:bg-[#2a2a2a] shadow-[3px_3px_0px_0px_#b91c1c]"}`}
          >
            <ArrowRight size={15} />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${isDark ? "bg-[#0B0D12]" : "bg-[#e8e4db]"} h-screen`}>
      <div className="max-w-8xl space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border ${isDark ? "bg-[#9B51E0]/10 text-[#9B51E0] border-[#9B51E0]/30" : "bg-[#f2efe9] text-[#1a1a1a] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]"}`}>
            <Sparkles size={11} />
            Question Pattern Analysis
          </div>
          <h1 className={isDark ? "text-3xl md:text-4xl font-extrabold tracking-tight leading-tight" : "text-3xl md:text-4xl font-black tracking-tight leading-tight text-[#1a1a1a] font-serif"}>
            Choose an Exam to Analyze
          </h1>
          <p className={isDark ? "text-[#A1A8B3] text-sm leading-relaxed" : "text-sm leading-relaxed text-[#4a4a4a] font-serif italic"}>
            Select one of your enrolled exams to discover high-probability topics, subject distributions, and AI-powered pattern insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedExams.map((exam: any, idx: number) => {
            const accent = accentColors[idx % accentColors.length];
            return (
              <button
                key={exam._id}
                onClick={() => onSelectExam(exam._id)}
                className={`group rounded-2xl overflow-hidden border ${accent} transition-all duration-300 text-left active:scale-[0.98] ${isDark ? "bg-[#111318] shadow-sm hover:shadow-lg hover:-translate-y-1" : "bg-[#f2efe9] shadow-[3px_3px_0px_0px_#1a1a1a] hover:-translate-y-1"}`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-[#9B51E0]/10 border border-[#9B51E0]/30" : "bg-[#e8e4db] border border-[#d8d4cb]"}`}>
                      <FileText size={22} className={isDark ? "text-[#9B51E0]" : "text-[#b91c1c]"} />
                    </div>
                    <ChevronRight size={18} className={isDark ? "text-[#6B7280] group-hover:text-[#9B51E0]" : "text-[#4a4a4a] group-hover:text-[#1a1a1a]"} />
                  </div>
                  <div>
                    <h3 className={isDark ? "font-bold text-lg text-[#F5F7FA] group-hover:text-[#9B51E0] transition-colors" : "font-black text-lg text-[#1a1a1a] group-hover:text-[#b91c1c] transition-colors font-serif"}>{exam.name}</h3>
                    <p className={isDark ? "text-xs text-[#A1A8B3] font-medium mt-1" : "text-xs text-[#4a4a4a] font-medium mt-1 font-serif italic"}>Click to view question patterns</p>
                  </div>
                  <div className={`flex items-center gap-2 text-xs pt-2 border-t ${isDark ? "text-[#6B7280] border-[#23262D]" : "text-[#4a4a4a] border-[#d8d4cb]"}`}>
                    <BarChart3 size={12} />
                    <span>Pattern Analysis</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className={isDark ? "inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#F5F7FA] transition-colors" : "inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] hover:text-[#b91c1c] transition-colors font-serif"}
          >
            <ArrowRight size={14} className="rotate-180" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
