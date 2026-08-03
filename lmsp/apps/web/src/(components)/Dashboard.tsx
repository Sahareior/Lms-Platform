import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  ClipboardCheck,
  Brain,
  BarChart3,
  Calendar,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Clock,
  ChevronRight,
  Target,
  Star,
  Plus,
  Loader2,
  ArrowRight,
  TrendingUp,
  Zap,
  Layers,
} from "lucide-react";
import {
  useGetCoursesQuery,
  useEnrollCourseMutation,
  useGetExamsQuery,
  useGetMeQuery,
  useGetCourseByIdQuery,
  useAppSelector,
  useGetFeaturedScheduleExamQuery,
} from "@my-monorepo/store";
import { useGetEnrolledCourseQuery } from "@my-monorepo/store/src/redux/api/courseApi";

// ─── Countdown hook for the featured mock exam ────────────
function useCountdown(targetIso?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!targetIso) return null;
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { diff, hours: pad(hours), mins: pad(mins), secs: pad(secs) };
}

// ─── Progress Ring ─────────────────────────────────────────
function ProgressRing({ progress, size = 36 }: { progress: number; size?: number }) {
  const sw = 3;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const color =
    progress >= 80 ? "#00E5B3" : progress >= 40 ? "#2F80ED" : "#A1A8B3";
  return (
    <svg width={size} height={size} className="transform -rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#23262D" strokeWidth={sw} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={c}
        strokeDashoffset={c - (progress / 100) * c}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// ─── Enrolled Course Card ──────────────────────────────────
function EnrolledCard({ course, onResume }: { course: any; onResume: () => void }) {
  const category = course.exam?.name || course.category || "General";
  const totalLessons = course.lessons?.length || course.totalLessons || 0;
  const title = course.title || "Untitled Course";
  const chapter = course.chapter || "Start Learning";
  const progress = course.progress || 0;
  const lessonsCompleted = course.lessonsCompleted || 0;
  const instructor =
    typeof course.instructor === "object"
      ? course.instructor?.name
      : course.instructors;

  return (
    <div className="group bg-[#111318] rounded-2xl overflow-hidden border border-[#23262D] hover:border-[#2F80ED]/60 transition-all duration-300 flex flex-col hover:shadow-[0_0_30px_-10px_rgba(47,128,237,0.4)]">
      <div className="relative h-28 bg-gradient-to-br from-[#161920] to-[#1C1F26] p-5 flex flex-col justify-end border-b border-[#23262D] overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#2F80ED]/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#A1A8B3] relative z-10">
          {category} • {totalLessons} Lessons
        </span>
        <h4 className="font-bold text-lg text-[#F5F7FA] truncate relative z-10 group-hover:text-[#2F80ED] transition-colors">
          {title}
        </h4>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs font-semibold text-[#A1A8B3] mb-3">
            Current: <span className="text-[#F5F7FA] font-bold">{chapter}</span>
          </p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[#A1A8B3]">Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#00E5B3]">{progress}%</span>
              <ProgressRing progress={progress} size={32} />
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#1C1F26] rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#A1A8B3]">
            <div className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-[#2F80ED]" />
              <span>
                <strong className="text-[#F5F7FA]">{lessonsCompleted}</strong>/{totalLessons} done
              </span>
            </div>
            {instructor && (
              <div className="flex items-center gap-1.5">
                <GraduationCap size={13} className="text-[#A1A8B3]" />
                <span className="truncate max-w-[100px]">{instructor}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onResume}
          className="w-full flex items-center justify-center gap-2 bg-[#2F80ED] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#256BCE] transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(47,128,237,0.3)] hover:shadow-[0_4px_20px_rgba(47,128,237,0.5)]"
        >
          <PlayCircle size={15} />
          <span>Continue Course</span>
        </button>
      </div>
    </div>
  );
}

// ─── Available Course Card ─────────────────────────────────
function AvailableCard({
  course,
  onEnroll,
  isEnrolling,
}: {
  course: any;
  onEnroll: () => void;
  isEnrolling: boolean;
}) {
  const totalLessons = course.lessons?.length || course.totalLessons || 0;
  const category = course.exam?.name || course.category || "General";
  const title = course.title || "Untitled Course";
  const rating = course.rating;
  const description = course.description;
  const duration = course.duration;
  const level = course.level;
  const instructors =
    typeof course.instructor === "object"
      ? course.instructor?.name
      : course.instructors;

  return (
    <div className="group bg-[#111318] rounded-2xl overflow-hidden border border-[#23262D] hover:border-[#00E5B3]/60 transition-all duration-300 flex flex-col hover:shadow-[0_0_30px_-10px_rgba(0,229,179,0.3)]">
      <div className="relative h-28 bg-gradient-to-br from-[#161920] to-[#1C1F26] p-5 flex flex-col justify-end border-b border-[#23262D] overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#00E5B3]/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0 mr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00E5B3]">
              {category} • {totalLessons} Lessons
            </span>
            <h4 className="font-bold text-lg text-[#F5F7FA] truncate group-hover:text-[#00E5B3] transition-colors">
              {title}
            </h4>
          </div>
          {rating && (
            <div className="flex items-center gap-1 bg-[#23262D] border border-[#323742] rounded-lg px-2 py-1 flex-shrink-0">
              <Star size={11} className="fill-[#F2C94C] text-[#F2C94C]" />
              <span className="text-[10px] font-bold text-[#F5F7FA]">{rating}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {description && (
            <p className="text-xs text-[#A1A8B3] leading-relaxed mb-4 line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {duration && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
                <Clock size={10} className="text-[#00E5B3]" /> {duration}
              </span>
            )}
            {level && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
                <Target size={10} className="text-[#2F80ED]" /> {level}
              </span>
            )}
          </div>
          {instructors && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2F80ED]/20 text-[#2F80ED] border border-[#2F80ED]/40 flex items-center justify-center text-[9px] font-bold">
                {instructors.charAt(0)}
              </div>
              <span className="text-xs text-[#A1A8B3] font-medium truncate">
                {instructors}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onEnroll}
          disabled={isEnrolling}
          className="w-full flex items-center justify-center gap-2 bg-[#00E5B3] text-black py-2.5 rounded-xl font-bold text-xs hover:bg-[#00C298] transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_4px_12px_rgba(0,229,179,0.3)] hover:shadow-[0_4px_20px_rgba(0,229,179,0.5)]"
        >
          {isEnrolling ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Enrolling...</span>
            </>
          ) : (
            <>
              <Plus size={15} />
              <span>Enroll Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Quick Action Card ─────────────────────────────────────
function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  color,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-[#111318] border border-[#23262D] rounded-2xl p-5 text-left hover:border-[#323742] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 border border-opacity-30`}>
          <Icon size={20} className={color} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-[#F5F7FA]">{label}</h4>
          <p className="text-[10px] text-[#A1A8B3]">{description}</p>
        </div>
        <ArrowRight size={16} className="ml-auto text-[#A1A8B3] group-hover:text-[#F5F7FA] transition-colors" />
      </div>
    </button>
  );
}

// ─── Featured Mock Exam Card ──────────────────────────────
function FeaturedMockExamCard({
  featured,
  isLoading,
  onStart,
}: {
  featured: any;
  isLoading: boolean;
  onStart: () => void;
}) {
  const examName = featured && typeof featured.exam === "object" ? featured.exam.name : "";
  const versionName =
    featured && typeof featured.examVersion === "object" ? featured.examVersion.examVersion : "";
  const status = featured?.status;
  const isLive = status === "active";
  const isUpcoming = status === "upcoming";
  // Count down to the start date for upcoming exams, otherwise to the end date
  const countdownTarget = isUpcoming ? featured?.startDate : featured?.endDate;
  const countdown = useCountdown(countdownTarget);

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#9B51E0]" />
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[260px]">
        <div className="w-14 h-14 bg-[#9B51E0]/10 border border-[#9B51E0]/30 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardCheck size={24} className="text-[#9B51E0]" />
        </div>
        <h3 className="font-bold text-base text-[#F5F7FA] mb-1">No Featured Mock Exam</h3>
        <p className="text-xs text-[#A1A8B3] max-w-sm mb-5">
          No mock exam is being featured right now. Browse all available mock exams and practice tests.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-[#161920] text-[#F5F7FA] border border-[#23262D] px-5 py-2.5 rounded-xl font-bold text-xs hover:border-[#9B51E0]/50 hover:text-[#9B51E0] transition-all"
        >
          <PlayCircle size={15} />
          Browse Mock Exams
        </button>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-[#111318] to-[#1C1F26] border border-[#23262D] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#9B51E0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-[#9B51E0]/20 text-[#9B51E0] border border-[#9B51E0]/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {isLive ? "Live Now" : isUpcoming ? "Upcoming Mock Exam" : "Featured Mock Exam"}
          </span>
          <span className="text-[11px] text-[#A1A8B3] flex items-center gap-1">
            <Clock size={12} className="text-[#9B51E0]" />
            {isUpcoming
              ? `Starts in ${countdown?.hours}:${countdown?.mins}:${countdown?.secs}`
              : countdown && countdown.diff > 0
              ? `${countdown.hours}:${countdown.mins}:${countdown.secs} remaining`
              : "Ended"}
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#F5F7FA] mb-1">{featured.title}</h2>
        <p className="text-xs text-[#A1A8B3] mb-6">
          {[examName, versionName, featured.totalQuestions ? `${featured.totalQuestions} Questions` : "", featured.duration ? `${featured.duration} Minutes` : ""]
            .filter(Boolean)
            .join(" • ") || featured.description || "Mock Exam"}
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-xs">
          {[
            { val: countdown?.hours ?? "--", label: "Hours" },
            { val: countdown?.mins ?? "--", label: "Mins" },
            { val: countdown?.secs ?? "--", label: "Secs" },
          ].map((t, i) => (
            <div key={i} className="bg-[#161920] border border-[#23262D] p-3 rounded-xl text-center">
              <div className="text-xl font-extrabold text-[#F5F7FA]">{t.val}</div>
              <div className="text-[9px] text-[#9B51E0] uppercase font-bold mt-0.5">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full bg-[#9B51E0] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#883ECE] transition-all shadow-[0_4px_12px_rgba(155,81,224,0.4)] hover:shadow-[0_4px_20px_rgba(155,81,224,0.6)]"
      >
        Start Exam Now
      </button>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const user = useAppSelector((state) => state.user.user);
  const userId = user?._id || "";
  const aiReport = useAppSelector((state) => state.aiPerformance.report);
  const aiReportLoading = useAppSelector((state) => state.aiPerformance.isLoading);
  const aiReportError = useAppSelector((state) => state.aiPerformance.error);
  const { data: userData } = useGetMeQuery();
  const { data: featuredExam, isLoading: isFeaturedLoading } = useGetFeaturedScheduleExamQuery();
  const [enrollCourse] = useEnrollCourseMutation();
  const { data: enrolledCourses, isLoading: isLoadingEnrolledCourses } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });

  // Backend populates selectedExams with full exam objects (see Settings.tsx / Perfomence.tsx)
  const selectedExams = (userData?.selectedExams as any[]) || [];

  // Set first exam as active tab if "All" is selected and exams exist
  useEffect(() => {
    if (activeTab === "All" && selectedExams && selectedExams.length > 0) {
      setActiveTab(selectedExams[0]._id);
    }
  }, [activeTab, selectedExams]);

  const { data: courseData, isLoading: isLoadingCourses } = useGetCourseByIdQuery(activeTab, {
    skip: activeTab === "All",
  });

  useGetCoursesQuery();
  useGetExamsQuery();

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
  const availableCoursesList = Array.isArray(courseData) ? courseData : [];

  // ─── AI Report derived data ──────────────────────────────
  const aiStats = aiReport?.stats;
  const aiInsights = aiReport?.ai_report;
  const subjectData = aiInsights?.subject_breakdown ?? [];
  const verdictColor =
    aiInsights?.score_analysis.verdict === "Excellent"
      ? "#00E5B3"
      : aiInsights?.score_analysis.verdict === "Good"
      ? "#2F80ED"
      : aiInsights?.score_analysis.verdict === "Needs Improvement"
      ? "#F2C94C"
      : "#EB5757";

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
      value: aiStats?.total_questions ?? "—",
      icon: ClipboardCheck,
      color: "text-[#00E5B3]",
      bg: "bg-[#00E5B3]/10 border-[#00E5B3]/20",
    },
    {
      title: "Correct Answers",
      value: aiStats?.correct_answers ?? "—",
      icon: Trophy,
      color: "text-[#9B51E0]",
      bg: "bg-[#9B51E0]/10 border-[#9B51E0]/20",
    },
    {
      title: "AI Score",
      value: aiStats ? `${aiStats.score_percentage}%` : "N/A",
      icon: BarChart3,
      color: "text-[#F2C94C]",
      bg: "bg-[#F2C94C]/10 border-[#F2C94C]/20",
    },
  ];

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

  return (
    <div className="w-full text-[#F5F7FA] space-y-8 max-w-8xl p-4 mx-auto">
      {/* ────── TOP HEADER ────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#23262D]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              {greeting}, <span className="text-[#2F80ED]">{user?.name || "Student"}</span> 👋
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#A1A8B3] flex items-center gap-2">
            <Calendar size={14} className="text-[#2F80ED]" />
            <span>{dateStr}</span>
            <span className="w-1 h-1 rounded-full bg-[#23262D]" />
            <span className="text-[#00E5B3] font-medium">Keep pushing forward!</span>
          </p>
        </div>
      
      </div>

      {/* ────── STATS ROW ────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`bg-[#111318] rounded-2xl p-5 border border-[#23262D] hover:border-[#323742] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.bg} border`}>
                <Icon size={20} className={item.color} />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] mb-1 leading-none">
                {item.value}
              </h2>
              <p className="text-[11px] font-semibold text-[#A1A8B3] uppercase tracking-wider">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>

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
          onClick={() => navigate("/courses")}
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
              onClick={() => navigate("/courses")}
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                active
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
            onClick={() => navigate("/courses")}
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
                onEnroll={() => handleEnroll(course._id)}
                isEnrolling={enrollingId === course._id}
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
          onStart={() => {
            if (featuredExam) {
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
          }}
        />

        {/* Right: AI Recommended */}
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-lg text-[#00E5B3]">
              <Brain size={16} />
            </div>
            <h2 className="font-bold text-base text-[#F5F7FA]">AI Recommended</h2>
            {aiReportLoading && (
              <span className="ml-auto text-[10px] text-[#A1A8B3] animate-pulse">
                Analyzing…
              </span>
            )}
            {aiReportError && (
              <span className="ml-auto text-[10px] text-[#EB5757]">Unavailable</span>
            )}
          </div>
          {aiInsights ? (
            <div className="h-[310px] overflow-y-auto space-y-3">
              <div
                className="rounded-xl p-3 border text-center"
                style={{ borderColor: `${verdictColor}40`, background: `${verdictColor}14` }}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: verdictColor }}>
                  {aiInsights.score_analysis.verdict}
                </div>
                <p className="text-[10px] text-[#A1A8B3] mt-1 leading-relaxed">
                  {aiInsights.score_analysis.message}
                </p>
              </div>
              {aiRecommendations.length > 0 ? (
                aiRecommendations.map((item, index) => (
                  <div
                    key={index}
                    className={`bg-[#161920] border border-[#23262D] border-l-4 ${item.color} rounded-xl p-3 hover:border-[#323742] transition-all`}
                  >
                    <h3 className="font-bold text-xs text-[#F5F7FA]">{item.title}</h3>
                    <p className="text-[10px] font-semibold text-[#A1A8B3] mt-0.5">{item.desc}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-2 py-8">
                  <Sparkles size={20} className="text-[#00E5B3]" />
                  <p className="text-[10px] text-[#A1A8B3]">
                    No focus areas yet — keep practicing and the AI will suggest them here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[310px] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-2xl flex items-center justify-center">
                <Brain size={20} className="text-[#00E5B3]" />
              </div>
              <p className="text-xs text-[#A1A8B3] max-w-[220px]">
                No AI insights yet. Complete a few quizzes to unlock your personalized performance analysis.
              </p>
            </div>
          )}
          <button
            onClick={() => navigate("/performance")}
            className="w-full text-xs font-bold text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl py-2 hover:bg-[#00E5B3]/20 transition-all"
          >
            View All AI Insights
          </button>
        </div>
      </div>

      {/* ────── BOTTOM CHARTS ROW ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Weekly Quiz Activity */}
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Weekly Study Activity</h3>
              <p className="text-xs text-[#A1A8B3] mt-0.5">Your daily quiz activity this week</p>
            </div>
            <span className="text-[11px] text-[#A1A8B3] bg-[#161920] px-2.5 py-1 rounded-lg border border-[#23262D]">
              This Week
            </span>
          </div>
          <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
            <BarChart3 size={22} className="text-[#2F80ED]" />
            <p className="text-xs text-[#A1A8B3]">
              No study activity yet — complete quizzes to see your weekly progress here.
            </p>
          </div>
        </div>

        {/* Subject Strength */}
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Subject-wise Accuracy</h3>
              <p className="text-xs text-[#A1A8B3] mt-0.5">
                {aiInsights
                  ? `Based on ${aiStats?.exam || "latest"} exam analysis`
                  : "No AI analysis yet"}
              </p>
            </div>
          </div>
          {subjectData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subjectData.map(
              (item: any, idx: number) => {
                const accuracy = item.accuracy ?? item.score;
                const isWeak = item.isWeak ?? accuracy < 40;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-3.5 flex flex-col justify-between aspect-square bg-[#161920] border ${
                      isWeak ? "border-[#EB5757]/40" : "border-[#23262D]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold leading-tight truncate">
                        {item.subject || item.name}
                      </h4>
                      {isWeak && (
                        <span className="text-[9px] font-bold text-[#EB5757] bg-[#EB5757]/10 px-1.5 py-0.5 rounded border border-[#EB5757]/30 flex-shrink-0">
                          Weak
                        </span>
                      )}
                    </div>
                    <div className="flex items-end gap-1 mt-auto">
                      <span
                        className={`text-2xl font-extrabold tracking-tight ${
                          isWeak ? "text-[#EB5757]" : "text-[#F5F7FA]"
                        }`}
                      >
                        {accuracy}
                      </span>
                      <span className="text-[10px] font-bold mb-1 opacity-80">%</span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
          ) : (
          <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
            <Target size={22} className="text-[#2F80ED]" />
            <p className="text-xs text-[#A1A8B3]">
              No subject data yet — generate an AI report to see your accuracy per subject.
            </p>
          </div>
          )}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}