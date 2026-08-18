import {
  useGetAnalyzedQuestionsQuery,
  useGetSubjectsByExamQuery,
} from "@my-monorepo/store/src/redux/api/examApi";
import { useGetMeQuery, useGetExamVersionsByExamQuery } from "@my-monorepo/store";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  Loader2,
} from "lucide-react";
import AiPredictTopic from "./_components/AiPredictTopic";
import ExamSelectionScreen from "./_components/ExamSelectionScreen";
import AnalysisHero, { AnalysisStats } from "./_components/AnalysisHero";
import AnalysisFilters from "./_components/AnalysisFilters";
import {
  TopSubjectsChart,
  SubjectDistributionChart,
  FrequentTopicsChart,
} from "./_components/AnalysisCharts";
import { processAnalysis } from "./_components/patternUtils";
import type { AnalysisData } from "./_components/patternUtils";

/* ==================================================================
   MAIN QuestionPatterns COMPONENT
   ================================================================== */
const QuestionPatterns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const examId = searchParams.get("examId");

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [cachedAnalysis, setCachedAnalysis] = useState<any[] | null>(null);

  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isFetching: isAnalysisFetching,
    isError: isAnalysisError,
  } = useGetAnalyzedQuestionsQuery(
    examId ? { examId, versionId: selectedVersionId || undefined } : undefined,
    { skip: !examId }
  );

  // Remember the last successfully loaded analysis so switching version tabs
  // keeps the current charts visible (this RTK Query version has no keepPreviousData flag).
  useEffect(() => {
    if (analysisData && analysisData.length > 0) {
      setCachedAnalysis(analysisData);
    }
  }, [analysisData]);

  // While a new version is being fetched, show the previously loaded data;
  // once the fetch settles, use the fresh result (even if it's empty).
  const visibleAnalysis = isAnalysisLoading && cachedAnalysis ? cachedAnalysis : analysisData;

  const {
    data: examVersions = [],
    isLoading: isVersionsLoading,
  } = useGetExamVersionsByExamQuery(examId || "", { skip: !examId });

  const { data: subjects } = useGetSubjectsByExamQuery(examId || "", { skip: !examId });

  const { data: userData } = useGetMeQuery();

  // Find the current exam name from user's selected exams
  const currentExam = useMemo<any>(() => {
    if (!examId || !userData?.selectedExams) return null;
    return userData.selectedExams.find((ex: any) => ex._id === examId);
  }, [examId, userData]);

  const examVersionWithQuestions = examVersions?.filter(examV => (
    examV?.questions?.length > 0
  ));

  // Find the currently selected exam version object
  const currentVersion = useMemo(() => {
    if (!selectedVersionId || examVersionWithQuestions.length === 0) return null;
    return examVersionWithQuestions.find((v: any) => v._id === selectedVersionId) || null;
  }, [selectedVersionId, examVersionWithQuestions]);

  // Process API data
  const processedData = useMemo(
    () => processAnalysis(
      visibleAnalysis && visibleAnalysis.length > 0
        ? (visibleAnalysis[0] as AnalysisData)
        : null
    ),
    [visibleAnalysis]
  );

  const handleSelectExam = (id: string) => {
    setSearchParams({ examId: id });
    setSelectedSubject(null);
    setSelectedVersionId(null);
    setCachedAnalysis(null);
  };

  const handleClearExam = () => {
    setSearchParams({});
    setSelectedSubject(null);
    setSelectedVersionId(null);
    setCachedAnalysis(null);
  };

  // ═══════════════════ SHOW EXAM SELECTION ═══════════════════
  if (!examId) {
    return <ExamSelectionScreen onSelectExam={handleSelectExam} />;
  }

  // ═══════════════════ LOADING ═══════════════════
  // Show the full-screen loader only when nothing has loaded yet; version
  // switches keep previous charts visible via cachedAnalysis.
  if ((isAnalysisLoading || isVersionsLoading) && !visibleAnalysis) {
    return (
      <div className="flex-1 min-h-screen font-sans flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-[#9B51E0] mx-auto" />
          <p className="text-[#A1A8B3] font-medium">Analyzing question patterns...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════ ERROR / NO DATA ═══════════════════
  if (isAnalysisError || !processedData) {
    return (
      <div className="flex-1 min-h-screen font-sans flex items-center justify-center bg-[#0B0D12]">
        <div className="text-center max-w-md p-8 bg-[#111318] rounded-2xl border border-[#23262D]">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-[#EB5757] mb-2">Unable to load analysis</h3>
          <p className="text-[#A1A8B3] text-sm mb-4">
            No question patterns found for this exam yet. Try uploading a question paper first.
          </p>
          <button
            onClick={handleClearExam}
            className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1C1F26] transition-all"
          >
            Choose Another Exam
          </button>
        </div>
      </div>
    );
  }

  const { raw, totalQuestions, topSubjects, topTopics, subjectCount, topicCount } = processedData;

  // Build the subject filter list: merge subjects from analysis with the subjects fetched by exam
  const analysisSubjectNames = Object.keys(raw.subjects);
  const examSubjects = subjects || [];
  const subjectOptions = examSubjects.length > 0
    ? examSubjects.map((s: any) => ({ name: s.name, _id: s._id }))
    : analysisSubjectNames.map((name) => ({ name, _id: name }));

  /* ═══════════════════ RENDER ANALYSIS PAGE ═══════════════════ */
  return (
    <div className="flex-1 min-h-screen font-sans text-[#F5F7FA] bg-[#0B0D12]">
      <div className="max-w-8xl mx-auto py-6 px-2 space-y-7">
        {/* ── TOP NAV BACK ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClearExam}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A8B3] hover:text-[#F5F7FA] transition-colors group"
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            <span>Change Exam</span>
          </button>
          {currentExam && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F5F7FA] bg-[#111318] px-3 py-1.5 rounded-xl border border-[#23262D]">
              <GraduationCap size={13} className="text-[#9B51E0]" />
              <span>{currentExam.name}</span>
            </div>
          )}
        </div>

        {/* ═══════════ HERO HEADER ═══════════ */}
        <AnalysisHero
          examName={currentExam?.name || null}
          versionName={currentVersion?.examVersion}
          topicCount={raw.categorized_questions.length}
          totalQuestions={totalQuestions}
        />

        {/* ═══════════ STATS ═══════════ */}
        <AnalysisStats
          totalQuestions={totalQuestions}
          topicCount={topicCount}
          subjectCount={subjectCount}
        />

        {/* ═══════════ FILTERS ═══════════ */}
        <AnalysisFilters
          versions={examVersionWithQuestions}
          selectedVersionId={selectedVersionId}
          onVersionSelect={setSelectedVersionId}
          subjectOptions={subjectOptions}
          rawSubjects={raw.subjects}
          selectedSubject={selectedSubject}
          onSubjectSelect={setSelectedSubject}
          isFetching={isAnalysisFetching}
        />

        {/* ═══════════ CHARTS ROW ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopSubjectsChart topSubjects={topSubjects} totalQuestions={totalQuestions} />
          <SubjectDistributionChart
            topSubjects={topSubjects}
            totalQuestions={totalQuestions}
            examName={currentExam?.name}
          />
          <FrequentTopicsChart topTopics={topTopics} raw={raw} />
        </div>

        {/* ═══════════ AI PREDICTED TOPICS ═══════════ */}
        <AiPredictTopic examId={examId} />

      </div>
    </div>
  );
};

export default QuestionPatterns;
