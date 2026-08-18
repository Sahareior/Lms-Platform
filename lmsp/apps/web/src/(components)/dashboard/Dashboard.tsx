import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  ClipboardCheck,
  Brain,
  BarChart3,
  ChevronRight,
  PlayCircle,
  Sparkles,
  Loader2,
  Zap,
  Layers,
  TrendingUp,
} from "lucide-react";
import {
  useEnrollCourseMutation,
  useGetMeQuery,
  useGetCoursesQuery,
  useAppSelector,
  useAppDispatch,
  useGetFeaturedScheduleExamQuery,
  useGetWeeklyActivityQuery,
  useGetQuizOverviewQuery,
  setAiReport,
  setAiReportLoading,
  setAiReportError,
  clearCurrentReport,
  useGetOrGenerateAiPerformanceMutation,
} from "@my-monorepo/store";
import type { WeeklyAttempt, AiPerformanceStats } from "@my-monorepo/store";
import { useGetEnrolledCourseQuery } from "@my-monorepo/store/src/redux/api/courseApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import EnrolledCard from "./_components/EnrolledCard";
import AvailableCard from "./_components/AvailableCard";
import QuickAction from "./_components/QuickAction";
import FeaturedMockExamCard from "./_components/FeaturedMockExamCard";
import WeeklyActivityChart, { type WeeklyDay } from "./_components/WeeklyActivityChart";
import AiRecommendationsCard from "./_components/AiRecommendationsCard";
import SubjectAccuracyList from "./_components/SubjectAccuracyList";
import DashboardHeader from "./_components/DashboardHeader";
import StatsRow from "./_components/StatsRow";

// ─── Weekly Study Activity helpers ──────────────────────────
const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Bucket completed attempts into the user's local Mon–Sun week.
function buildWeeklyActivity(attempts: WeeklyAttempt[]): WeeklyDay[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const days: WeeklyDay[] = WEEK_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, key: d.toDateString(), attempts: 0, questions: 0, correct: 0 };
  });

  for (const a of attempts) {
    const t = new Date(a.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    for (let i = 0; i < days.length; i++) {
      const start = new Date(monday);
      start.setDate(monday.getDate() + i);
      start.setHours(0, 0, 0, 0);
      const end = start.getTime() + 86_399_999; // 23:59:59.999
      if (t >= start.getTime() && t <= end) {
        days[i].attempts += 1;
        days[i].questions += a.totalQuestions || 0;
        days[i].correct += a.correctCount || 0;
        break;
      }
    }
  }

  return days;
}

