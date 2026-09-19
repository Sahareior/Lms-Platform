import {
  useGetAnalyzedQuestionsQuery,
  useGetSubjectsByExamQuery,
  useGetQuestionsByExamQuery,
} from "@my-monorepo/store/src/redux/api/examApi";
import {
  useGetMeQuery,
  useGetExamVersionsByExamQuery,
  BANGLADESH_BOARDS,
} from "@my-monorepo/store";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  Loader2,
  LayoutGrid,
} from "lucide-react";
import AiPredictTopic from "./_components/AiPredictTopic";
import ExamSelectionScreen from "./_components/ExamSelectionScreen";
import SubjectSelectionScreen from "./_components/SubjectSelectionScreen";
import AnalysisHero, { AnalysisStats } from "./_components/AnalysisHero";
import AnalysisFilters from "./_components/AnalysisFilters";
import {
  TopSubjectsChart,
  SubjectDistributionChart,
  FrequentTopicsChart,
} from "./_components/AnalysisCharts";
import { processAnalysis } from "./_components/patternUtils";
import type { AnalysisData } from "./_components/patternUtils";
import { useTheme } from "../../../theme/ThemeContext";

/* ==================================================================
   MAIN QuestionPatterns COMPONENT
   ================================================================== */
const QuestionPatterns = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const examId = searchParams.get("examId");
  const selectedSubjectId = searchParams.get("subjectId");
  const selectedSubjectName = searchParams.get("subjectName");
  const selectedVersionId = searchParams.get("versionId");
  const selectedBoard = searchParams.get("board");
  const showAllCombined = searchParams.get("viewAll") === "true";
  const [cachedAnalysis, setCachedAnalysis] = useState<any[] | null>(null);

  const hasSubjectSelected = Boolean(selectedSubjectId || selectedSubjectName || showAllCombined);

  // Query analyzed patterns for active exam, subject, version (year), and board
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isFetching: isAnalysisFetching,
    isError: isAnalysisError,
  } = useGetAnalyzedQuestionsQuery(
    examId
      ? {
        examId,
        versionId: selectedVersionId || undefined,
        subjectId: selectedSubjectId || undefined,
        board: selectedBoard || undefined,
      }
      : undefined,
    { skip: !examId }
  );

  // Fallback broad query (exam-wide) to populate global subjects/counts if filtered query is empty
  const {
    data: broadAnalysisData,
    isLoading: isBroadLoading,
  } = useGetAnalyzedQuestionsQuery(
    examId ? { examId } : undefined,
    { skip: !examId }
  );

  // Remember the last successfully loaded analysis
  useEffect(() => {
    if (analysisData && analysisData.length > 0) {
      setCachedAnalysis(analysisData);
    } else if (!isAnalysisLoading && analysisData && analysisData.length === 0) {
      setCachedAnalysis(null);
    }
  }, [analysisData, isAnalysisLoading]);

  // When filters are active, visible analysis must reflect analysisData directly
  // (do not fall back to broad exam-wide data when filtered data is empty)
  const isFiltered = Boolean(selectedVersionId || selectedBoard || selectedSubjectId || selectedSubjectName);

  const visibleAnalysis =
    isAnalysisLoading && cachedAnalysis
      ? cachedAnalysis
      : analysisData && analysisData.length > 0
        ? analysisData
        : isFiltered
          ? []
          : broadAnalysisData;

  const {
    data: examVersions = [],
    isLoading: isVersionsLoading,
  } = useGetExamVersionsByExamQuery(examId || "", { skip: !examId });

  const { data: subjects = [], isLoading: isSubjectsLoading } = useGetSubjectsByExamQuery(
    examId || "",
    { skip: !examId }
  );

  const { data: questionSets = [] } = useGetQuestionsByExamQuery(
    { examId: examId! },
    { skip: !examId }
  );

  const { data: userData } = useGetMeQuery();

  // Find current exam name from user's selected exams or question sets
  const currentExam = useMemo<any>(() => {
    if (!examId) return null;
    if (userData?.selectedExams) {
      const found = userData.selectedExams.find((ex: any) => ex._id === examId);
      if (found) return found;
    }
    if (questionSets && questionSets.length > 0 && questionSets[0]?.exam) {
      return questionSets[0].exam;
    }
    return null;
  }, [examId, userData, questionSets]);

  // Filter versions with questions or all exam versions
  const examVersionWithQuestions = useMemo(() => {
    if (!examVersions || examVersions.length === 0) return [];
    const withQuestions = examVersions.filter((examV: any) => examV?.questions?.length > 0);
    return withQuestions.length > 0 ? withQuestions : examVersions;
  }, [examVersions]);

  // Find currently selected exam version object (Year)
  const currentVersion = useMemo(() => {
    if (!selectedVersionId || examVersions.length === 0) return null;
    return examVersions.find((v: any) => v._id === selectedVersionId) || null;
  }, [selectedVersionId, examVersions]);

  // When viewing subject patterns, ensure first Year and Board are always set in the URL
  useEffect(() => {
    if (!hasSubjectSelected) return;

    let changed = false;
    const next = new URLSearchParams(searchParams);

    if (examVersionWithQuestions.length > 0) {
      const isValid = examVersionWithQuestions.some((v: any) => v._id === selectedVersionId);
      if (!selectedVersionId || !isValid) {
        next.set("versionId", examVersionWithQuestions[0]._id);
        changed = true;
      }
    }

    if (BANGLADESH_BOARDS.length > 0) {
      const isValid = selectedBoard && BANGLADESH_BOARDS.includes(selectedBoard as any);
      if (!selectedBoard || !isValid) {
        next.set("board", BANGLADESH_BOARDS[0]);
        changed = true;
      }
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [hasSubjectSelected, examVersionWithQuestions, selectedVersionId, selectedBoard, searchParams, setSearchParams]);

  // Build subject list: combine subjects fetched from API with analysis & question set subjects
  const subjectMap = useMemo(() => {
    const map = new Map<string, { _id: string; name: string; code?: string; description?: string }>();
    if (Array.isArray(subjects)) {
      subjects.forEach((s: any) => {
        if (s?._id && s?.name) {
          map.set(s.name.trim().toLowerCase(), {
            _id: s._id,
            name: s.name,
            code: s.code,
            description: s.description,
          });
        }
      });
    }
    if (Array.isArray(questionSets)) {
      questionSets.forEach((qs: any) => {
        const sName = qs?.subject?.name || qs?.subjectName;
        const sId = qs?.subject?._id || qs?.subject;
        if (sName) {
          const key = sName.trim().toLowerCase();
          if (!map.has(key)) {
            map.set(key, { _id: sId || sName, name: sName, code: qs?.subject?.code });
          }
        }
      });
    }
    return map;
  }, [subjects, questionSets]);

  const subjectOptions = useMemo(() => Array.from(subjectMap.values()), [subjectMap]);

  // Process broad API data for subject question counts
  const broadProcessed = useMemo(
    () => processAnalysis(broadAnalysisData as AnalysisData[] | undefined),
    [broadAnalysisData]
  );

  // Process active API data with active subject filter
  const processedData = useMemo(
    () => processAnalysis(
      visibleAnalysis && visibleAnalysis.length > 0
        ? (visibleAnalysis as AnalysisData[])
        : null,
      selectedSubjectName
    ),
    [visibleAnalysis, selectedSubjectName]
  );

  const handleSelectExam = (id: string) => {
    setCachedAnalysis(null);
    setSearchParams({ examId: id });
  };

  const handleClearExam = () => {
    setCachedAnalysis(null);
    setSearchParams({});
  };

  const handleSubjectSelect = (id: string | null, name: string | null) => {
    const params = new URLSearchParams();
    if (examId) params.set("examId", examId);

    if (id && name) {
      params.set("subjectId", id);
      params.set("subjectName", name);
    } else {
      params.set("viewAll", "true");
    }

    // Auto-select first available Year (exam version)
    if (examVersionWithQuestions.length > 0) {
      params.set("versionId", examVersionWithQuestions[0]._id);
    }

    // Auto-select first available Board
    if (BANGLADESH_BOARDS.length > 0) {
      params.set("board", BANGLADESH_BOARDS[0]);
    }

    setCachedAnalysis(null);
    setSearchParams(params);
  };

  const handleBackToSubjectSelection = () => {
    const params = new URLSearchParams();
    if (examId) params.set("examId", examId);
    setCachedAnalysis(null);
    setSearchParams(params);
  };

  const handleViewAllCombined = () => {
    handleSubjectSelect(null, null);
  };

  const handleVersionSelect = (versionId: string | null) => {
    if (!versionId) return;
    const params = new URLSearchParams(searchParams);
    params.set("versionId", versionId);
    setCachedAnalysis(null);
    setSearchParams(params);
  };

  const handleBoardSelect = (board: string | null) => {
    if (!board) return;
    const params = new URLSearchParams(searchParams);
    params.set("board", board);
    setCachedAnalysis(null);
    setSearchParams(params);
  };

  // ═══════════════════ STEP 1: EXAM SELECTION ═══════════════════
  if (!examId) {
    return <ExamSelectionScreen onSelectExam={handleSelectExam} />;
  }

  // ═══════════════════ STEP 2: SUBJECT SELECTION SCREEN ═══════════════════
  // When exam is chosen and user has not picked a subject yet and not viewing all combined
  if (!hasSubjectSelected) {
    if (isSubjectsLoading && subjectOptions.length === 0) {
      return (
        <div className={`flex-1 min-h-screen font-sans flex items-center justify-center ${isDark ? "bg-[#0B0D12]" : "bg-[#e8e4db]"}`}>
          <div className="text-center space-y-4">
            <Loader2 size={32} className={`animate-spin mx-auto ${isDark ? "text-[#9B51E0]" : "text-[#b91c1c]"}`} />
            <p className={isDark ? "text-[#A1A8B3] font-medium" : "text-[#4a4a4a] font-serif italic"}>Loading subjects...</p>
          </div>
        </div>
      );
    }

    return (
      <SubjectSelectionScreen
        examName={currentExam?.name || "Exam"}
        subjects={subjectOptions}
        rawSubjectsCount={broadProcessed?.raw?.subjects || {}}
        onSelectSubject={(id, name) => handleSubjectSelect(id, name)}
        onViewAllCombined={handleViewAllCombined}
        onChangeExam={handleClearExam}
      />
    );
  }

  // ═══════════════════ STEP 3: PATTERN ANALYSIS LOADING ═══════════════════
  if ((isAnalysisLoading || isVersionsLoading) && !visibleAnalysis && !cachedAnalysis) {
    return (
      <div className={`flex-1 min-h-screen font-sans flex items-center justify-center ${isDark ? "bg-[#0B0D12]" : "bg-[#e8e4db]"}`}>
        <div className="text-center space-y-4">
          <Loader2 size={32} className={`animate-spin mx-auto ${isDark ? "text-[#9B51E0]" : "text-[#b91c1c]"}`} />
          <p className={isDark ? "text-[#A1A8B3] font-medium" : "text-[#4a4a4a] font-serif italic"}>Analyzing question patterns...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════ ERROR / NO DATA ═══════════════════
  if (isAnalysisError && !visibleAnalysis && !processedData) {
    return (
      <div className={`flex-1 min-h-screen font-sans flex items-center justify-center ${isDark ? "bg-[#0B0D12]" : "bg-[#e8e4db]"}`}>
        <div className={`text-center max-w-md p-8 rounded-2xl border ${isDark ? "bg-[#111318] border-[#23262D]" : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"}`}>
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className={isDark ? "text-lg font-bold text-[#EB5757] mb-2" : "text-lg font-black text-[#b91c1c] mb-2 font-serif"}>Unable to load analysis</h3>
          <p className={isDark ? "text-[#A1A8B3] text-sm mb-4" : "text-[#4a4a4a] text-sm mb-4 font-serif italic"}>
            No question patterns found for this selection. Try uploading a question paper or selecting another subject.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleBackToSubjectSelection}
              className={isDark ? "inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#1C1F26] transition-all" : "inline-flex items-center gap-2 bg-[#e8e4db] text-[#1a1a1a] border border-[#d8d4cb] px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#f7f3ec] transition-all font-serif"}
            >
              Choose Another Subject
            </button>
            <button
              onClick={handleClearExam}
              className={isDark ? "inline-flex items-center gap-2 bg-[#9B51E0] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#8A40CE] transition-all" : "inline-flex items-center gap-2 bg-[#1a1a1a] text-[#f2efe9] px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#2a2a2a] transition-all shadow-[3px_3px_0px_0px_#b91c1c] font-serif"}
            >
              Change Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { raw, totalQuestions, topSubjects, topTopics, subjectCount, topicCount } =
    processedData || {
      raw: { subjects: {}, categorized_questions: [] },
      totalQuestions: 0,
      topSubjects: [],
      topTopics: [],
      subjectCount: 0,
      topicCount: 0,
    };

  /* ═══════════════════ STEP 3: SUBJECT QUESTION PATTERN ANALYSIS ═══════════════════ */
  return (
    <div className={`flex-1 min-h-screen font-sans ${isDark ? "text-[#F5F7FA] bg-[#0B0D12]" : "text-[#1a1a1a] bg-[#e8e4db]"}`}>
      <div className="max-w-8xl mx-auto py-6 sm:px-3 space-y-7">
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${isDark ? "border-[#23262D]/60" : "border-[#d8d4cb]"}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToSubjectSelection}
              className={isDark ? "inline-flex items-center gap-2 text-xs font-bold text-[#A1A8B3] hover:text-[#F5F7FA] bg-[#161920] px-3.5 py-2 rounded-xl border border-[#23262D] hover:border-[#323742] transition-all group" : "inline-flex items-center gap-2 text-xs font-bold text-[#1a1a1a] hover:text-[#b91c1c] bg-[#f2efe9] px-3.5 py-2 rounded-xl border border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a] transition-all group font-serif"}
            >
              <LayoutGrid size={14} className={isDark ? "text-[#00E5B3]" : "text-[#1a1a1a]"} />
              <span>All Subjects</span>
            </button>

            <button
              onClick={handleClearExam}
              className={isDark ? "inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#A1A8B3] transition-colors" : "inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors font-serif"}
            >
              <ArrowRight size={13} className="rotate-180" />
              <span>Change Exam</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentExam && (
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${isDark ? "text-[#A1A8B3] bg-[#111318] border-[#23262D]" : "text-[#1a1a1a] bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a] font-serif"}`}>
                <GraduationCap size={13} className="text-[#9B51E0]" />
                <span>{currentExam.name}</span>
              </div>
            )}

            {selectedSubjectName && (
              <div className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border ${isDark ? "text-[#00C8FF] bg-[#00C8FF]/10 border-[#00C8FF]/30" : "text-[#1a1a1a] bg-[#e8e4db] border-[#d8d4cb] font-serif"}`}>
                <span>{selectedSubjectName}</span>
              </div>
            )}
          </div>
        </div>

        <AnalysisHero
          examName={currentExam?.name || null}
          subjectName={selectedSubjectName}
          versionName={currentVersion?.examVersion}
          boardName={selectedBoard}
          topicCount={topicCount}
          totalQuestions={totalQuestions}
        />

        <AnalysisStats
          totalQuestions={totalQuestions}
          topicCount={topicCount}
          subjectCount={selectedSubjectName ? 1 : subjectCount}
        />

        <AnalysisFilters
          subjectOptions={subjectOptions}
          rawSubjects={broadProcessed?.raw?.subjects || raw.subjects}
          selectedSubjectId={selectedSubjectId}
          selectedSubjectName={selectedSubjectName}
          onSubjectSelect={handleSubjectSelect}
          versions={examVersionWithQuestions}
          selectedVersionId={selectedVersionId}
          onVersionSelect={handleVersionSelect}
          selectedBoard={selectedBoard}
          onBoardSelect={handleBoardSelect}
          isFetching={isAnalysisFetching}
          examName={currentExam?.name}
        />

        {totalQuestions > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TopSubjectsChart topSubjects={topSubjects} totalQuestions={totalQuestions} />
            <SubjectDistributionChart
              topSubjects={topSubjects}
              totalQuestions={totalQuestions}
              examName={selectedSubjectName || currentExam?.name}
            />
            <FrequentTopicsChart topTopics={topTopics} raw={raw} />
          </div>
        ) : (
          <div className={`p-10 text-center rounded-2xl border space-y-4 max-w-xl mx-auto ${isDark ? "bg-[#111318] border-[#23262D] shadow-lg shadow-black/20" : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"}`}>
            <div className="space-y-1.5">
              <h4 className={isDark ? "text-lg font-extrabold text-[#F5F7FA] tracking-tight" : "text-lg font-black text-[#1a1a1a] tracking-tight font-serif"}>
                Not Analyzed Yet
              </h4>
              <p className={isDark ? "text-xs text-[#A1A8B3] max-w-md mx-auto leading-relaxed" : "text-xs text-[#4a4a4a] max-w-md mx-auto leading-relaxed font-serif italic"}>
                No question paper patterns have been analyzed yet for{" "}
                {selectedSubjectName ? (
                  <span className={isDark ? "text-[#00C8FF] font-semibold" : "text-[#1a1a1a] font-semibold"}>{selectedSubjectName}</span>
                ) : (
                  "this subject"
                )}
                {currentVersion?.examVersion ? (
                  <> in <span className={isDark ? "text-[#2F80ED] font-semibold" : "text-[#1a1a1a] font-semibold"}>{currentVersion.examVersion}</span></>
                ) : null}
                {selectedBoard ? (
                  <> (<span className={isDark ? "text-[#F2C94C] font-semibold" : "text-[#b91c1c] font-semibold"}>{selectedBoard} Board</span>)</>
                ) : null}.
              </p>
            </div>
            <p className={isDark ? "text-[11px] text-[#6B7280]" : "text-[11px] text-[#4a4a4a] font-serif italic"}>
              Upload and analyze question papers for this Year and Board to see topic breakdowns and frequent patterns.
            </p>
          </div>
        )}

        <AiPredictTopic examId={examId} />
      </div>
    </div>
  );
};

export default QuestionPatterns;


