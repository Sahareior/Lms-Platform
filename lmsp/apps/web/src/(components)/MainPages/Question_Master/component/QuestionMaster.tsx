import { useGetQuestionsByExamQuery } from "@my-monorepo/store";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock,
  FileText,
  Search,
  Grid3X3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";

// BrainForge accent colours per category
const categoryAccent: Record<string, string> = {
  bcs: "#2F80ED",
  bank: "#F2C94C",
  ssc: "#00E5B3",
  hsc: "#9B51E0",
  teacher: "#EB5757",
  govt: "#00C8FF",
};

const categoryMeta: Record<string, { subtitle: string }> = {
  bcs: { subtitle: "BCS প্রশ্ন ব্যাংক" },
  bank: { subtitle: "ব্যাংক জব প্রশ্ন ব্যাংক" },
  ssc: { subtitle: "এসএসসি প্রশ্ন ব্যাংক" },
  hsc: { subtitle: "এইচএসসি প্রশ্ন ব্যাংক" },
  teacher: { subtitle: "শিক্ষক নিবন্ধন প্রশ্ন ব্যাংক" },
  govt: { subtitle: "সরকারি চাকরি প্রশ্ন ব্যাংক" },
};

export default function QuestionMaster() {
  // Route param: /question-center/:examType
  const { examType } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedYear, setSelectedYear] = useState<string>("All");

  // Determine if we're on a child route (exam-din)
  const isChildRoute = location.pathname.includes("/exam-din");

  // Fetch question sets for this exam category
  const {
    data: questionSets,
    isLoading,
    isError,
  } = useGetQuestionsByExamQuery(
    { examId: examType! },
    { skip: !examType }
  );

  const exams = useMemo(() => {
    if (!questionSets) return [];
    return questionSets.map((set: any) => {
      const examName = set.exam?.name || "Unknown Exam";
      const board = set?.board || "";
      const examId = set?.exam?._id;
      const examVersionId = set?.examVersion?._id;
      const subjectId = set?.subject?._id;
      const version = set.examVersion?.examVersion || "";
      const subject = set.subject?.name || "";
      const title = `${board} - ${examName} ${version ? ` - ${version}` : ""}`;
      return {
        _id: set._id,
        board,
        title,
        examName,
        version,
        subject,
        examId,         // real Exam _id (populated by the API)
        subjectId,      // ✅ added
        examVersionId,  // ✅ added
        marks: set.totalMarks || 100,
        duration: set.duration || "60 mins",
        description: set.description || `${examName} ${version} ${subject} – question set`,
        status: "Available",
        date: set.createdAt ? new Date(set.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
      };
    });
  }, [questionSets]);

  const examYearArray = useMemo(() => {
    const examYearBasedFilter = new Set<string>();
    exams.forEach((exam: any) => {
      examYearBasedFilter.add(exam.version);
    });
    return Array.from(examYearBasedFilter).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    if (selectedYear === "All") return exams;
    return exams.filter((exam: any) => exam.version === selectedYear);
  }, [exams, selectedYear]);

  // Accent colour for current category
  const accent = examType ? categoryAccent[examType] || "#9B51E0" : "#9B51E0";
  const meta = examType ? categoryMeta[examType] : null;

  // If on child route, render nested content
  if (isChildRoute) {
    return <Outlet />;
  }

  // If no examType (should not happen), redirect
  if (!examType) {
    navigate("/question-center", { replace: true });
    return null;
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#9B51E0] mx-auto mb-4" />
          <p className="text-[#A1A8B3] font-medium">Loading question sets...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (isError || !questionSets) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-[#111318] rounded-2xl border border-[#23262D]">
          <AlertCircle size={32} className="text-[#EB5757] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">Failed to load</h3>
          <p className="text-[#A1A8B3] text-sm mb-4">
            Could not load question sets for this exam category.
          </p>
          <button
            onClick={() => navigate("/question-center")}
            className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1C1F26] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Exam Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* Year Filter */}
        {examYearArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setSelectedYear("All")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedYear === "All"
                  ? "text-white"
                  : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50"
              }`}
              style={selectedYear === "All" ? { backgroundColor: accent } : {}}
            >
              All
            </button>
            {examYearArray.map((year: string) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedYear === year
                    ? "text-white"
                    : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50"
                }`}
                style={selectedYear === year ? { backgroundColor: accent } : {}}
              >
                {year || "Unknown"}
              </button>
            ))}
          </div>
        )}

        {filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-[#111318] rounded-2xl border border-[#23262D]">
            <FileText size={32} className="text-[#6B7280] mx-auto mb-3" />
            <p className="text-[#A1A8B3] font-semibold">No question sets available</p>
          </div>
        ) : (
          filteredExams.map((exam: any) => (
            <div
              key={exam._id}
              className="bg-[#111318] rounded-2xl border border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.3)] transition-all duration-300 p-6 group"
            >
              {/* Top Row */}
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-[#A1A8B3]">{exam.date}</p>
                <span className="bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 text-xs font-semibold px-3 py-1 rounded-full">
                  {exam.status}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-bold text-lg sm:text-xl text-[#F5F7FA] mb-3 group-hover:text-[#9B51E0] transition-colors">
                {exam.title}
              </h2>

              {/* Description */}
              <p className="text-[#A1A8B3] leading-7 mb-6 text-sm">
                {exam.description}
              </p>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="border border-[#23262D] rounded-xl py-3 font-semibold text-sm text-[#A1A8B3] hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA] transition-all">
                  প্রশ্ন দেখুন
                </button>
                <button
                  onClick={() => {
                    const matchedSet = questionSets?.find((s: any) => s._id === exam._id);
                    navigate(
                      `/question-center/${examType}/exam-din?setId=${exam._id}`,
                      {
                        state: {
                          questions: matchedSet?.data || [],
                          examTitle: exam.title,
                          subject: exam.subject,
                          questionSetId: exam._id,
                          examId: exam.examId,             // real Exam _id
                          subjectId: exam.subjectId,         // ✅ now defined
                          examVersionId: exam.examVersionId, // ✅ now defined
                        },
                      }
                    );
                  }}
                  className="text-white rounded-xl py-3 font-semibold text-sm transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 4px 14px ${accent}40`,
                  }}
                >
                  পরীক্ষা দিন
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Outlet for nested child routes */}
      <Outlet />
    </div>
  );
}