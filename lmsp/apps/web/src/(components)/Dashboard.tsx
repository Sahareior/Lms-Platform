import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  ClipboardCheck,
  Brain,
  BarChart3,
  Search,
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
} from "@my-monorepo/store";
import { useGetEnrolledCourseQuery } from "@my-monorepo/store/src/redux/api/courseApi";

// ─── Weekly Activity Data ──────────────────────────────────
const weeklyActivity = [
  { day: "Sat", count: 3, height: "40%" },
  { day: "Sun", count: 7, height: "80%" },
  { day: "Mon", count: 5, height: "60%" },
  { day: "Tue", count: 9, height: "85%" },
  { day: "Wed", count: 6, height: "65%" },
  { day: "Thu", count: 11, height: "100%" },
  { day: "Fri", count: 4, height: "45%" },
];

// ─── Subject Strength Data (fallback) ─────────────────────
const defaultSubjectStrength = [
  { subject: "Bangladesh Affairs", accuracy: 82, isWeak: false },
  { subject: "Mathematics", accuracy: 54, isWeak: true },
  { subject: "English", accuracy: 68, isWeak: false },
  { subject: "General Science", accuracy: 71, isWeak: false },
  { subject: "Bangla", accuracy: 45, isWeak: true },
  { subject: "ICT", accuracy: 60, isWeak: false },
  { subject: "Intl. Affairs", accuracy: 77, isWeak: false },
  { subject: "Mental Ability", accuracy: 35, isWeak: true },
];

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
  const title = course.title || "Course Title";
  const chapter = course.chapter || "Getting Started";
  const progress = course.progress || 0;
  const lessonsCompleted = course.lessonsCompleted || 0;
  const instructor =
    typeof course.instructor === "object"
      ? course.instructor?.name || "Instructor"
      : course.instructors || "Instructor";

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
            <div className="flex items-center gap-1.5">
              <GraduationCap size={13} className="text-[#A1A8B3]" />
              <span className="truncate max-w-[100px]">{instructor}</span>
            </div>
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
  const title = course.title || "Course Title";
  const rating = course.rating || "4.5";
  const description =
    course.description || "Comprehensive curriculum prepared by subject experts.";
  const duration = course.duration || "Self-paced";
  const level = course.level || "Beginner";
  const instructors =
    typeof course.instructor === "object"
      ? course.instructor?.name || "Instructor"
      : course.instructors || "Instructor";

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
          <div className="flex items-center gap-1 bg-[#23262D] border border-[#323742] rounded-lg px-2 py-1 flex-shrink-0">
            <Star size={11} className="fill-[#F2C94C] text-[#F2C94C]" />
            <span className="text-[10px] font-bold text-[#F5F7FA]">{rating}</span>
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs text-[#A1A8B3] leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
              <Clock size={10} className="text-[#00E5B3]" /> {duration}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
              <Target size={10} className="text-[#2F80ED]" /> {level}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2F80ED]/20 text-[#2F80ED] border border-[#2F80ED]/40 flex items-center justify-center text-[9px] font-bold">
              {instructors.charAt(0)}
            </div>
            <span className="text-xs text-[#A1A8B3] font-medium truncate">
              {instructors}
            </span>
          </div>
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
  const [enrollCourse] = useEnrollCourseMutation();
  const { data: enrolledCourses, isLoading: isLoadingEnrolledCourses } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });

  const selectedExams = userData?.selectedExams;

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
      value: aiStats?.total_questions ?? 142,
      icon: ClipboardCheck,
      color: "text-[#00E5B3]",
      bg: "bg-[#00E5B3]/10 border-[#00E5B3]/20",
    },
    {
      title: "Correct Answers",
      value: aiStats?.correct_answers ?? 23,
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
              {greeting}, <span className="text-[#2F80ED]">{user?.name || "Sahareior"}</span> 👋
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#A1A8B3] flex items-center gap-2">
            <Calendar size={14} className="text-[#2F80ED]" />
            <span>{dateStr}</span>
            <span className="w-1 h-1 rounded-full bg-[#23262D]" />
            <span className="text-[#00E5B3] font-medium">Keep pushing forward!</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#111318] px-4 py-2.5 rounded-xl border border-[#23262D] w-full md:w-[320px] focus-within:border-[#2F80ED] transition-all">
          <Search size={18} className="text-[#A1A8B3]" />
          <input
            placeholder="Search courses, topics, questions..."
            className="outline-none flex-1 bg-transparent text-xs text-[#F5F7FA] placeholder-[#6B7280]"
          />
          <kbd className="hidden md:inline-flex text-[10px] font-semibold text-[#A1A8B3] bg-[#161920] px-1.5 py-0.5 rounded border border-[#23262D]">
            ⌘K
          </kbd>
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
                onResume={() => navigate(`/courses/${course._id}`)}
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
        <button
          onClick={() => setActiveTab("All")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeTab === "All"
              ? "bg-[#2F80ED] text-white border-[#2F80ED] shadow-[0_4px_12px_rgba(47,128,237,0.3)]"
              : "bg-[#111318] text-[#A1A8B3] border-[#23262D] hover:bg-[#161920] hover:text-[#F5F7FA]"
          }`}
        >
          All
        </button>
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
        {/* Left: Featured Mock Exam */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#111318] to-[#1C1F26] border border-[#23262D] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9B51E0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-[#9B51E0]/20 text-[#9B51E0] border border-[#9B51E0]/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Today's Mock Exam
              </span>
              <span className="text-[11px] text-[#A1A8B3] flex items-center gap-1">
                <Clock size={12} className="text-[#9B51E0]" /> 02:45:00 remaining
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#F5F7FA] mb-1">
              BCS 47th Full Length Mock
            </h2>
            <p className="text-xs text-[#A1A8B3] mb-6">
              General Knowledge • Math • English • 100 Questions • 200 Marks
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6 max-w-xs">
              {[
                { val: "02", label: "Hours" },
                { val: "45", label: "Mins" },
                { val: "00", label: "Secs" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="bg-[#161920] border border-[#23262D] p-3 rounded-xl text-center"
                >
                  <div className="text-xl font-extrabold text-[#F5F7FA]">{t.val}</div>
                  <div className="text-[9px] text-[#9B51E0] uppercase font-bold mt-0.5">
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate("/mock-exam")}
            className="w-full bg-[#9B51E0] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#883ECE] transition-all shadow-[0_4px_12px_rgba(155,81,224,0.4)] hover:shadow-[0_4px_20px_rgba(155,81,224,0.6)]"
          >
            Start Exam Now
          </button>
        </div>

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
              {(aiRecommendations.length > 0 ? aiRecommendations : [
                { title: "Bangla Grammar", desc: "Weak area - review recommended", color: "border-l-[#EB5757]" },
              ]).map((item, index) => (
                <div
                  key={index}
                  className={`bg-[#161920] border border-[#23262D] border-l-4 ${item.color} rounded-xl p-3 hover:border-[#323742] transition-all`}
                >
                  <h3 className="font-bold text-xs text-[#F5F7FA]">{item.title}</h3>
                  <p className="text-[10px] font-semibold text-[#A1A8B3] mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {[
                { title: "Bangladesh Constitution", desc: "Article 70 - Review recommended", color: "border-l-[#00E5B3]" },
                { title: "Ratio & Proportion", desc: "Practice high priority problems", color: "border-l-[#2F80ED]" },
                { title: "Bangla Grammar", desc: "Weak area - 45% accuracy", color: "border-l-[#EB5757]" },
                { title: "English Prepositions", desc: "Improving - 72% accuracy", color: "border-l-[#00C8FF]" },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`bg-[#161920] border border-[#23262D] border-l-4 ${item.color} rounded-xl p-3 hover:border-[#323742] transition-all`}
                >
                  <h3 className="font-bold text-xs text-[#F5F7FA]">{item.title}</h3>
                  <p className="text-[10px] font-semibold text-[#A1A8B3] mt-0.5">{item.desc}</p>
                </div>
              ))}
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
              <p className="text-xs text-[#A1A8B3] mt-0.5">Total: 45 quizzes this week</p>
            </div>
            <span className="text-[11px] text-[#A1A8B3] bg-[#161920] px-2.5 py-1 rounded-lg border border-[#23262D]">
              This Week
            </span>
          </div>
          <div className="flex justify-between items-end h-44 gap-3">
            {weeklyActivity.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-between h-full w-full">
                <div className="w-full flex flex-col items-center justify-end h-full gap-1">
                  <span className="text-[10px] font-bold text-[#A1A8B3]">{item.count}</span>
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                      idx === weeklyActivity.length - 1
                        ? "bg-gradient-to-t from-[#00E5B3] to-[#2F80ED] shadow-[0_4px_12px_rgba(0,229,179,0.3)]"
                        : "bg-[#23262D] hover:bg-[#2F80ED]"
                    }`}
                    style={{ height: item.height }}
                  />
                </div>
                <span
                  className={`text-[10px] mt-2 font-medium ${
                    idx === weeklyActivity.length - 1 ? "text-[#00E5B3] font-bold" : "text-[#A1A8B3]"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
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
                  : "Performance index based on last 30 days"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(aiInsights?.subject_breakdown?.length ? aiInsights.subject_breakdown : defaultSubjectStrength).map(
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
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}