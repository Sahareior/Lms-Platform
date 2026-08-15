import { useState, useEffect, useRef } from "react";
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
  CircleCheck,
  Shield,
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
import type { WeeklyAttempt } from "@my-monorepo/store";
import { useGetEnrolledCourseQuery } from "@my-monorepo/store/src/redux/api/courseApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

// ─── Weekly Study Activity helpers ──────────────────────────
const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Stats {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percentage: number;
  exam: string;
}

interface WeeklyDay {
  label: string;
  key: string;
  attempts: number;
  questions: number;
  correct: number;
}

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

function WeeklyTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const day = payload[0].payload as WeeklyDay;
  return (
    <div className="bg-[#1C1F26] border border-[#323742] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-bold text-[#F5F7FA] mb-1">{day.label}</p>
      <p className="text-[#A1A8B3]">
        Attempts: <span className="text-[#F5F7FA] font-semibold">{day.attempts}</span>
      </p>
      <p className="text-[#A1A8B3]">
        Questions: <span className="text-[#F5F7FA] font-semibold">{day.questions}</span>
      </p>
      <p className="text-[#A1A8B3]">
        Correct: <span className="text-[#00E5B3] font-semibold">{day.correct}</span>
      </p>
    </div>
  );
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
function EnrolledCard({
  course,
  onResume,
  onOpen,
}: {
  course: any;
  onResume: () => void;
  onOpen: () => void;
}) {
  const category = course.exam?.name || course.category || "General";
  const lessonsList = Array.isArray(course.lessons) ? course.lessons : [];
  const totalLessons = course.totalLessons || lessonsList.length || 0;
  const title = course.title || "Untitled Course";
  const chapter = course.chapter || "Start Learning";
  const lessonsCompleted =
    course.lessonsCompleted ??
    (Array.isArray(course.completedLessons) ? course.completedLessons.length : 0);
  // Prefer the backend-computed progress; fall back to client-side derivation
  const progress = Math.min(
    100,
    Math.round(
      course.progress ?? (totalLessons ? (lessonsCompleted / totalLessons) * 100 : 0)
    )
  );
  const instructor =
    typeof course.instructor === "object"
      ? course.instructor?.name
      : course.instructors;

  return (
    <div
      onClick={onOpen}
      className="group bg-[#111318] rounded-2xl overflow-hidden border border-[#23262D] hover:border-[#2F80ED]/60 transition-all duration-300 flex flex-col cursor-pointer hover:shadow-[0_0_30px_-10px_rgba(47,128,237,0.4)]"
    >
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
          onClick={(e) => {
            e.stopPropagation();
            onResume();
          }}
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
  enrolledCourse,
  onOpen
}: {
  course: any;
  onEnroll: () => void;
  isEnrolling: boolean;
  enrolledCourse: any[];
  onOpen: () => void;
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

      const isEnrolled = enrolledCourse.some((items:any) => items._id === course._id)

  return (
    <div
      onClick={onOpen}
      className="group bg-[#111318] rounded-2xl overflow-hidden border border-[#23262D] hover:border-[#00E5B3]/60 transition-all duration-300 flex flex-col cursor-pointer hover:shadow-[0_0_30px_-10px_rgba(0,229,179,0.3)]"
    >
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
          onClick={(e) => {
            e.stopPropagation();
            onEnroll();
          }}
          disabled={isEnrolling || isEnrolled}
          className="w-full flex items-center justify-center gap-2 bg-[#00E5B3] text-black py-2.5 rounded-xl font-bold text-xs hover:bg-[#00C298] transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_4px_12px_rgba(0,229,179,0.3)] hover:shadow-[0_4px_20px_rgba(0,229,179,0.5)]"
        >
          {isEnrolling ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Enrolling...</span>
            </>
          ) : (
            <>
             {
              isEnrolled? (
               <div className="flex justify-center items-center gap-2">
                   <CircleCheck  size={15} />
              <span>Enrolled</span>
                </div>
              ):(
                <div className="flex justify-center items-center gap-2">
                   <Plus size={15} />
              <span>Enroll Now</span>
                </div>
              )
             }
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
  // Expired when the backend marked it completed/cancelled, or the countdown ran out
  const isExpired =
    status === "completed" ||
    status === "cancelled" ||
    (!isUpcoming && countdown?.diff === 0);

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

  // Time limit expired → show a suitable ended/cancelled banner instead of the live card
  if (isExpired) {
    const isCancelled = status === "cancelled";
    return (
      <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[260px]">
        <div className="w-14 h-14 bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-2xl flex items-center justify-center mb-4">
          <Clock size={24} className="text-[#EB5757]" />
        </div>
        <span className="px-2.5 py-1 bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
          {isCancelled ? "Cancelled" : "Time Limit Expired"}
        </span>
        <h3 className="font-bold text-base text-[#F5F7FA] mb-1">
          {isCancelled ? "Mock Exam Cancelled" : "Mock Exam Has Ended"}
        </h3>
        <p className="text-xs text-[#A1A8B3] max-w-sm mb-5">
          {isCancelled
            ? "This mock exam was cancelled. Browse all available mock exams and practice tests."
            : `The time window for "${featured.title}" has expired. Browse all available mock exams and practice tests.`}
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
              : `${countdown?.hours}:${countdown?.mins}:${countdown?.secs} remaining`}
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
  const [stats,setStats] = useState<Stats>({})
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
        setStats(res?.stats)
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

 console.log(stats,'tyjs')

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


console.log(quizOverview,'this is q overview')
console.log(examOverview,'this is exam overview')
console.log(activeExamOverview,'thsi is active exam')
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
      <div>
                {user?.role === 'admin' && (
  <div className="mb-3">
    <div className="h-px bg-[#23262D] mb-3" />
    <button
      onClick={() => navigate('/admin')}
      className="group relative w-full md:w-auto inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#1a1d24] to-[#111318] border border-[#2F80ED]/20 rounded-2xl hover:border-[#2F80ED]/60 transition-all duration-300 hover:shadow-[0_8px_30px_-5px_rgba(47,128,237,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
    >
      {/* Icon container with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#2F80ED]/20 rounded-xl blur-lg scale-150 group-hover:bg-[#2F80ED]/40 transition-all duration-300" />
        <div className="relative p-2.5 bg-gradient-to-br from-[#2F80ED] to-[#1a5cb8] rounded-xl border border-[#2F80ED]/40 shadow-[0_4px_12px_rgba(47,128,237,0.3)]">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>
      
      {/* Text content */}
      <div className="flex flex-col items-start">
        <span className="font-bold text-sm text-[#F5F7FA] group-hover:text-white transition-colors">
          Admin Panel
        </span>
        <span className="text-[10px] text-[#A1A8B3] font-medium uppercase tracking-wider">
          Manage Everything
        </span>
      </div>
      
      {/* Arrow indicator */}
      <div className="ml-2 flex items-center gap-1">
        <ArrowRight 
          size={16} 
          className="text-[#A1A8B3] group-hover:text-[#2F80ED] group-hover:translate-x-1 transition-all duration-300" 
        />
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />
      </div>
    </button>
  </div>
)}
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

      {/* ────── EXAMS AT A GLANCE (per selected exam accuracy) ────── */}
      {examOverview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#9B51E0]/10 border border-[#9B51E0]/30">
              <BarChart3 size={18} className="text-[#9B51E0]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5F7FA] tracking-tight">
                Your Exams at a Glance
              </h2>
              <p className="text-xs text-[#A1A8B3]">
                Accuracy across all your selected exams
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {examOverview.map((exam) => {
              const accColor =
                exam.accuracy >= 70
                  ? "text-[#00E5B3]"
                  : exam.accuracy >= 40
                  ? "text-[#2F80ED]"
                  : "text-[#EB5757]";
              const barColor =
                exam.accuracy >= 70
                  ? "bg-gradient-to-r from-[#00E5B3] to-[#2F80ED]"
                  : exam.accuracy >= 40
                  ? "bg-[#2F80ED]"
                  : "bg-[#EB5757]";
              return (
                <div
                  key={exam.examId}
                  className="bg-[#111318] rounded-2xl p-5 border border-[#23262D] hover:border-[#323742] transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="text-sm font-bold text-[#F5F7FA] truncate">
                      {exam.examName}
                    </h4>
                    <span className={`text-base font-extrabold flex-shrink-0 ${accColor}`}>
                      {exam.accuracy}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1C1F26] rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.max(4, exam.accuracy)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#A1A8B3]">
                    {exam.questions} questions • {exam.attempts} attempt{exam.attempts !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          onStart={() => {
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
          }}
        />

        {/* Right: AI Recommended */}
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-lg text-[#00E5B3]">
              <Brain size={16} />
            </div>
            <h2 className="font-bold text-base text-[#F5F7FA]">AI Recommended</h2>
            {scope !== "all" && aiStats?.exam && (
              <span className="ml-auto text-[10px] text-[#A1A8B3] bg-[#161920] px-2 py-0.5 rounded-lg border border-[#23262D]">
                {aiStats.exam}
              </span>
            )}
            {aiReportLoading && (
              <span className="ml-auto text-[10px] text-[#A1A8B3] animate-pulse">
                Analyzing…
              </span>
            )}
            {aiReportError && (
              <span className="ml-auto text-[10px] text-[#EB5757]">Unavailable</span>
            )}
          </div>
          {hasRecommendationContent ? (
            <div className="h-[310px] overflow-y-auto space-y-3">
              <div
                className="rounded-xl p-3 border text-center"
                style={{ borderColor: `${verdictColor}40`, background: `${verdictColor}14` }}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: verdictColor }}>
                  {activeVerdict}
                </div>
                <p className="text-[10px] text-[#A1A8B3] mt-1 leading-relaxed">
                  {verdictMessage}
                </p>
              </div>
              {(aiInsights?.study_plan?.length ?? 0) > 0 && (
                <div className="rounded-xl p-3 border border-[#2F80ED]/30 bg-[#2F80ED]/10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar size={12} className="text-[#2F80ED]" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#2F80ED]">
                      Study Plan
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {aiInsights!.study_plan.slice(0, 3).map((plan, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[10px]">
                        <span className="font-bold text-[#F5F7FA] flex-shrink-0">{plan.day}</span>
                        <span className="text-[#A1A8B3] leading-snug">
                          {plan.title}
                          <span className="text-[#6B7280] block">{plan.duration_minutes} min</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {recommendations.length > 0 ? (
                recommendations.map((item, index) => (
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
                    No focus areas yet — keep practicing and we'll surface them here.
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
                No performance data yet. Complete a few quizzes to unlock your personalized analysis.
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
        {/* Weekly Study Activity */}
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Weekly Study Activity</h3>
              <p className="text-xs text-[#A1A8B3] mt-0.5">Your daily quiz activity this week</p>
            </div>
            <span className="text-[11px] text-[#A1A8B3] bg-[#161920] px-2.5 py-1 rounded-lg border border-[#23262D]">
              {isLoadingWeekly
                ? "This Week"
                : `${weeklyTotalAttempts} attempt${weeklyTotalAttempts !== 1 ? "s" : ""} this week`}
            </span>
          </div>
          {isLoadingWeekly ? (
            <div className="flex items-center justify-center h-44">
              <Loader2 size={22} className="animate-spin text-[#2F80ED]" />
            </div>
          ) : weeklyTotalAttempts > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDays} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#A1A8B3", fontSize: 11 }}
                    axisLine={{ stroke: "#23262D" }}
                    tickLine={false}
                  />
                  <YAxis
                    width={32}
                    allowDecimals={false}
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<WeeklyTooltip />}
                    cursor={{ fill: "rgba(47,128,237,0.08)" }}
                  />
                  <Bar dataKey="attempts" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    {weeklyDays.map((d, i) => (
                      <Cell
                        key={d.key}
                        fill={i === todayIndex ? "#00E5B3" : "#2F80ED"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
              <BarChart3 size={22} className="text-[#2F80ED]" />
              <p className="text-xs text-[#A1A8B3] max-w-[260px]">
                No study activity yet this week — complete quizzes to see your weekly progress
                here.
              </p>
            </div>
          )}
        </div>

        {/* Subject Strength */}
        <div className="bg-[#111318] h-[400px] overflow-y-auto border border-[#23262D] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Subject-wise Accuracy</h3>
              <p className="text-xs text-[#A1A8B3] mt-0.5">
                {subjectData.length > 0
                  ? scope !== "all"
                    ? aiStats?.exam
                      ? `Based on ${aiStats.exam} exam analysis`
                      : "Based on your quiz activity"
                    : selectedExams.length > 1
                    ? `Across all ${selectedExams.length} selected exams`
                    : aiStats?.exam
                    ? `Based on ${aiStats.exam} exam analysis`
                    : "Based on your quiz activity"
                  : "No analysis yet"}
              </p>
            </div>
          </div>
          {subjectData.length > 0 ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#23262D] bg-gradient-to-br from-[#161920] to-[#1C1F26] p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-[#2F80ED]/10 border border-[#2F80ED]/20">
                      <Layers size={14} className="text-[#2F80ED]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#A1A8B3]">
                      Performance snapshot
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#F5F7FA]">
                    Avg. accuracy {(
                      subjectData.reduce((sum: number, item: any) => {
                        const accuracy = Number(item.accuracy ?? item.score ?? 0);
                        return sum + (Number.isFinite(accuracy) ? accuracy : 0);
                      }, 0) / subjectData.length
                    ).toFixed(0)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#A1A8B3]">Strong / Needs work</p>
                  <p className="text-sm font-bold text-[#00E5B3]">
                    {subjectData.filter((item: any) => {
                      const accuracy = Number(item.accuracy ?? item.score ?? 0);
                      return Number.isFinite(accuracy) && accuracy >= 70;
                    }).length}/{subjectData.length}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {subjectData.map((item: any, idx: number) => {
                  const accuracy = Number(item.accuracy ?? item.score ?? 0);
                  const safeAccuracy = Number.isFinite(accuracy) ? accuracy : 0;
                  const isWeak = item.isWeak ?? safeAccuracy < 40;
                  const isStrong = safeAccuracy >= 70;
                  const subjectName = item.subject || item.name || "Subject";
                  const badgeText = isWeak ? "Needs focus" : isStrong ? "Strong" : "Steady";
                  const badgeClasses = isWeak
                    ? "text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/20"
                    : isStrong
                    ? "text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/20"
                    : "text-[#F2C94C] bg-[#F2C94C]/10 border-[#F2C94C]/20";
                  const barClasses = isWeak
                    ? "from-[#EB5757] to-[#F2C94C]"
                    : "from-[#00E5B3] to-[#2F80ED]";

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#23262D] bg-[#161920] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#F5F7FA] truncate">
                            {subjectName}
                          </h4>
                          <p className="text-[11px] text-[#A1A8B3] mt-0.5">
                            {isWeak
                              ? "A bit more practice will boost this area quickly."
                              : "This subject is performing well and staying consistent."}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeClasses}`}>
                            {badgeText}
                          </span>
                          <div className="mt-2 flex items-end justify-end gap-1">
                            <span className={`text-lg font-extrabold ${isWeak ? "text-[#EB5757]" : "text-[#F5F7FA]"}`}>
                              {safeAccuracy}
                            </span>
                            <span className="text-[10px] font-bold mb-1 text-[#A1A8B3]">%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-[#1C1F26] overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barClasses}`}
                          style={{ width: `${Math.max(8, safeAccuracy)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
              <Target size={22} className="text-[#2F80ED]" />
              <p className="text-xs text-[#A1A8B3]">
                No subject data yet — complete quizzes to see your accuracy per subject.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