// ─── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [stats, setStats] = useState<AiPerformanceStats | null>(null)
  const user = useAppSelector((state) => state.user.user);
  const userId = user?._id || "";
  const dispatch = useAppDispatch();
  const [getOrGenerateAiPerformance] = useGetOrGenerateAiPerformanceMutation();

  // The Dashboard follows the active exam tab, so the AI panel and subject
  // chart always show the report for the exam the user is currently viewing:
  //   'all'  → combined report (loaded by the app shell into its own scope)
  //   <examId> → that exam's report (same scope the Performance page uses)
  const scope = activeTab === "All" ? "all" : activeTab;
  const aiEntry = useAppSelector((state) => state.aiPerformance.reports[scope]);
  const aiReport = aiEntry?.report ?? null;
  const aiReportLoading = aiEntry?.isLoading ?? false;
  const aiReportError = aiEntry?.error ?? null;

  const { data: userData } = useGetMeQuery();
  const { data: featuredExam, isLoading: isFeaturedLoading } = useGetFeaturedScheduleExamQuery();
  const [enrollCourse] = useEnrollCourseMutation();
  const { data: enrolledCourses, isLoading: isLoadingEnrolledCourses } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });
  const { data: weeklyData, isLoading: isLoadingWeekly } = useGetWeeklyActivityQuery(
    userId ? { userId } : skipToken
  );
  // Real performance overview computed from the user's completed quiz attempts,
  // aggregated across ALL their exams – this is the source of truth for the
  // at-a-glance sections below (the AI report is only a daily-cached enrichment).
  const { data: quizOverview } = useGetQuizOverviewQuery(userId ? { userId } : skipToken);
  const weeklyDays = weeklyData ? buildWeeklyActivity(weeklyData.attempts || []) : [];
  const weeklyTotalAttempts = weeklyDays.reduce((sum, d) => sum + d.attempts, 0);
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6

  // Backend populates selectedExams with full exam objects (see Settings.tsx / Perfomence.tsx)
  const selectedExams = (userData?.selectedExams as any[]) || [];

  // Set first exam as active tab if "All" is selected and exams exist (only
  // once – the user can then switch back to the combined "All Exams" view).
  const initialTabSet = useRef(false);
  useEffect(() => {
    if (!initialTabSet.current && activeTab === "All" && selectedExams && selectedExams.length > 0) {
      initialTabSet.current = true;
      setActiveTab(selectedExams[0]._id);
    }
  }, [activeTab, selectedExams]);

  // Load the per-exam AI report whenever the user switches exam tabs. The
  // combined 'all' report is already loaded by the app shell on mount.
  useEffect(() => {
    if (!userId || scope === "all") return;
    if (aiEntry?.report) return; // already loaded for this exam
    let cancelled = false;
    (async () => {
      try {
        dispatch(setAiReportLoading({ scope, isLoading: true }));
        const res = await getOrGenerateAiPerformance({
          userId,
          examId: scope,
        }).unwrap();
        if (res?.stats) setStats(res.stats)
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
          dispatch(setAiReportError({ scope, error: "Failed to load AI performance report" }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, scope, aiEntry?.report, getOrGenerateAiPerformance, dispatch]);

  const { data: courseData, isLoading: isLoadingCourses } = useGetCoursesQuery();

  const handleEnroll = async (courseId: string) => {
    if (!userId) return;
    setEnrollingId(courseId);
    try {
      await enrollCourse({ userId, courseId }).unwrap();
      setTimeout(() => setEnrollingId(null), 1500);
    } catch {
      setEnrollingId(null);
    }
  };

  const enrolledCoursesList = Array.isArray(enrolledCourses) ? enrolledCourses : [];
  const filteredEnrolled = enrolledCoursesList.filter(
    (c) => activeTab === "All" || c.exam?._id === activeTab || c.category === activeTab
  );
  const availableCoursesList = (
    Array.isArray(courseData)
      ? courseData
      : Array.isArray(courseData?.courses)
        ? courseData.courses
        : []
  ).filter(
    (c: any) => activeTab === "All" || c.exam?._id === activeTab || c.category === activeTab
  );

  // ─── Derived data (overview first, AI report as enrichment) ──
  const aiStats = aiReport?.stats;
  const aiInsights = aiReport?.ai_report;
  const overviewOverall = quizOverview?.overall;
  const examOverview = quizOverview?.byExam ?? [];
  const subjectOverview = quizOverview?.bySubject ?? [];
  // When a specific exam tab is active, prefer that exam's real overview so
  // the stats row reflects what the user is actually viewing.
  const activeExamOverview = examOverview.find((e) => e.examId === scope) ?? null;
  const activeOverall = activeExamOverview ?? overviewOverall;
  const hasQuizData = !!activeOverall && activeOverall.questions > 0;

  // Per-subject accuracy: for a specific exam use the AI report's breakdown
  // (it has the richest subject names); for 'all' use the real attempt-based
  // overview.
  const aiSubjectData = aiInsights?.subject_breakdown ?? [];
  const subjectData =
    scope !== "all" && aiSubjectData.length > 0
      ? aiSubjectData
      : subjectOverview.length > 0
        ? subjectOverview
        : aiSubjectData;

  // Verdict – prefer the AI report, otherwise derive it from real accuracy.
  const activeVerdict =
    aiInsights?.score_analysis?.verdict ??
    (hasQuizData
      ? activeOverall!.accuracy >= 80
        ? "Excellent"
        : activeOverall!.accuracy >= 60
          ? "Good"
          : activeOverall!.accuracy >= 40
            ? "Needs Improvement"
            : "Critical"
      : null);
  const verdictColor =
    activeVerdict === "Excellent"
      ? "#00E5B3"
      : activeVerdict === "Good"
        ? "#2F80ED"
        : activeVerdict === "Needs Improvement"
          ? "#F2C94C"
          : "#EB5757";
  const verdictMessage =
    aiInsights?.score_analysis?.message ??
    (hasQuizData
      ? `You scored ${activeOverall!.accuracy}% across ${activeOverall!.questions} questions in ${activeOverall!.attempts} quiz attempt${activeOverall!.attempts !== 1 ? "s" : ""}.`
      : "");

  // Weakest / strongest subjects (real data) for the recommendations card.
  const weakSubjects = subjectData
    .filter((s) => s.accuracy < 60 && s.attempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  const strongSubjects = subjectData
    .filter((s) => s.accuracy >= 70 && s.attempted > 0)
    .slice(0, 3);

  const aiRecommendations = [
    ...(aiInsights?.weak_areas ?? []).map((w: any) => ({
      title: w.topic,
      desc: w.recommendation,
      color: "border-l-[#EB5757]",
    })),
    ...(aiInsights?.strengths ?? []).map((s: any) => ({
      title: s.topic,
      desc: s.detail,
      color: "border-l-[#00E5B3]",
    })),
  ].slice(0, 4);

  const overviewRecommendations = [
    ...weakSubjects.map((w) => ({
      title: w.subject,
      desc: `Accuracy ${w.accuracy}% — below the 60% target. Spend focused revision time on ${w.subject}.`,
      color: "border-l-[#EB5757]",
    })),
    ...strongSubjects.map((s) => ({
      title: s.subject,
      desc: `Strong performance in ${s.subject} with ${s.accuracy}% accuracy.`,
      color: "border-l-[#00E5B3]",
    })),
  ].slice(0, 4);

  const showAiContent = !!aiInsights;
  const recommendations = showAiContent ? aiRecommendations : overviewRecommendations;
  const hasRecommendationContent = showAiContent || hasQuizData;

  const statsCards = [
    {
      title: "Courses Enrolled",
      value: enrolledCoursesList.length,
      icon: BookOpen,
      color: "text-[#2F80ED]",
      bg: "bg-[#2F80ED]/10 border-[#2F80ED]/20",
    },
    {
      title: "Questions Attempted",
      value: stats?.total_questions ?? "—",
      icon: ClipboardCheck,
      color: "text-[#00E5B3]",
      bg: "bg-[#00E5B3]/10 border-[#00E5B3]/20",
    },
    {
      title: "Correct Answers",
      value: stats?.correct_answers ?? "—",
      icon: Trophy,
      color: "text-[#9B51E0]",
      bg: "bg-[#9B51E0]/10 border-[#9B51E0]/20",
    },
    {
      title: "Overall Accuracy",
      value: stats?.score_percentage ? `${stats.score_percentage}%` : "N/A",
      icon: BarChart3,
      color: "text-[#F2C94C]",
      bg: "bg-[#F2C94C]/10 border-[#F2C94C]/20",
    },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Greeting based on time of day
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const handleFeaturedExamStart = () => {
    const isExpired =
      featuredExam?.status === "completed" ||
      featuredExam?.status === "cancelled" ||
      Boolean(
        featuredExam?.endDate &&
        new Date(featuredExam.endDate).getTime() <= Date.now()
      );
    if (featuredExam && !isExpired) {
      const examId =
        typeof featuredExam.exam === "object" ? featuredExam.exam._id : featuredExam.exam;
      const versionId =
        typeof featuredExam.examVersion === "object"
          ? featuredExam.examVersion._id
          : featuredExam.examVersion;
      navigate(
        `/mock-exam/selected-exam/exam-page?examId=${examId}&versionId=${versionId}`
      );
    } else {
      navigate("/mock-exam");
    }
  };

  return (
    <div className="w-full text-[#F5F7FA] space-y-8 max-w-8xl p-4 mx-auto">
      {/* ────── TOP HEADER ────── */}
      <DashboardHeader
        user={user}
        greeting={greeting}
        dateStr={dateStr}
        onAdminPanel={() => navigate('/admin')}
      />

      {/* ────── STATS ROW ────── */}
      <StatsRow statsCards={statsCards} />

      {/* ────── QUICK ACTIONS ────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={Zap}
          label="Mock Exam"
          description="Start a practice test"
          onClick={() => navigate("/mock-exam")}
          color="text-[#9B51E0]"
        />
        <QuickAction
          icon={Brain}
          label="AI Insights"
          description="View performance analysis"
          onClick={() => navigate("/performance")}
          color="text-[#00E5B3]"
        />
        <QuickAction
          icon={Layers}
          label="Browse Courses"
          description="Discover new topics"
          onClick={() => navigate("/available-courses")}
          color="text-[#2F80ED]"
        />
        <QuickAction
          icon={TrendingUp}
          label="Your Progress"
          description="Track your growth"
          onClick={() => navigate("/question-center")}
          color="text-[#F2C94C]"
        />
      </div>

      {/* ────── CONTINUE LEARNING (ENROLLED) ────── */}
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/30">
              <PlayCircle size={18} className="text-[#2F80ED]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight">
                Continue Learning
              </h2>
              <p className="text-xs text-[#A1A8B3]">
                {isLoadingEnrolledCourses
                  ? "Loading..."
                  : `${filteredEnrolled.length} active course${filteredEnrolled.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="text-xs font-bold text-[#2F80ED] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {isLoadingEnrolledCourses ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={28} className="animate-spin text-[#2F80ED]" />
          </div>
        ) : filteredEnrolled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEnrolled.map((course) => (
              <EnrolledCard
                key={course._id}
                course={course}
                onResume={() => course._id && navigate(`/courses/${course._id}`)}
                onOpen={() => course._id && navigate(`/course/${course._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-10 text-center">
            <PlayCircle size={28} className="text-[#6B7280] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#A1A8B3]">
              You haven't enrolled in any courses yet.
            </p>
            <button
              onClick={() => navigate("/available-courses")}
              className="mt-4 text-xs font-bold text-[#00E5B3] hover:underline"
            >
              Browse available courses
            </button>
          </div>
        )}
      </div>

      {/* ────── CATEGORY/EXAM TABS ────── */}
      <div className="flex flex-wrap gap-2 border-b border-[#23262D] pb-3 mt-6">
        {selectedExams?.map((tab: any) => {
          const active = activeTab === tab._id;
          return (
            <button
              key={tab._id}
              onClick={() => setActiveTab(tab._id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${active
                  ? "bg-[#2F80ED] text-white border-[#2F80ED] shadow-[0_4px_12px_rgba(47,128,237,0.3)]"
                  : "bg-[#111318] text-[#A1A8B3] border-[#23262D] hover:bg-[#161920] hover:text-[#F5F7FA]"
                }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ────── AVAILABLE COURSES ────── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5B3]/10 border border-[#00E5B3]/30">
              <Sparkles size={18} className="text-[#00E5B3]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight">
                Available Courses
              </h2>
              <p className="text-xs text-[#A1A8B3]">
                {isLoadingCourses
                  ? "Loading..."
                  : `${availableCoursesList.length} course${availableCoursesList.length !== 1 ? "s" : ""} to explore`}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/available-courses")}
            className="text-xs font-bold text-[#00E5B3] hover:underline flex items-center gap-1"
          >
            <span>Browse All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {isLoadingCourses ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={28} className="animate-spin text-[#00E5B3]" />
          </div>
        ) : availableCoursesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCoursesList.map((course: any) => (
              <AvailableCard
                key={course._id}
                course={course}
                enrolledCourse={enrolledCoursesList}
                onEnroll={() => handleEnroll(course._id)}
                isEnrolling={enrollingId === course._id}
                onOpen={() => course._id && navigate(`/course/${course._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-10 text-center">
            <BookOpen size={28} className="text-[#6B7280] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#A1A8B3]">
              No courses available in this category
            </p>
          </div>
        )}
      </div>

      {/* ────── MOCK EXAM BANNER & AI RECOMMENDATIONS ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left: Featured Mock Exam (driven by admin control panel) */}
        <FeaturedMockExamCard
          featured={featuredExam}
          isLoading={isFeaturedLoading}
          onStart={handleFeaturedExamStart}
        />

        {/* Right: AI Recommended */}
        <AiRecommendationsCard
          scope={scope}
          aiStats={aiStats}
          aiReportLoading={aiReportLoading}
          aiReportError={aiReportError}
          aiInsights={aiInsights}
          activeVerdict={activeVerdict}
          verdictColor={verdictColor}
          verdictMessage={verdictMessage}
          recommendations={recommendations}
          hasRecommendationContent={hasRecommendationContent}
          onViewAll={() => navigate("/performance")}
        />
      </div>

      {/* ────── BOTTOM CHARTS ROW ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Weekly Study Activity */}
        <WeeklyActivityChart
          weeklyDays={weeklyDays}
          todayIndex={todayIndex}
          weeklyTotalAttempts={weeklyTotalAttempts}
          isLoading={isLoadingWeekly}
        />

        {/* Subject Strength */}
        <SubjectAccuracyList
          subjectData={subjectData}
          scope={scope}
          selectedExams={selectedExams}
          aiStats={aiStats}
        />
      </div>

      <div className="h-4" />
    </div>
  );
}
