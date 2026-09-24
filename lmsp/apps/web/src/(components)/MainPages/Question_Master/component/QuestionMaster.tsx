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
import { useTheme } from '../../../../theme/ThemeContext';

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
  const { examType, subjectId } = useParams<{ examType: string; subjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const [selectedYear, setSelectedYear] = useState<string>("All");
  const resolvedQuestionType = location.state?.questionType === undefined ? "All" : (location.state?.questionType || "All");
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>(resolvedQuestionType);
  const [selectedBoard, setSelectedBoard] = useState<string>("All");

  const isChildRoute =
    location.pathname.includes("/exam-din") ||
    location.pathname.includes("/question-view");

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

  const [typeChips, setTypeChips] = useState<{ value: QuestionType; label: string }[]>([]);

  useEffect(() => {
    if (selectedQuestionType !== "All" || !subjectQuestionSets) return;
    const types = new Set<string>();
    subjectQuestionSets.forEach((set: any) => {
      if (set.questionType) types.add(set.questionType);
    });
    const next = QUESTION_TYPES.filter((t) => types.has(t.value));
    setTypeChips((prev) =>
      prev.length === next.length && prev.every((t, i) => t.value === next[i].value) ? prev : next
    );
  }, [subjectQuestionSets, selectedQuestionType]);

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

  useEffect(() => {
    if (selectedQuestionType !== "board") setSelectedBoard("All");
  }, [selectedQuestionType]);

  const boardChips = useMemo(() => {
    const seen = new Set<string>();
    subjectQuestionSets.forEach((set: any) => {
      if (set.board) seen.add(set.board);
    });
    return Array.from(seen).sort();
  }, [subjectQuestionSets]);

  const filteredExams = useMemo(() => {
    let result = exams;
    if (selectedYear !== "All") {
      result = result.filter((exam: any) => exam.version === selectedYear);
    }
    if (selectedBoard !== "All") {
      result = result.filter((exam: any) => exam.board === selectedBoard);
    }
    return result;
  }, [exams, selectedYear, selectedBoard]);

  const accent = examType ? categoryAccent[examType] || "#9B51E0" : "#9B51E0";

  if (isChildRoute) {
    return <Outlet />;
  }

  if (!examType) {
    navigate("/question-center", { replace: true });
    return null;
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0B0D12]' : 'bg-[#e8e4db]'}`}>
        <div className="text-center">
          <Loader2 size={36} className={`animate-spin mx-auto mb-4 ${isDark ? 'text-[#9B51E0]' : 'text-[#b91c1c]'}`} />
          <p className={`font-medium ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>Loading question sets...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (isError || !questionSets) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0B0D12]' : 'bg-[#e8e4db]'}`}>
        <div className={`text-center max-w-md p-8 rounded-2xl border ${isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]'}`}>
          <AlertCircle size={32} className="text-[#EB5757] mx-auto mb-3" />
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif font-black'}`}>Failed to load</h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
            Could not load question sets for this subject.
          </p>
          <button
            onClick={() => navigate(`/question-center/${examType}`)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              isDark 
                ? 'bg-[#161920] text-[#F5F7FA] border border-[#23262D] hover:bg-[#1C1F26]' 
                : 'bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]'
            }`}
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  // Helper for filter chip styles
  const getChipStyle = (isSelected: boolean) => {
    if (isDark) {
      return isSelected
        ? "text-white"
        : "bg-[#111318] text-[#A1A8B3] border border-[#23262D] hover:border-[#9B51E0]/50";
    }
    return isSelected
      ? "text-[#f2efe9] border border-[#1a1a1a] font-serif"
      : "bg-[#f2efe9] text-[#1a1a1a] border border-[#d8d4cb] hover:shadow-[2px_2px_0px_0px_#1a1a1a] font-serif";
  };

  const getChipBg = (isSelected: boolean) => {
    if (isSelected) {
      return { backgroundColor: isDark ? accent : "#1a1a1a" };
    }
    return {};
  };

  return (
    <div 
      className={`min-h-screen ${isDark ? 'bg-[#0B0D12] text-[#F5F7FA]' : 'bg-[#e8e4db] text-[#1a1a1a]'}`}
      style={!isDark ? {
        backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      } : undefined}
    >
      <div className={`sticky -top-1 z-20 border-b backdrop-blur-xl ${isDark ? 'bg-[#111318]/95 border-[#23262D]' : 'bg-[#f2efe9]/95 border-[#d8d4cb] shadow-[0_3px_0px_0px_#1a1a1a]'}`}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() =>
                  navigate(`/question-center/${examType}/${subjectId}/type`, {
                    state: location.state,
                  })
                }
                className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                  isDark 
                    ? 'bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#1C1F26] hover:border-[#9B51E0]/40' 
                    : 'bg-[#f2efe9] border-[#d8d4cb] text-[#4a4a4a] hover:text-[#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]'
                }`}
                title="Back to Question Types"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isDark 
                      ? 'bg-[#9B51E0]/15 text-[#9B51E0] border border-[#9B51E0]/30' 
                      : 'bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] font-serif'
                  }`}>
                    {examName}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-[#6B7280]' : 'text-[#4a4a4a]'}`}>/</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-[#00C8FF]' : 'text-[#b91c1c] font-serif font-bold'}`}>
                    {currentSubjectName}
                  </span>
                </div>
                <h1 className={`text-xl sm:text-2xl font-extrabold mt-1 tracking-tight ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif font-black'}`}>
                  Question Sets
                </h1>
              </div>
            </div>

            {filteredExams.length > 0 && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                isDark 
                  ? 'bg-[#161920] border-[#23262D] text-[#A1A8B3]' 
                  : 'bg-[#f2efe9] border-[#d8d4cb] text-[#1a1a1a] font-serif shadow-[1px_1px_0px_0px_#1a1a1a]'
              }`}>
                <Layers size={14} className={isDark ? 'text-[#9B51E0]' : 'text-[#b91c1c]'} />
                <span>{filteredExams.length} {filteredExams.length === 1 ? "Set" : "Sets"} Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-24">
        {typeChips.length > 0 && (
          <div className={`flex items-center gap-2 flex-wrap pb-2 border-b ${isDark ? 'border-[#23262D]/60' : 'border-[#d8d4cb]'}`}>
            <div className={`flex items-center gap-1.5 text-xs mr-2 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif'}`}>
              <Tag size={14} />
              <span>Type:</span>
            </div>
            <button
              onClick={() => setSelectedQuestionType("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${getChipStyle(selectedQuestionType === "All")}`}
              style={getChipBg(selectedQuestionType === "All")}
            >
              All Types
            </button>
            {typeChips.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedQuestionType(value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${getChipStyle(selectedQuestionType === value)}`}
                style={getChipBg(selectedQuestionType === value)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {boardChips.length > 0 && (
          <div className={`flex items-center gap-2 flex-wrap pb-2 border-b ${isDark ? 'border-[#23262D]/60' : 'border-[#d8d4cb]'}`}>
            <div className={`flex items-center gap-1.5 text-xs mr-2 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif'}`}>
              <MapPin size={14} />
              <span>Board:</span>
            </div>
            <button
              onClick={() => setSelectedBoard("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${getChipStyle(selectedBoard === "All")}`}
              style={getChipBg(selectedBoard === "All")}
            >
              All Boards
            </button>
            {boardChips.map((board) => (
              <button
                key={board}
                onClick={() => setSelectedBoard(board)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${getChipStyle(selectedBoard === board)}`}
                style={getChipBg(selectedBoard === board)}
              >
                {board}
              </button>
            ))}
          </div>
        )}

        {examYearArray.length > 0 && (
          <div className={`flex items-center gap-2 flex-wrap pb-2 border-b ${isDark ? 'border-[#23262D]/60' : 'border-[#d8d4cb]'}`}>
            <div className={`flex items-center gap-1.5 text-xs mr-2 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif'}`}>
              <Calendar size={14} />
              <span>Year:</span>
            </div>
            <button
              onClick={() => setSelectedYear("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${getChipStyle(selectedYear === "All")}`}
              style={getChipBg(selectedYear === "All")}
            >
              All Years
            </button>
            {examYearArray.map((year: string) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${getChipStyle(selectedYear === year)}`}
                style={getChipBg(selectedYear === year)}
              >
                {year || "Unknown"}
              </button>
            ))}
          </div>
        )}

        {filteredExams.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border max-w-md mx-auto p-8 ${isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]'}`}>
            <FileText size={36} className={`mx-auto mb-3 ${isDark ? 'text-[#6B7280]' : 'text-[#1a1a1a]'}`} />
            <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif font-black'}`}>No question sets found</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
              There are no question sets available for this subject in the selected year.
            </p>
            <button
              onClick={() => navigate(`/question-center/${examType}`)}
              className={`border px-4 py-2 rounded-xl text-xs font-bold transition ${
                isDark 
                  ? 'bg-[#161920] text-[#F5F7FA] border-[#23262D] hover:bg-[#1C1F26]' 
                  : 'bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]'
              }`}
            >
              Back to Subjects
            </button>
          </div>
        ) : (
          filteredExams.map((exam: any) => (
            <div
              key={exam._id}
              className={`rounded-2xl border p-6 group transition-all duration-300 ${
                isDark 
                  ? 'bg-[#111318] border-[#23262D] hover:border-[#9B51E0]/50 hover:shadow-[0_0_20px_-5px_rgba(155,81,224,0.3)]' 
                  : 'bg-[#f2efe9] border-[#d8d4cb] hover:shadow-[4px_4px_0px_0px_#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {exam.questionType && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isDark 
                        ? 'bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30' 
                        : 'bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] font-serif uppercase tracking-wider'
                    }`}>
                      {QUESTION_TYPES.find((t) => t.value === exam.questionType)?.label || exam.questionType}
                    </span>
                  )}
                  <p className={`text-xs font-medium ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>{exam.date}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                  isDark 
                    ? 'bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30' 
                    : 'bg-[#f2efe9] text-[#1a1a1a] border border-[#1a1a1a] font-serif uppercase tracking-wider'
                }`}>
                  {exam.status}
                </span>
              </div>

              <h2 className={`font-bold text-lg sm:text-xl mb-2 transition-colors ${
                isDark ? 'text-[#F5F7FA] group-hover:text-[#9B51E0]' : 'text-[#1a1a1a] font-serif font-black'
              }`}>
                {exam.title}
              </h2>

              <p className={`leading-relaxed mb-6 text-sm ${isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a] font-serif italic'}`}>
                {exam.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    const matchedSet = questionSets?.find((s: any) => s._id === exam._id);
                    const targetSubjectId = subjectId || exam.subjectId;
                    navigate(`/question-center/${examType}/${targetSubjectId}/question-view?setId=${exam._id}`, {
                      state: {
                        questions: matchedSet?.data || [],
                        examTitle: exam.title,
                        subject: exam.subject,
                        questionSetId: exam._id,
                        examId: exam.examId,
                        subjectId: targetSubjectId,
                        examVersionId: exam.examVersionId,
                      },
                    });
                  }}
                  className={`border rounded-xl py-3 font-bold text-sm transition-all text-center ${
                    isDark 
                      ? 'border-[#23262D] text-[#A1A8B3] hover:bg-[#161920] hover:border-[#323742] hover:text-[#F5F7FA]' 
                      : 'border-[#d8d4cb] text-[#1a1a1a] hover:shadow-[2px_2px_0px_0px_#1a1a1a] font-serif shadow-[1px_1px_0px_0px_#1a1a1a]'
                  }`}
                >
                  প্রশ্ন দেখুন
                </button>
                <button
                  onClick={() => {
                    const matchedSet = questionSets?.find((s: any) => s._id === exam._id);
                    const targetSubjectId = subjectId || exam.subjectId;
                    navigate(`/question-center/${examType}/${targetSubjectId}/exam-din?setId=${exam._id}`, {
                      state: {
                        questions: matchedSet?.data || [],
                        examTitle: exam.title,
                        subject: exam.subject,
                        questionSetId: exam._id,
                        examId: exam.examId,
                        subjectId: targetSubjectId,
                        examVersionId: exam.examVersionId,
                      },
                    });
                  }}
                  className={`rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98] text-center ${
                    isDark ? 'text-white' : 'text-[#f2efe9] font-serif border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'
                  }`}
                  style={{
                    backgroundColor: isDark ? accent : "#1a1a1a",
                    boxShadow: isDark ? `0 4px 14px ${accent}40` : undefined,
                  }}
                >
                  পরীক্ষা দিন
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Outlet />
    </div>
  );
}