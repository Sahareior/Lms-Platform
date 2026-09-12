import { useGetQuestionsByExamQuery, useGetMeQuery, useGetExamsQuery } from "@my-monorepo/store";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Layers,
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

export default function QuestionMaster() {
  // Route param: /question-center/:examType/:subjectId
  const { examType, subjectId } = useParams<{ examType: string; subjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedYear, setSelectedYear] = useState<string>("All");

  // Determine if we're on a child route (exam-din or question-view)
  const isChildRoute =
    location.pathname.includes("/exam-din") ||
    location.pathname.includes("/question-view");

  // Fetch question sets for this exam category
  const {
    data: questionSets,
    isLoading,
    isError,
  } = useGetQuestionsByExamQuery(
    { examId: examType!, subjectId },
    { skip: !examType }
  );

  const { data: userData } = useGetMeQuery();
  const { data: allExams } = useGetExamsQuery();

  // Find Exam information
  const currentExam = useMemo(() => {
    if (!examType) return null;
    const fromUser = userData?.selectedExams?.find((e: any) => e._id === examType);
    if (fromUser) return fromUser;
    const fromAll = allExams?.find((e: any) => e._id === examType);
    if (fromAll) return fromAll;
    if (questionSets && questionSets.length > 0 && questionSets[0].exam) {
      return questionSets[0].exam;
    }
    return null;
  }, [examType, userData, allExams, questionSets]);

  const examName = currentExam?.name || "Exam";

  // Filter question sets for the chosen subject
  const subjectQuestionSets = useMemo(() => {
    if (!questionSets || !Array.isArray(questionSets)) return [];
    if (!subjectId) return questionSets;

    return questionSets.filter((set: any) => {
      const sub = set.subject;
      if (!sub) return false;
      const sId = typeof sub === "object" ? sub._id : sub;
      const sName = typeof sub === "object" ? sub.name : "";
      return (
        sId === subjectId ||
        sId?.toString() === subjectId ||
        sName === subjectId ||
        encodeURIComponent(sName) === subjectId
      );
    });
  }, [questionSets, subjectId]);

  // Extract the display name of the subject
  const currentSubjectName = useMemo(() => {
    if (location.state?.subjectName) return location.state.subjectName;
    if (subjectQuestionSets.length > 0) {
      const first = subjectQuestionSets[0];
      return first.subject?.name || first.subjectName || "Subject";
    }
    return "Subject";
  }, [location.state, subjectQuestionSets]);

  const exams = useMemo(() => {
    if (!subjectQuestionSets) return [];
    return subjectQuestionSets.map((set: any) => {
      const eName = set.exam?.name || examName || "Unknown Exam";
      const board = set?.board || "";
      const examId = set?.exam?._id || examType;
      const examVersionId = set?.examVersion?._id;
      const subId = set?.subject?._id || subjectId;
      const version = set.examVersion?.examVersion || "";
      const subject = set.subject?.name || currentSubjectName || "";
      const title = `${board ? `${board} - ` : ""}${eName}${version ? ` (${version})` : ""}`;
      return {
        _id: set._id,
        board,
        title,
        examName: eName,
        version,
        subject,
        examId,
        subjectId: subId,
        examVersionId,
        marks: set.totalMarks || 100,
        duration: set.duration || "60 mins",
        description: set.description || `${eName} ${version ? `${version} ` : ""}${subject} – Question Set`,
        status: "Available",
        date: set.createdAt
          ? new Date(set.createdAt).toLocaleDateString("en-BD", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "N/A",
      };
    });
  }, [subjectQuestionSets, examName, examType, subjectId, currentSubjectName]);

  const examYearArray = useMemo(() => {
    const examYearBasedFilter = new Set<string>();
    exams.forEach((exam: any) => {
      if (exam.version) {
        examYearBasedFilter.add(exam.version);
      }
    });
    return Array.from(examYearBasedFilter).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    if (selectedYear === "All") return exams;
    return exams.filter((exam: any) => exam.version === selectedYear);
  }, [exams, selectedYear]);

  // Accent colour for current category
  const accent = examType ? categoryAccent[examType] || "#9B51E0" : "#9B51E0";

  // If on child route, render nested content (exam-din or question-view)
  if (isChildRoute) {
    return <Outlet />;
  }

  // If no examType, redirect to question-center root
  if (!examType) {
    navigate("/question-center", { replace: true });
    return null;
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-[#9B51E0] mx-auto mb-4" />
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
            Could not load question sets for this subject.
          </p>
          <button
            onClick={() => navigate(`/question-center/${examType}`)}
            className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1C1F26] transition"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-[#111318]/95 backdrop-blur-xl border-b border-[#23262D] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => navigate(`/question-center/${examType}`)}
                className="p-2.5 rounded-xl bg-[#161920] border border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#1C1F26] hover:border-[#9B51E0]/40 transition-all active:scale-95"
                title="Back to Subjects"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#9B51E0]/15 text-[#9B51E0] border border-[#9B51E0]/30 uppercase tracking-wider">
                    {examName}
                  </span>
                  <span className="text-xs text-[#6B7280]">/</span>
                  <span className="text-xs font-medium text-[#00C8FF]">
                    {currentSubjectName}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA] mt-1 tracking-tight">
                  Question Sets
                </h1>
              </div>
            </div>

            {filteredExams.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161920] border border-[#23262D] text-xs font-medium text-[#A1A8B3]">
                <Layers size={14} className="text-[#9B51E0]" />
                <span>{filteredExams.length} {filteredExams.length === 1 ? "Set" : "Sets"} Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-24">
        
        {/* Year Filter */}
        {examYearArray.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#23262D]/60">
            <div className="flex items-center gap-1.5 text-xs text-[#A1A8B3] mr-2">
              <Calendar size={14} />
              <span>Year:</span>
            </div>
            <button
              onClick={() => setSelectedYear("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedYear === "All"
                  ? "text-white"
                  : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50"
              }`}
              style={selectedYear === "All" ? { backgroundColor: accent } : {}}
            >
              All Years
            </button>
            {examYearArray.map((year: string) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
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

        {/* Empty State */}
        {filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-[#111318] rounded-2xl border border-[#23262D] max-w-md mx-auto p-8">
            <FileText size={36} className="text-[#6B7280] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#F5F7FA] mb-1">No question sets found</h3>
            <p className="text-[#A1A8B3] text-sm mb-4">
              There are no question sets available for this subject in the selected year.
            </p>
            <button
              onClick={() => navigate(`/question-center/${examType}`)}
              className="bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1C1F26] transition"
            >
              Back to Subjects
            </button>
          </div>
        ) : (
          filteredExams.map((exam: any) => (
            <div
              key={exam._id}
              className="bg-[#111318] rounded-2xl border border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.3)] transition-all duration-300 p-6 group"
            >
              {/* Top Row */}
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-[#A1A8B3] font-medium">{exam.date}</p>
                <span className="bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 text-xs font-semibold px-3 py-0.5 rounded-full">
                  {exam.status}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-bold text-lg sm:text-xl text-[#F5F7FA] mb-2 group-hover:text-[#9B51E0] transition-colors">
                {exam.title}
              </h2>

              {/* Description */}
              <p className="text-[#A1A8B3] leading-relaxed mb-6 text-sm">
                {exam.description}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    const matchedSet = questionSets?.find((s: any) => s._id === exam._id);
                    const targetSubjectId = subjectId || exam.subjectId;
                    navigate(
                      `/question-center/${examType}/${targetSubjectId}/question-view?setId=${exam._id}`,
                      {
                        state: {
                          questions: matchedSet?.data || [],
                          examTitle: exam.title,
                          subject: exam.subject,
                          questionSetId: exam._id,
                          examId: exam.examId,
                          subjectId: targetSubjectId,
                          examVersionId: exam.examVersionId,
                        },
                      }
                    );
                  }}
                  className="border border-[#23262D] rounded-xl py-3 font-semibold text-sm text-[#A1A8B3] hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA] transition-all text-center"
                >
                  প্রশ্ন দেখুন
                </button>
                <button
                  onClick={() => {
                    const matchedSet = questionSets?.find((s: any) => s._id === exam._id);
                    const targetSubjectId = subjectId || exam.subjectId;
                    navigate(
                      `/question-center/${examType}/${targetSubjectId}/exam-din?setId=${exam._id}`,
                      {
                        state: {
                          questions: matchedSet?.data || [],
                          examTitle: exam.title,
                          subject: exam.subject,
                          questionSetId: exam._id,
                          examId: exam.examId,
                          subjectId: targetSubjectId,
                          examVersionId: exam.examVersionId,
                        },
                      }
                    );
                  }}
                  className="text-white rounded-xl py-3 font-semibold text-sm transition-all active:scale-[0.98] text-center"
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