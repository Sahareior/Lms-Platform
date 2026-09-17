import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Target,
  XCircle,
} from 'lucide-react';
import {
  useAppSelector,
  useAppDispatch,
  setAiReport,
  setAiReportLoading,
  setAiReportError,
  setAiReportHistory,
  clearCurrentReport,
  useGetOrGenerateAiPerformanceMutation,
  useGetAiPerformanceHistoryQuery,
  useGetMeQuery,
} from '@my-monorepo/store';
import { skipToken } from '@reduxjs/toolkit/query/react';
import PerfHeader from './_components/PerfHeader';
import PerfStatsCards from './_components/PerfStatsCards';
import RadarChartCard from './_components/RadarChartCard';
import AccuracyTrendCard from './_components/AccuracyTrendCard';
import SubjectPerformanceTable from './_components/SubjectPerformanceTable';
import StudyPlanCard from './_components/StudyPlanCard';
import StrengthsWeakAreas from './_components/StrengthsWeakAreas';
import MistakeBreakdown from './_components/MistakeBreakdown';
import SavedReportsModal from './_components/SavedReportsModal';

const Performance = () => {
  // ─── AI Performance Report from store ──────────────────────
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  // ─── Exam selection (per-exam AI report) ──────────────────
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [savedReportsOpen, setSavedReportsOpen] = useState(false);
  const initialLoadDone = useRef(false);

  // Read the report scoped to the selected exam ('all' = combined across every
  // selected exam). Each scope lives in its own Redux slot, so switching exams
  // here never overwrites the Dashboard's combined 'all' report.
  const scope = selectedExamId ?? 'all';
  const aiEntry = useAppSelector((state) => state.aiPerformance.reports[scope]);
  const aiReport = aiEntry?.report ?? null;
  const aiReportLoading = aiEntry?.isLoading ?? false;
  const previous = aiEntry?.previous ?? null;
  const isCached = aiEntry?.isCached ?? false;
  const generatedAt = aiEntry?.generatedAt ?? null;
  const aiError = aiEntry?.error ?? null;
  const history = useAppSelector((state) => state.aiPerformance.history);
  const aiStats = aiReport?.stats;
  const aiInsights = aiReport?.ai_report;
  const [getOrGenerateAiPerformance, { isLoading: isRegenerating }] =
    useGetOrGenerateAiPerformanceMutation();

  const { data: userData } = useGetMeQuery();

  // Fetch the AI report whenever the exam selection changes (null = all exams).
  // Relies on App.tsx loading the overall report on mount, so the initial
  // all-exams fetch is skipped here to avoid a redundant request.
  useEffect(() => {
    if (!user?._id) return;
    if (selectedExamId === null && !initialLoadDone.current) {
      initialLoadDone.current = true;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        dispatch(setAiReportLoading({ scope, isLoading: true }));
        const res = await getOrGenerateAiPerformance({
          userId: user._id,
          examId: selectedExamId || undefined,
        }).unwrap();
        if (cancelled) return;
        if (res.empty || !res.stats || !res.ai_report) {
          dispatch(clearCurrentReport({ scope }));
          return;
        }
        dispatch(
          setAiReport({
            scope,
            report: {
              success: res.success,
              stats: res.stats,
              ai_report: res.ai_report,
            },
            previous: res.previous,
            isCached: res.cached,
            generatedAt: res.generatedAt,
          })
        );
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          dispatch(setAiReportError({ scope, error: 'Failed to load AI performance report' }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id, selectedExamId, getOrGenerateAiPerformance, dispatch]);

  // Per-exam history for the progress-over-time trend chart
  const { data: historyData } = useGetAiPerformanceHistoryQuery(
    user?._id ? { userId: user._id, examId: selectedExamId || undefined } : skipToken
  );
  useEffect(() => {
    if (historyData?.history) {
      dispatch(setAiReportHistory(historyData.history));
    }
  }, [historyData, dispatch]);

  // ─── Progress deltas vs the previous report ────────────────
  const prevStats = previous?.stats;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const scoreDelta =
    aiStats && prevStats ? round1(aiStats.score_percentage - prevStats.score_percentage) : null;
  const questionsDelta =
    aiStats && prevStats ? aiStats.total_questions - prevStats.total_questions : null;
  const correctDelta =
    aiStats && prevStats ? aiStats.correct_answers - prevStats.correct_answers : null;
  const incorrectDelta =
    aiStats && prevStats ? aiStats.incorrect_answers - prevStats.incorrect_answers : null;

  // ─── Manual refresh (forces a fresh AI report today) ───────
  const handleRegenerate = async () => {
    if (!user?._id) return;
    try {
      dispatch(setAiReportLoading({ scope, isLoading: true }));
      const res = await getOrGenerateAiPerformance({
        userId: user._id,
        examId: selectedExamId || undefined,
        force: true,
      }).unwrap();
      if (res.empty || !res.stats || !res.ai_report) {
        dispatch(clearCurrentReport({ scope }));
        return;
      }
      dispatch(
        setAiReport({
          scope,
          report: {
            success: res.success,
            stats: res.stats,
            ai_report: res.ai_report,
          },
          previous: res.previous,
          isCached: res.cached,
          generatedAt: res.generatedAt,
        })
      );
    } catch (err) {
      console.error(err);
      dispatch(setAiReportError({ scope, error: 'Failed to regenerate AI performance report' }));
    }
  };

  // Radar data – subject strengths (from AI report)
  const radarData = aiInsights?.subject_breakdown?.length
    ? aiInsights.subject_breakdown.map((s) => ({ subject: s.subject, value: s.accuracy, fullMark: 100 }))
    : [];

  // Daily accuracy trend – built from saved daily AI reports
  const historyTrend =
    history && history.length > 0
      ? history.map((h) => ({
          day: new Date(h.generatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          accuracy: h.score_percentage,
        }))
      : null;
  const trendData = historyTrend ?? [];
  const usingHistoryTrend = !!historyTrend;

  // Subject breakdown (from AI report)
  const subjectData = aiInsights?.subject_breakdown ?? [];

  // Chart color scheme (BrainForge)
  const successColor = '#00E5B3'; // teal
  const warningColor = '#F2C94C'; // amber
  const dangerColor = '#EB5757'; // red
  const primaryColor = '#2F80ED'; // blue

  const verdictColor = !aiInsights?.score_analysis?.verdict
    ? primaryColor
    : aiInsights.score_analysis.verdict === 'Excellent' ? successColor
    : aiInsights.score_analysis.verdict === 'Good' ? primaryColor
    : aiInsights.score_analysis.verdict === 'Needs Improvement' ? warningColor
    : dangerColor;

  const overallAccuracy = aiStats?.score_percentage;
  const strongest = radarData.length >= 2 ? radarData.reduce((a, b) => (a.value > b.value ? a : b)) : null;
  const weakest = radarData.length >= 2 ? radarData.reduce((a, b) => (a.value < b.value ? a : b)) : null;

  // userData.selectedExams is populated with exam objects by the backend
  const selectedExams = (userData?.selectedExams as any[]) || [];

  useEffect(() => {
    setSelectedExamId(selectedExams.length > 0 ? selectedExams[0]._id : null)
  }, [selectedExams]);

  // ─── Saved reports summary (progress-over-time) ─────────────
  const reportHistory = history ?? [];
  const reportCount = reportHistory.length;
  const bestScore =
    reportCount > 0
      ? Math.max(...reportHistory.map((h) => h.score_percentage))
      : null;
  const avgScore =
    reportCount > 0
      ? reportHistory.reduce((s, h) => s + h.score_percentage, 0) / reportCount
      : null;
  const latestScore =
    reportCount > 0 ? reportHistory[reportCount - 1].score_percentage : 0;
  const improving =
    reportCount > 1 && latestScore > reportHistory[0].score_percentage;

  const subtitle = aiReportLoading
    ? 'AI is analyzing your performance…'
    : aiStats
    ? `AI-powered analysis • ${aiStats.total_questions} questions • ${aiStats.correct_answers} correct${isCached ? ' • from today’s saved report' : ''}`
    : 'Performance Analytics • No AI report yet';

  const statsCards = [
    { label: 'Overall Accuracy', value: overallAccuracy != null ? `${overallAccuracy.toFixed(1)} %` : '—', sub: aiStats ? `${aiStats.correct_answers}/${aiStats.total_questions} correct` : 'No AI report yet', delta: scoreDelta, deltaSuffix: '%', deltaInvert: false, icon: <Target size={18} className="text-[#00E5B3]" />, color: '#00E5B3' },
    { label: 'Questions Attempted', value: aiStats?.total_questions?.toLocaleString() ?? '—', sub: aiStats ? 'from AI analysis' : 'No AI report yet', delta: questionsDelta, deltaSuffix: '', deltaInvert: false, icon: <BookOpen size={18} className="text-[#2F80ED]" />, color: '#2F80ED' },
    { label: 'Correct Answers', value: aiStats?.correct_answers?.toLocaleString() ?? '—', sub: aiStats ? `${((aiStats.correct_answers / Math.max(aiStats.total_questions, 1)) * 100).toFixed(0)}% success rate` : 'No AI report yet', delta: correctDelta, deltaSuffix: '', deltaInvert: false, icon: <CheckCircle2 size={18} className="text-[#9B51E0]" />, color: '#9B51E0' },
    { label: 'Incorrect Answers', value: aiStats?.incorrect_answers?.toLocaleString() ?? '—', sub: aiStats ? `${((aiStats.incorrect_answers / Math.max(aiStats.total_questions, 1)) * 100).toFixed(0)}% to improve` : 'No AI report yet', delta: incorrectDelta, deltaSuffix: '', deltaInvert: true, icon: <XCircle size={18} className="text-[#F2C94C]" />, color: '#F2C94C' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="w-full mx-auto space-y-6 p-2">

        {/* ─── ERROR BANNER ─── */}
        {aiError && (
          <div className="flex items-start gap-3 bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-2xl p-4">
            <AlertTriangle size={18} className="text-[#EB5757] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#EB5757]">AI report unavailable</p>
              <p className="text-xs text-[#EB5757]/80 leading-relaxed mt-0.5">{aiError}</p>
            </div>
          </div>
        )}

        {/* ─── HEADER ─── */}
        <PerfHeader
          examName={aiStats?.exam}
          verdict={aiInsights?.score_analysis?.verdict}
          verdictColor={verdictColor}
          scoreDelta={scoreDelta}
          isLoading={aiReportLoading}
          isRegenerating={isRegenerating}
          subtitle={subtitle}
          generatedAt={generatedAt}
          isCached={isCached}
          reportCount={reportCount}
          onRegenerate={handleRegenerate}
          onOpenSavedReports={() => setSavedReportsOpen(true)}
        />

        {/* ─── STATS CARDS ─── */}
        <PerfStatsCards stats={statsCards} />

        {/* ─── EXAM FILTERS ─── */}
        <div className="bg-[#111318] p-3 rounded-2xl border border-[#23262D] flex flex-wrap items-center gap-3">
          {selectedExams?.map((exam: any) => (
            <button
              key={exam._id}
              onClick={() => setSelectedExamId(exam._id)}
              className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
                selectedExamId === exam._id
                  ? 'bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/20'
                  : 'bg-[#161920] text-[#A1A8B3] border border-[#23262D] hover:text-[#F5F7FA] hover:border-[#323742]'
              }`}
            >
              {exam.name}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 text-[10px] text-[#00E5B3]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E5B3] animate-pulse"></div>
          </div>
        </div>

        {/* ─── CHARTS ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RadarChartCard
            radarData={radarData}
            primaryColor={primaryColor}
            strongest={strongest}
            weakest={weakest}
          />
          <AccuracyTrendCard
            trendData={trendData}
            usingHistoryTrend={usingHistoryTrend}
            overallAccuracy={overallAccuracy}
            verdict={aiInsights?.score_analysis.verdict}
            successColor={successColor}
          />
        </div>

        {/* ─── SUBJECT PERFORMANCE TABLE ─── */}
        <SubjectPerformanceTable subjectData={subjectData} />

        {/* ─── AI STUDY PLAN ─── */}
        <StudyPlanCard
          studyPlan={aiInsights?.study_plan ?? []}
          verdictColor={verdictColor}
        />

        {/* ─── STRENGTHS & WEAK AREAS ─── */}
        {aiInsights && (
          <StrengthsWeakAreas
            strengths={aiInsights.strengths}
            weakAreas={aiInsights.weak_areas}
          />
        )}

        {/* ─── MISTAKE BREAKDOWN ─── */}
        {aiInsights && (
          <MistakeBreakdown mistakes={aiInsights.mistake_breakdown} />
        )}

        {/* ─── BOTTOM BANNER ─── */}
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-lg">
              <Target size={20} className="text-[#00E5B3]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F5F7FA]">
                {aiInsights?.score_analysis
                  ? `${aiInsights.score_analysis.message}`
                  : 'No AI report yet — attempt a mock exam to unlock your personalized analysis.'}
              </h4>
              <p className="text-xs text-[#A1A8B3]">
                {aiInsights?.score_analysis
                  ? 'Follow the study plan above to turn weak areas into strengths.'
                  : 'Complete a mock exam to generate your AI performance report.'}
              </p>
            </div>
          </div>
        </div>

        {/* ─── SAVED REPORTS MODAL ─── */}
        <SavedReportsModal
          open={savedReportsOpen}
          onClose={() => setSavedReportsOpen(false)}
          reportHistory={reportHistory}
          bestScore={bestScore}
          avgScore={avgScore}
          latestScore={latestScore}
          improving={improving}
        />
      </div>
    </div>
  );
};

export default Performance;
