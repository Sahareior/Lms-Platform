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
import StreakCard from "./_components/StreakCard";
import LeaderboardCard from "./_components/LeaderboardCard";
import { useTheme } from "../../../theme/ThemeContext";

// ─── Weekly Study Activity helpers ──────────────────────────
const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      const end = start.getTime() + 86_399_999;
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
  const [stats, setStats] = useState<AiPerformanceStats | null>(null);
  const user = useAppSelector((state) => state.user.user);
  const userId = user?._id || "";
  const dispatch = useAppDispatch();
  const [getOrGenerateAiPerformance] = useGetOrGenerateAiPerformanceMutation();
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

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
  const { data: quizOverview } = useGetQuizOverviewQuery(userId ? { userId } : skipToken);
  const weeklyDays = weeklyData ? buildWeeklyActivity(weeklyData.attempts || []) : [];
  const weeklyTotalAttempts = weeklyDays.reduce((sum, d) => sum + d.attempts, 0);
  const todayIndex = (new Date().getDay() + 6) % 7;

  const selectedExams = (userData?.selectedExams as any[]) || [];

  const initialTabSet = useRef(false);
  useEffect(() => {
    if (!initialTabSet.current && activeTab === "All" && selectedExams && selectedExams.length > 0) {
      initialTabSet.current = true;
      setActiveTab(selectedExams[0]._id);
    }
  }, [activeTab, selectedExams]);

  useEffect(() => {
    if (!userId || scope === "all") return;
    if (aiEntry?.report) return;
    let cancelled = false;
    (async () => {
      try {
        dispatch(setAiReportLoading({ scope, isLoading: true }));
        const res = await getOrGenerateAiPerformance({
          userId,
          examId: scope,
        }).unwrap();
        if (res?.stats) setStats(res.stats);
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

  const aiStats = aiReport?.stats;
  const aiInsights = aiReport?.ai_report;
  const overviewOverall = quizOverview?.overall;
  const examOverview = quizOverview?.byExam ?? [];
  const subjectOverview = quizOverview?.bySubject ?? [];
  const activeExamOverview = examOverview.find((e) => e.examId === scope) ?? null;
  const activeOverall = activeExamOverview ?? overviewOverall;
  const hasQuizData = !!activeOverall && activeOverall.questions > 0;

  const aiSubjectData = aiInsights?.subject_breakdown ?? [];
  const subjectData =
    scope !== "all" && aiSubjectData.length > 0
      ? aiSubjectData
      : subjectOverview.length > 0
        ? subjectOverview
        : aiSubjectData;

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
      desc: `সঠিকতার হার ${w.accuracy}% — কাঙ্ক্ষিত ৬০%-এর নিচে। ${w.subject} বিষয়ের মৌলিক বিষয়গুলোতে আরও একটু মনোযোগ দিন।`,
      color: "border-l-[#EB5757]",
    })),
    ...strongSubjects.map((s) => ({
      title: s.subject,
      desc: `${s.subject} বিষয়ে আপনার পারফরম্যান্স বেশ ভালো (${s.accuracy}% সঠিকতা অর্জন করেছেন)।`,
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

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // ─── Shared section heading block (theme-aware) ─────────────
  const SectionHeading = ({
    icon: Icon,
    title,
    subtitle,
    ctaLabel,
    ctaColor,
    onCta,
  }: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaColor: string;
    onCta: () => void;
  }) => (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div
          className={
            isDark
              ? `p-2.5 rounded-xl border ${ctaColor}`
              : `p-2.5 rounded-lg bg-[#1a1a1a] border border-[#1a1a1a]`
          }
        >
          <Icon size={18} className={isDark ? "" : "text-[#f2efe9]"} />
        </div>
        <div>
          <h2
            className={`text-xl tracking-tight ${
              isDark ? "font-bold text-[#F5F7FA]" : "font-black text-[#1a1a1a] font-serif"
            }`}
          >
            {title}
          </h2>
          <p className={`text-xs ${isDark ? "text-[#A1A8B3]" : "text-[#4a4a4a] font-serif italic"}`}>
            {subtitle}
          </p>
        </div>
      </div>
      <button
        onClick={onCta}
        className={`text-xs flex items-center gap-1 hover:underline ${
          isDark ? "font-bold" : "font-black font-serif"
        }`}
        style={{ color: isDark ? undefined : "#b91c1c" }}
      >
        <span>{ctaLabel}</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );

  return (
    <div
      className={`w-full space-y-8 max-w-8xl md:p-4 p-1 mx-auto ${
        isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage: "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      {/* ────── TOP HEADER ────── */}
      <DashboardHeader
        isDark={isDark}
        user={user}
        greeting={greeting}
        dateStr={dateStr}
        onAdminPanel={() => navigate("/admin")}
      />

      {/* ────── STATS ROW ────── */}
      <StatsRow isDark={isDark} statsCards={statsCards} />

      {/* ────── STREAK & XP CARD ────── */}
      <StreakCard isDark={isDark} />

      {/* ────── QUICK ACTIONS ────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={Zap}
          label="Mock Exam"
          description="Start a practice test"
          onClick={() => navigate("/mock-exam")}
          color="text-[#9B51E0]"
          isDark={isDark}
        />
        <QuickAction
          icon={Brain}
          label="AI Insights"
          description="View performance analysis"
          onClick={() => navigate("/performance")}
          color="text-[#00E5B3]"
          isDark={isDark}
        />
        <QuickAction
          icon={Layers}
          label="Browse Courses"
          description="Discover new topics"
          onClick={() => navigate("/available-courses")}
          color="text-[#2F80ED]"
          isDark={isDark}
        />
        <QuickAction
          icon={TrendingUp}
          label="Your Progress"
          description="Track your growth"
          onClick={() => navigate("/question-center")}
          color="text-[#F2C94C]"
          isDark={isDark}
        />
      </div>

      {/* ────── CONTINUE LEARNING (ENROLLED) ────── */}
      <div className="space-y-4 mt-6">
        <SectionHeading
          icon={PlayCircle}
          title="Continue Learning"
          subtitle={
            isLoadingEnrolledCourses
              ? "Loading..."
              : `${filteredEnrolled.length} active course${filteredEnrolled.length !== 1 ? "s" : ""}`
          }
          ctaLabel="View All"
          ctaColor="bg-[#2F80ED]/10 border-[#2F80ED]/30 text-[#2F80ED]"
          onCta={() => navigate("/courses")}
        />

        {isLoadingEnrolledCourses ? (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={28}
              className={`animate-spin ${isDark ? "text-[#2F80ED]" : "text-[#b91c1c]"}`}
            />
          </div>
        ) : filteredEnrolled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 px-3 gap-5">
            {filteredEnrolled.map((course) => (
              <EnrolledCard
                isDark={isDark}
                key={course._id}
                course={course}
                onResume={() => course._id && navigate(`/courses/${course._id}`)}
                onOpen={() => course._id && navigate(`/course/${course._id}`)}
              />
            ))}
          </div>
        ) : (
          <div
            className={`rounded-2xl p-10 text-center border ${
              isDark
                ? "bg-[#111318] border-[#23262D]"
                : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"
            }`}
          >
            <PlayCircle
              size={28}
              className={`mx-auto mb-3 ${isDark ? "text-[#6B7280]" : "text-[#1a1a1a]"}`}
            />
            <p
              className={`text-sm font-semibold ${
                isDark ? "text-[#A1A8B3]" : "text-[#1a1a1a] font-serif"
              }`}
            >
              You haven't enrolled in any courses yet.
            </p>
            <button
              onClick={() => navigate("/available-courses")}
              className={`mt-4 text-xs hover:underline ${
                isDark ? "font-bold text-[#00E5B3]" : "font-black font-serif text-[#b91c1c]"
              }`}
            >
              Browse available courses
            </button>
          </div>
        )}
      </div>

      {/* ────── CATEGORY/EXAM TABS ────── */}
      <div
        className={`flex flex-wrap gap-2 pb-3 mt-6 border-b ${
          isDark ? "border-[#23262D]" : "border-[#d8d4cb]"
        }`}
      >
        {selectedExams?.map((tab: any) => {
          const active = activeTab === tab._id;
          return (
            <button
              key={tab._id}
              onClick={() => setActiveTab(tab._id)}
              className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                isDark
                  ? active
                    ? "font-semibold bg-[#2F80ED] text-white border-[#2F80ED] shadow-[0_4px_12px_rgba(47,128,237,0.3)]"
                    : "font-semibold bg-[#111318] text-[#A1A8B3] border-[#23262D] hover:bg-[#161920] hover:text-[#F5F7FA]"
                  : active
                    ? "bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c]"
                    : "bg-[#f2efe9] text-[#4a4a4a] border border-[#d8d4cb] font-serif font-bold shadow-[1px_1px_0px_0px_#d8d4cb] hover:bg-[#e0dcd5] hover:text-[#1a1a1a]"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ────── AVAILABLE COURSES ────── */}
      <div className="space-y-4">
        <SectionHeading
          icon={Sparkles}
          title="Available Courses"
          subtitle={
            isLoadingCourses
              ? "Loading..."
              : `${availableCoursesList.length} course${availableCoursesList.length !== 1 ? "s" : ""} to explore`
          }
          ctaLabel="Browse All"
          ctaColor="bg-[#00E5B3]/10 border-[#00E5B3]/30 text-[#00E5B3]"
          onCta={() => navigate("/available-courses")}
        />

        {isLoadingCourses ? (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={28}
              className={`animate-spin ${isDark ? "text-[#00E5B3]" : "text-[#b91c1c]"}`}
            />
          </div>
        ) : availableCoursesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-3 gap-5">
            {availableCoursesList.map((course: any) => (
              <AvailableCard
                isDark={isDark}
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
          <div
            className={`rounded-2xl p-10 text-center border ${
              isDark
                ? "bg-[#111318] border-[#23262D]"
                : "bg-[#f2efe9] border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a]"
            }`}
          >
            <BookOpen
              size={28}
              className={`mx-auto mb-3 ${isDark ? "text-[#6B7280]" : "text-[#1a1a1a]"}`}
            />
            <p
              className={`text-sm font-semibold ${
                isDark ? "text-[#A1A8B3]" : "text-[#1a1a1a] font-serif"
              }`}
            >
              No courses available in this category
            </p>
          </div>
        )}
      </div>

      {/* ────── MOCK EXAM BANNER & AI RECOMMENDATIONS ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <FeaturedMockExamCard
          featured={featuredExam}
          isLoading={isFeaturedLoading}
          userId={userId}
          isDark={isDark}
        />

        <AiRecommendationsCard
          isDark={isDark}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <WeeklyActivityChart
          weeklyDays={weeklyDays}
          todayIndex={todayIndex}
          weeklyTotalAttempts={weeklyTotalAttempts}
          isLoading={isLoadingWeekly}
          isDark={isDark}
        />

        <SubjectAccuracyList
          subjectData={subjectData}
          scope={scope}
          selectedExams={selectedExams}
          aiStats={aiStats}
          isDark={isDark}
        />

        <LeaderboardCard isDark={isDark} />
      </div>

      <div className="h-4" />
    </div>
  );
}