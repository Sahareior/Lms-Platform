import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Download,
  ChevronDown,
  ChevronRight,
  Target,
  BookOpen,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
} from 'lucide-react';
import {
  useAppSelector,
  useAppDispatch,
  setAiReport,
  setAiReportLoading,
  setAiReportError,
  setAiReportHistory,
  clearAiReport,
  useGetOrGenerateAiPerformanceMutation,
  useGetAiPerformanceHistoryQuery,
  useGetMeQuery,
} from '@my-monorepo/store';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

// ─── Progress Delta Badge ──────────────────────────────────
function DeltaBadge({
  delta,
  suffix = '%',
  invert = false,
}: {
  delta: number | null;
  suffix?: string;
  invert?: boolean;
}) {
  if (delta === null || delta === 0) return null;
  const positive = invert ? delta < 0 : delta > 0;
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
        positive
          ? 'text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/30'
          : 'text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/30'
      }`}
    >
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
      {suffix}
    </span>
  );
}

const Performance = () => {
  // ─── AI Performance Report from store ──────────────────────
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const aiReport = useAppSelector((state) => state.aiPerformance.report);
  const aiReportLoading = useAppSelector((state) => state.aiPerformance.isLoading);
  const previous = useAppSelector((state) => state.aiPerformance.previous);
  const isCached = useAppSelector((state) => state.aiPerformance.isCached);
  const generatedAt = useAppSelector((state) => state.aiPerformance.generatedAt);
  const history = useAppSelector((state) => state.aiPerformance.history);
  const aiStats = aiReport?.stats;
  const aiInsights = aiReport?.ai_report;
  const [getOrGenerateAiPerformance, { isLoading: isRegenerating }] =
    useGetOrGenerateAiPerformanceMutation();
  
    const { data: userData } = useGetMeQuery();

  // ─── Exam selection (per-exam AI report) ──────────────────
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

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
        dispatch(setAiReportLoading(true));
        const res = await getOrGenerateAiPerformance({
          userId: user._id,
          examId: selectedExamId || undefined,
        }).unwrap();
        if (cancelled) return;
        if (res.empty || !res.stats || !res.ai_report) {
          dispatch(clearAiReport());
          return;
        }
        dispatch(
          setAiReport({
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
          dispatch(setAiReportError('Failed to load AI performance report'));
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
      dispatch(setAiReportLoading(true));
      const res = await getOrGenerateAiPerformance({
        userId: user._id,
        examId: selectedExamId || undefined,
        force: true,
      }).unwrap();
      if (res.empty || !res.stats || !res.ai_report) {
        dispatch(clearAiReport());
        return;
      }
      dispatch(
        setAiReport({
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
      dispatch(setAiReportError('Failed to regenerate AI performance report'));
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

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="w-full mx-auto space-y-6 p-2">

        {/* ─── HEADER ─── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111318] p-4 rounded-2xl border border-[#23262D]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED] flex items-center justify-center font-bold text-lg">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-[#F5F7FA]">
                  {aiStats?.exam || 'Performance Analytics'}
                </h1>
                {aiInsights?.score_analysis && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border" style={{ color: verdictColor, background: `${verdictColor}14`, borderColor: `${verdictColor}40` }}>
                    <Target size={10} className="inline mr-0.5" /> {aiInsights.score_analysis.verdict}
                  </span>
                )}
                {scoreDelta !== null && scoreDelta !== 0 && (
                  <DeltaBadge delta={scoreDelta} suffix="%" />
                )}
              </div>
              <p className="text-xs text-[#A1A8B3]">
                {aiReportLoading ? 'AI is analyzing your performance…' : aiStats ? `AI-powered analysis • ${aiStats.total_questions} questions • ${aiStats.correct_answers} correct${isCached ? ' • from today\u2019s saved report' : ''}` : 'Performance Analytics • No AI report yet'}
              </p>
              {generatedAt && !aiReportLoading && (
                <p className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                  <Database size={10} /> Updated {new Date(generatedAt).toLocaleString()}
                  {isCached && ' • cached for today'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || aiReportLoading}
              title="Generate a fresh AI report for today (overrides the saved one)"
              className="flex items-center justify-center gap-1 text-xs bg-[#00E5B3] text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-[#00C298] transition w-full md:w-auto active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isRegenerating || aiReportLoading ? 'animate-spin' : ''} />
              {isRegenerating || aiReportLoading ? 'Generating…' : 'Regenerate'}
            </button>
            <button className="flex items-center justify-center gap-1 text-xs border border-[#23262D] px-3 py-1.5 rounded-lg hover:bg-[#161920] text-[#A1A8B3] bg-[#111318] w-full md:w-auto">
              <Calendar size={14} /> Saved reports <ChevronDown size={12} />
            </button>
           
          </div>
        </header>

        {/* ─── STATS CARDS ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall Accuracy', value: overallAccuracy != null ? `${overallAccuracy.toFixed(1)} %` : '—', sub: aiStats ? `${aiStats.correct_answers}/${aiStats.total_questions} correct` : 'No AI report yet', delta: scoreDelta, deltaSuffix: '%', deltaInvert: false, icon: <Target size={18} className="text-[#00E5B3]" />, color: '#00E5B3' },
            { label: 'Questions Attempted', value: aiStats?.total_questions?.toLocaleString() ?? '—', sub: aiStats ? 'from AI analysis' : 'No AI report yet', delta: questionsDelta, deltaSuffix: '', deltaInvert: false, icon: <BookOpen size={18} className="text-[#2F80ED]" />, color: '#2F80ED' },
            { label: 'Correct Answers', value: aiStats?.correct_answers?.toLocaleString() ?? '—', sub: aiStats ? `${((aiStats.correct_answers / Math.max(aiStats.total_questions, 1)) * 100).toFixed(0)}% success rate` : 'No AI report yet', delta: correctDelta, deltaSuffix: '', deltaInvert: false, icon: <CheckCircle2 size={18} className="text-[#9B51E0]" />, color: '#9B51E0' },
            { label: 'Incorrect Answers', value: aiStats?.incorrect_answers?.toLocaleString() ?? '—', sub: aiStats ? `${((aiStats.incorrect_answers / Math.max(aiStats.total_questions, 1)) * 100).toFixed(0)}% to improve` : 'No AI report yet', delta: incorrectDelta, deltaSuffix: '', deltaInvert: true, icon: <XCircle size={18} className="text-[#F2C94C]" />, color: '#F2C94C' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#111318] p-4 rounded-2xl border border-[#23262D] flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-[#A1A8B3]">{stat.label}</span>
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.color}1A` }}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mb-0.5">{stat.value}</div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium flex-wrap">
                {stat.delta !== null && stat.delta !== 0 ? (
                  <>
                    <DeltaBadge delta={stat.delta} suffix={stat.deltaSuffix} invert={stat.deltaInvert} />
                    <span className="text-[#6B7280]">vs previous</span>
                  </>
                ) : (
                  <span className="text-[#A1A8B3]">{stat.sub}</span>
                )}
              </div>
            </div>
          ))}
        </div>

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
            Live data • Synced
          </div>
        </div>

        {/* ─── CHARTS ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-[#23262D]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-[#F5F7FA]">Subject Strength Map</h3>
                <p className="text-[10px] text-[#A1A8B3]">
                  {radarData.length > 0
                    ? `Accuracy % across ${radarData.length} subject${radarData.length !== 1 ? 's' : ''}`
                    : 'No subject data yet'}
                </p>
              </div>
            </div>
            {radarData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[280px] text-center gap-2">
                <Target size={22} className="text-[#2F80ED]" />
                <p className="text-xs text-[#A1A8B3]">
                  No subject data yet — generate an AI report to see your strengths and weak areas.
                </p>
              </div>
            ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 h-[280px]">
              <div className="w-full h-full max-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#23262D" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#A1A8B3', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#A1A8B3' }} />
                    <Radar name="Accuracy" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                {strongest && weakest ? (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#00E5B3]"></div>
                      <span className="font-semibold text-[#F5F7FA]">Strongest:</span> {strongest.subject} {strongest.value}%
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#EB5757]"></div>
                      <span className="font-semibold text-[#F5F7FA]">Weakest:</span> {weakest.subject} {weakest.value}%
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-[#A1A8B3]">More subject data needed for comparison.</div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Area Chart (accuracy trend) */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-[#23262D]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-[#F5F7FA]">Accuracy Trend</h3>
                <p className="text-[10px] text-[#A1A8B3]">
                  {usingHistoryTrend
                    ? `Progress over time • ${trendData.length} saved daily report${trendData.length !== 1 ? 's' : ''}`
                    : 'No trend data yet'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00E5B3]">{overallAccuracy != null ? `${overallAccuracy.toFixed(1)}%` : '—'}</div>
                <div className="text-[10px] text-[#00E5B3] font-medium">{aiInsights?.score_analysis.verdict || '—'}</div>
              </div>
            </div>
            {trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center gap-2">
                <BookOpen size={22} className="text-[#2F80ED]" />
                <p className="text-xs text-[#A1A8B3]">
                  No saved reports yet — your daily accuracy trend will appear after you generate AI reports.
                </p>
              </div>
            ) : (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#23262D" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#A1A8B3' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#A1A8B3' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #23262D',
                      backgroundColor: '#111318',
                      color: '#F5F7FA',
                    }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={successColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={successColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="accuracy" stroke={successColor} fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            )}
          </div>
        </div>

        {/* ─── SUBJECT PERFORMANCE TABLE ─── */}
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden">
          <div className="p-5 border-b border-[#23262D]">
            <h3 className="font-bold text-[#F5F7FA]">Subject Performance Breakdown</h3>
            <p className="text-xs text-[#A1A8B3]">Weak subjects highlighted. Click to drill down.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#161920] text-[11px] font-medium text-[#A1A8B3] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Subject</th>
                  <th className="px-5 py-3 text-center">Attempted</th>
                  <th className="px-5 py-3 text-center">Correct</th>
                  <th className="px-5 py-3 text-left w-[200px]">Accuracy</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23262D]">
                {subjectData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Database size={20} className="text-[#2F80ED]" />
                        <p className="text-xs text-[#A1A8B3]">
                          No subject data yet — generate an AI report to see your per-subject breakdown.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                subjectData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-[#161920] transition ${
                      row.isCritical ? 'bg-[#EB5757]/5' : row.isWeak ? 'bg-[#EB5757]/[0.02]' : ''
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-[#F5F7FA]">
                      <div className="flex items-center gap-2">
                        {row.subject}
                        {row.isWeak && (
                          <span className="text-[10px] bg-[#EB5757]/10 text-[#EB5757] px-1.5 py-0.5 rounded border border-[#EB5757]/30">
                            Weak
                          </span>
                        )}
                        {row.isCritical && (
                          <span className="text-[10px] bg-[#EB5757] text-white px-1.5 py-0.5 rounded">
                            Critical
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-[#A1A8B3]">{row.attempted}</td>
                    <td className="px-5 py-3 text-center text-[#A1A8B3]">{row.correct}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-[#1C1F26] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3]"
                            style={{ width: `${row.accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#F5F7FA] min-w-[35px]">{row.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        className={`text-xs px-3 py-1 rounded border font-medium transition ${
                          row.isWeak || row.isCritical
                            ? 'border-[#EB5757]/30 text-[#EB5757] hover:bg-[#EB5757]/10'
                            : 'border-[#23262D] text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA]'
                        }`}
                      >
                        {row.isWeak || row.isCritical ? 'Review' : 'Practice'}
                      </button>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── AI STUDY PLAN ─── */}
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-[#23262D] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center text-[#00E5B3] text-xs font-bold">
                AI
              </div>
              <h3 className="font-bold text-[#F5F7FA]">AI Study Plan — This Week</h3>
              <span className="text-[10px] text-[#A1A8B3] hidden sm:inline">
                Personalized for weak areas • auto‑updated daily
              </span>
            </div>
            <button className="text-xs font-medium text-[#00E5B3] hover:underline flex items-center gap-1 mt-2 md:mt-0">
              <Plus size={14} /> Regenerate
            </button>
          </div>

          {(aiInsights?.study_plan?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {aiInsights?.study_plan?.map((plan, idx) => (
              <div key={idx} className="bg-[#161920] border border-[#23262D] rounded-lg p-3 hover:border-[#323742] transition">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-[#A1A8B3]">{plan.day || `DAY ${idx + 1}`}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold truncate max-w-full" style={{ color: verdictColor, background: `${verdictColor}14` }}>
                    {plan.focus_subject || 'FOCUS'}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#F5F7FA] mb-1">{plan.title}</div>
                <div className="text-[10px] text-[#A1A8B3] leading-tight mb-2">{plan.description}</div>
                <div className="flex justify-between items-center text-[10px] text-[#6B7280] border-t border-[#23262D] pt-1">
                  <div className="flex items-center gap-1"><Clock size={10} /> {plan.duration_minutes || 60} min</div>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
          ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <BookOpen size={22} className="text-[#2F80ED]" />
            <p className="text-xs text-[#A1A8B3]">
              No study plan yet — generate an AI report to get a personalized weekly plan.
            </p>
          </div>
          )}
        </div>

        {/* ─── STRENGTHS & WEAK AREAS ─── */}
        {aiInsights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
                  <CheckCircle2 size={13} className="text-[#00E5B3]" />
                </div>
                <h3 className="font-bold text-[#F5F7FA]">Strengths</h3>
              </div>
              <div className="space-y-2.5">
                {aiInsights.strengths.map((s, idx) => (
                  <div key={idx} className="bg-[#161920] border border-[#23262D] border-l-4 border-l-[#00E5B3] rounded-xl p-3">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-bold text-[#F5F7FA]">{s.topic}</h4>
                      <span className="text-[10px] font-bold text-[#00E5B3]">{s.accuracy}%</span>
                    </div>
                    <p className="text-[10px] text-[#A1A8B3] mt-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#EB5757]/10 border border-[#EB5757]/30 flex items-center justify-center">
                  <AlertTriangle size={13} className="text-[#EB5757]" />
                </div>
                <h3 className="font-bold text-[#F5F7FA]">Weak Areas</h3>
              </div>
              <div className="space-y-2.5">
                {aiInsights.weak_areas.map((w, idx) => (
                  <div key={idx} className="bg-[#161920] border border-[#23262D] border-l-4 border-l-[#EB5757] rounded-xl p-3">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-bold text-[#F5F7FA]">{w.topic}</h4>
                      <span className="text-[10px] font-bold text-[#EB5757]">{w.accuracy}%</span>
                    </div>
                    <p className="text-[10px] text-[#A1A8B3] mt-1">{w.reason}</p>
                    <p className="text-[10px] text-[#00E5B3] mt-1">{w.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── MISTAKE BREAKDOWN ─── */}
        {aiInsights && aiInsights.mistake_breakdown.length > 0 && (
          <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden">
            <div className="p-5 border-b border-[#23262D]">
              <h3 className="font-bold text-[#F5F7FA]">Mistake Breakdown</h3>
              <p className="text-xs text-[#A1A8B3]">Questions you got wrong, with explanations to learn from.</p>
            </div>
            <div className="divide-y divide-[#23262D]">
              {aiInsights.mistake_breakdown.map((m, idx) => (
                <div key={idx} className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-start">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F7FA] mb-1">{m.question_text}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30 font-medium">
                      {m.identified_subject}
                    </span>
                    <p className="text-[11px] text-[#A1A8B3] mt-2 leading-relaxed">{m.explanation}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wide text-[#EB5757] font-bold flex items-center gap-1">
                      <XCircle size={11} /> Your answer
                    </span>
                    <span className="text-xs text-[#A1A8B3]">{m.user_answer}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wide text-[#00E5B3] font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Correct
                    </span>
                    <span className="text-xs text-[#F5F7FA] font-semibold">{m.correct_answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-[#00E5B3] hover:bg-[#00C298] text-black text-sm font-bold px-6 py-2 rounded-lg transition active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center">
            Back to Top <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Performance;