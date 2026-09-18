import { useGetQuestionsByExamQuery, useGetMeQuery, useGetExamsQuery } from "@my-monorepo/store";
import { QUESTION_TYPES, type QuestionType } from "@my-monorepo/store";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Layers,
  Tag,
  MapPin,
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
  // Filter by the source of the question set: board / testpaper / mockexam.
  // Applied server-side via the ?questionType= query param — "All" sends no
  // param so legacy sets saved before questionType existed stay visible.
  const resolvedQuestionType = location.state?.questionType === undefined ? "All" : (location.state?.questionType || "All");
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>(resolvedQuestionType);
  // Board filter (client-side): only shown when board-type sets exist.
  const [selectedBoard, setSelectedBoard] = useState<string>("All");

  // Determine if we're on a child route (exam-din or question-view)
  const isChildRoute =
    location.pathname.includes("/exam-din") ||
    location.pathname.includes("/question-view");

  // Fetch question sets for this exam category, filtered server-side by type.
  const {
    data: questionSets,
    isLoading,
    isError,
  } = useGetQuestionsByExamQuery(
    {
      examId: examType!,
      subjectId,
      questionType: selectedQuestionType === "All" ? '' : (selectedQuestionType as QuestionType),
    },
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

    const normalizedSubjectId = decodeURIComponent(subjectId).trim().toLowerCase().replace(/\s+/g, " ");

    return questionSets.filter((set: any) => {
      const sub = set.subject;
      const sId = typeof sub === "object" ? sub._id : sub;
      const sName = typeof sub === "object" ? sub.name : (set.subjectName || "");
      const subjectNames = new Set<string>([
        sName,
        set.subjectName,
        ...(Array.isArray(set.data) ? set.data.map((q: any) => q?.subjectName).filter(Boolean) : []),
      ].filter(Boolean).map((name: string) => name.trim()));

      const normalizedNames = [...subjectNames].map((name) => name.toLowerCase().replace(/\s+/g, " "));

      return (
        sId === subjectId ||
        sId?.toString() === subjectId ||
        sName?.toLowerCase().replace(/\s+/g, " ") === normalizedSubjectId ||
        encodeURIComponent(sName || "") === subjectId ||
        normalizedNames.includes(normalizedSubjectId) ||
        [...subjectNames].some((name) => encodeURIComponent(name) === subjectId)
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
      const questionType = set?.questionType || "";
      const collegeName =
        typeof set?.college === "object" ? set.college?.name : "";
      const setYear = set?.year || "";
      const examId = set?.exam?._id || examType;
      const examVersionId = set?.examVersion?._id;
      const subId = set?.subject?._id || subjectId;
      const version = set.examVersion?.examVersion || "";
      const subject = set.subject?.name || currentSubjectName || "";
      // Board sets: "Dhaka - HSC (2023)"; testpaper sets: "Dhaka College 2024";
      // mockexam sets: exam name only.
      const title = collegeName
        ? `${collegeName}${setYear ? ` ${setYear}` : ""}`
        : `${board ? `${board} - ` : ""}${eName}${version ? ` (${version})` : ""}`;
      return {
        _id: set._id,
        board,
        questionType,
        collegeName,
        year: setYear,
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

  // While a type filter is active, the server response only contains that one
  // type — so the chip row is frozen from the last unfiltered load instead of
  // being recomputed live (otherwise the other chips would disappear).
  const [typeChips, setTypeChips] = useState<{ value: QuestionType; label: string }[]>([]);

  useEffect(() => {
    if (selectedQuestionType !== "All" || !subjectQuestionSets) return;
    const types = new Set<string>();
    subjectQuestionSets.forEach((set: any) => {
      if (set.questionType) types.add(set.questionType);
    });
    const next = QUESTION_TYPES.filter((t) => types.has(t.value));
    // Skip identical updates so refetches don't cause extra renders
    setTypeChips((prev) =>
      prev.length === next.length && prev.every((t, i) => t.value === next[i].value) ? prev : next
    );
  }, [subjectQuestionSets, selectedQuestionType]);

  // Keep the chosen question type for the active subject, but reset when the
  // route changes to a different exam/subject without a fresh selection.
  useEffect(() => {
    const nextType = location.state?.questionType === undefined ? "All" : (location.state?.questionType || "All");
    setSelectedQuestionType(nextType);
    setSelectedBoard("All");
  }, [examType, subjectId, location.state?.questionType]);

  useEffect(() => {
    if (isChildRoute || !examType || !subjectId || location.state?.questionType !== undefined) return;
    navigate(`/question-center/${examType}/${subjectId}/type`, {
      replace: true,
      state: {
        subjectName: currentSubjectName,
        examName,
      },
    });
  }, [examType, subjectId, isChildRoute, location.state?.questionType, navigate, currentSubjectName, examName]);

  // Reset board filter when switching away from the board type.
  useEffect(() => {
    if (selectedQuestionType !== "board") setSelectedBoard("All");
  }, [selectedQuestionType]);

  // Derive distinct board names present in the loaded sets.
  const boardChips = useMemo(() => {
    const seen = new Set<string>();
    subjectQuestionSets.forEach((set: any) => {
      if (set.board) seen.add(set.board);
    });
    return Array.from(seen).sort();
  }, [subjectQuestionSets]);

  const filteredExams = useMemo(() => {
    let result = exams;
    // Year filter (client-side)
    if (selectedYear !== "All") {
      result = result.filter((exam: any) => exam.version === selectedYear);
    }
    // Board filter (client-side) — only when board question type is selected
    if (selectedBoard !== "All") {
      result = result.filter((exam: any) => exam.board === selectedBoard);
    }
    return result;
  }, [exams, selectedYear, selectedBoard]);

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
      <div className="bg-[#111318]/95 backdrop-blur-xl border-b border-[#23262D] sticky -top-1 z-20">
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
        
        {/* Question Type Filter */}
        {typeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#23262D]/60">
            <div className="flex items-center gap-1.5 text-xs text-[#A1A8B3] mr-2">
              <Tag size={14} />
              <span>Type:</span>
            </div>
            <button
              onClick={() => setSelectedQuestionType("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedQuestionType === "All"
                  ? "text-white"
                  : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50"
              }`}
              style={selectedQuestionType === "All" ? { backgroundColor: accent } : {}}
            >
              All Types
            </button>
            {typeChips.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedQuestionType(value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedQuestionType === value
                    ? "text-white"
                    : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50"
                }`}
                style={selectedQuestionType === value ? { backgroundColor: accent } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Board Filter — visible when board question sets exist */}
        {boardChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#23262D]/60">
            <div className="flex items-center gap-1.5 text-xs text-[#A1A8B3] mr-2">
              <MapPin size={14} />
              <span>Board:</span>
            </div>
            <button
              onClick={() => setSelectedBoard("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedBoard === "All"
                  ? "text-white"
                  : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50"
              }`}
              style={selectedBoard === "All" ? { backgroundColor: accent } : {}}
            >
              All Boards
            </button>
            {boardChips.map((board) => (
              <button
                key={board}
                onClick={() => setSelectedBoard(board)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedBoard === board
                    ? "text-white"
                    : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50"
                }`}
                style={selectedBoard === board ? { backgroundColor: accent } : {}}
              >
                {board}
              </button>
            ))}
          </div>
        )}

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
                <div className="flex items-center gap-2">
                  {exam.questionType && (
                    <span className="bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {QUESTION_TYPES.find((t) => t.value === exam.questionType)?.label ||
                        exam.questionType}
                    </span>
                  )}
                  <p className="text-xs text-[#A1A8B3] font-medium">{exam.date}</p>
                </div>
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