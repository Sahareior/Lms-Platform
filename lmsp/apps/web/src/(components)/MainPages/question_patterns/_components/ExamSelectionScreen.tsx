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
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-[#9B51E0] mx-auto" />
          <p className="text-[#A1A8B3] font-semibold">Loading your exams...</p>
        </div>
      </div>
    );
  }

  if (!selectedExams || selectedExams.length === 0) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center max-w-md p-10 bg-[#111318] rounded-2xl border border-[#23262D]">
          <div className="w-16 h-16 bg-[#161920] border border-[#23262D] rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-[#6B7280]" />
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">No Exams Selected Yet</h3>
          <p className="text-sm text-[#A1A8B3] mb-6">
            You haven't selected any exams yet. Start by enrolling in a course from your dashboard.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-[#2F80ED] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#256BCE] transition-all active:scale-95"
          >
            <ArrowRight size={15} />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-8xl space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#9B51E0]/10 text-[#9B51E0] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#9B51E0]/30">
            <Sparkles size={11} />
            Question Pattern Analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Choose an Exam to Analyze
          </h1>
          <p className="text-[#A1A8B3] text-sm leading-relaxed">
            Select one of your enrolled exams to discover high-probability topics, subject distributions, and AI-powered pattern insights.
          </p>
        </div>

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedExams.map((exam: any, idx: number) => {
            const accent = accentColors[idx % accentColors.length];
            return (
              <button
                key={exam._id}
                onClick={() => onSelectExam(exam._id)}
                className={`group bg-[#111318] rounded-2xl overflow-hidden border ${accent} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left active:scale-[0.98]`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#9B51E0]/10 border border-[#9B51E0]/30 flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-[#9B51E0]" />
                    </div>
                    <ChevronRight size={18} className="text-[#6B7280] group-hover:text-[#9B51E0] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#F5F7FA] group-hover:text-[#9B51E0] transition-colors">{exam.name}</h3>
                    <p className="text-xs text-[#A1A8B3] font-medium mt-1">Click to view question patterns</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-2 border-t border-[#23262D]">
                    <BarChart3 size={12} />
                    <span>Pattern Analysis</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer link back to dashboard */}
        <div className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#F5F7FA] transition-colors"
          >
            <ArrowRight size={14} className="rotate-180" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
