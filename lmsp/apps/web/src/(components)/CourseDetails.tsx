import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  Target,
  BookOpen,
  PlayCircle,
  Loader2,
  Plus,
  CircleCheck,
  Lock,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  useAppSelector,
  useGetCourseByIdQuery,
  useEnrollCourseMutation,
} from "@my-monorepo/store";
import { useGetEnrolledCourseQuery } from "@my-monorepo/store/src/redux/api/courseApi";
import { useTheme } from "../theme/ThemeContext";


// ─── Duration formatter ────────────────────────────────────
function formatDuration(totalMinutes: number) {
  if (!totalMinutes) return "Self-paced";
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

// ─── Small stat tile ───────────────────────────────────────
function StatTile({
  icon,
  label,
  value,
  accent,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  isDark: boolean;
}) {
  if (!isDark) {
    return (
      <div className="bg-[#f2efe9] border-2 border-[#1a1a1a] rounded-lg p-2.5 shadow-[2px_2px_0px_0px_#1a1a1a]">
        <div className="w-7 h-7 rounded-md bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center mb-1.5 text-[#f2efe9]">
          {icon}
        </div>
        <div className="text-sm font-black text-[#1a1a1a] leading-none truncate font-serif">
          {value}
        </div>
        <div className="text-[9px] uppercase tracking-widest font-black text-[#333] mt-1 font-serif">
          {label}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#161920] border border-[#23262D] rounded-xl p-3">
      <div
        className={`w-7 h-7 rounded-lg border flex items-center justify-center mb-2 ${accent}`}
      >
        {icon}
      </div>
      <div className="text-base font-extrabold text-[#F5F7FA] leading-none truncate">
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wider font-bold text-[#A1A8B3] mt-1">
        {label}
      </div>
    </div>
  );
}

// ─── Course Details Page ───────────────────────────────────
export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [justEnrolled, setJustEnrolled] = useState(false);
  const { isDark } = useTheme();

  const userId = useAppSelector((state) => state.user.user?._id) || "";

  const {
    data: course,
    isLoading,
    isError,
  } = useGetCourseByIdQuery(courseId, { skip: !courseId });
  const { data: enrolledCourses, refetch: refetchEnrolled } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });
  const [enrollCourse] = useEnrollCourseMutation();

  const enrolledIds = useMemo(() => {
    const list = Array.isArray(enrolledCourses) ? enrolledCourses : [];
    return new Set(list.map((c: any) => c._id));
  }, [enrolledCourses]);

  const isEnrolled = courseId ? enrolledIds.has(courseId) : false;
  const canAccess = isEnrolled || justEnrolled;

  const lessons = useMemo(() => {
    const list = Array.isArray(course?.lessons) ? course.lessons : [];
    return [...list].sort(
      (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
    );
  }, [course]);

  const subjects = Array.isArray(course?.subjects) ? course.subjects : [];
  const totalMinutes = lessons.reduce(
    (sum: number, l: any) => sum + (l.duration || 0),
    0
  );
  const studentsCount = Array.isArray(course?.enrolledStudents)
    ? course.enrolledStudents.length
    : course?.students || 0;
  const totalLessons = lessons.length || course?.totalLessons || 0;

  const examName = course?.exam?.name || course?.category || "General";
  const title = course?.title || "Untitled Course";
  const rating = course?.rating;
  const level = course?.level;

  const handleEnroll = async () => {
    if (!userId || !courseId || isEnrolled) return;
    setEnrolling(true);
    try {
      await enrollCourse({ userId, courseId }).unwrap();
      setJustEnrolled(true);
      refetchEnrolled();
    } catch {
      // leave button usable on failure
    } finally {
      setEnrolling(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className={`w-full max-w-8xl p-4 mx-auto flex items-center justify-center py-24 ${
          isDark ? "" : "min-h-screen"
        }`}
      >
        <Loader2
          size={28}
          className={`animate-spin ${
            isDark ? "text-[#00E5B3]" : "text-[#b91c1c]"
          }`}
        />
      </div>
    );
  }

  // ─── Error / Not found ───────────────────────────────────
  if (isError || !course) {
    return (
      <div
        className={`w-full max-w-8xl p-4 mx-auto ${
          isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a]"
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-xs transition-all ${
            isDark
              ? "font-bold text-[#A1A8B3] hover:text-[#00E5B3]"
              : "font-black font-serif text-[#333] hover:text-[#b91c1c]"
          }`}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div
          className={`rounded-2xl p-10 text-center mt-4 ${
            isDark
              ? "bg-[#111318] border border-[#23262D]"
              : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark
                ? "bg-[#161920] border border-[#23262D]"
                : "bg-[#e0dcd5] border-2 border-[#1a1a1a]"
            }`}
          >
            <BookOpen
              size={28}
              className={isDark ? "text-[#6B7280]" : "text-[#1a1a1a]"}
            />
          </div>
          <p
            className={`text-sm ${
              isDark
                ? "font-semibold text-[#A1A8B3]"
                : "font-black font-serif text-[#1a1a1a]"
            }`}
          >
            Course not found
          </p>
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-[#6B7280]" : "text-[#333] font-serif"
            }`}
          >
            It may have been removed or the link is invalid
          </p>
          <button
            onClick={() => navigate("/available-courses")}
            className={`mt-5 text-xs ${
              isDark
                ? "font-bold text-[#00E5B3] hover:underline"
                : "font-black font-serif text-[#b91c1c] hover:underline"
            }`}
          >
            Browse available courses
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────
  return (
    <div
      className={`w-full space-y-4 max-w-8xl p-4 mx-auto ${
        isDark ? "text-[#F5F7FA]" : "text-[#1a1a1a]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundImage:
                "radial-gradient(#d8d4cb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }
      }
    >
      {/* ────── BACK ────── */}
      <button
        onClick={() => navigate(-1)}
        className={`inline-flex items-center gap-2 text-xs transition-all ${
          isDark
            ? "font-bold text-[#A1A8B3] hover:text-[#00E5B3]"
            : "font-black font-serif text-[#333] hover:text-[#b91c1c]"
        }`}
      >
        <ArrowLeft size={14} /> Back to courses
      </button>

      {/* ────── HERO ────── */}
      <div
        className={`relative overflow-hidden rounded-2xl ${
          isDark
            ? "border border-[#23262D] bg-gradient-to-br from-[#161920] to-[#1C1F26] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            : "border-2 border-[#1a1a1a] bg-[#f2efe9] shadow-[4px_4px_0px_0px_#1a1a1a]"
        }`}
        style={
          isDark
            ? undefined
            : {
                backgroundImage:
                  "radial-gradient(#d8d4cb 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }
        }
      >
        {isDark && (
          <>
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00E5B3]/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-28 -left-20 w-72 h-72 bg-[#2F80ED]/8 rounded-full blur-3xl" />
          </>
        )}

        <div className="relative z-10 p-5 md:p-7 grid lg:grid-cols-[1fr_280px] gap-6 items-stretch">
          {/* Left: course info */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                  isDark
                    ? "bg-[#00E5B3]/10 border border-[#00E5B3]/30 text-[#00E5B3] font-bold"
                    : "bg-[#1a1a1a] border border-[#1a1a1a] text-[#f2efe9] font-black font-serif"
                }`}
              >
                {examName}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                  isDark
                    ? "bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED] font-bold"
                    : "bg-[#f2efe9] border border-[#1a1a1a] text-[#1a1a1a] font-black font-serif"
                }`}
              >
                {totalLessons} Lessons
              </span>
              {level && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                    isDark
                      ? "bg-[#9B51E0]/10 border border-[#9B51E0]/30 text-[#9B51E0] font-bold"
                      : "bg-[#f2efe9] border border-[#b91c1c] text-[#b91c1c] font-black font-serif"
                  }`}
                >
                  {level}
                </span>
              )}
            </div>

            <h1
              className={`text-2xl md:text-3xl leading-tight mb-2.5 ${
                isDark
                  ? "font-extrabold tracking-tight text-[#F5F7FA]"
                  : "font-black tracking-tight text-[#1a1a1a] font-serif"
              }`}
            >
              {title}
            </h1>

            {course?.description && (
              <p
                className={`text-sm leading-relaxed max-w-2xl mb-5 ${
                  isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                }`}
              >
                {course.description}
              </p>
            )}

            <div
              className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs ${
                isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
              }`}
            >
              {rating && (
                <span className="flex items-center gap-1.5">
                  <Star
                    size={13}
                    className={
                      isDark
                        ? "fill-[#F2C94C] text-[#F2C94C]"
                        : "fill-[#b91c1c] text-[#b91c1c]"
                    }
                  />
                  <strong
                    className={
                      isDark
                        ? "text-[#F5F7FA]"
                        : "text-[#1a1a1a] font-black font-serif"
                    }
                  >
                    {rating}
                  </strong>{" "}
                  Rating
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users
                  size={13}
                  className={isDark ? "text-[#00E5B3]" : "text-[#1a1a1a]"}
                />
                <strong
                  className={
                    isDark
                      ? "text-[#F5F7FA]"
                      : "text-[#1a1a1a] font-black font-serif"
                  }
                >
                  {studentsCount}
                </strong>{" "}
                Students
              </span>
              <span className="flex items-center gap-1.5">
                <Clock
                  size={13}
                  className={isDark ? "text-[#9B51E0]" : "text-[#1a1a1a]"}
                />
                <strong
                  className={
                    isDark
                      ? "text-[#F5F7FA]"
                      : "text-[#1a1a1a] font-black font-serif"
                  }
                >
                  {formatDuration(totalMinutes)}
                </strong>{" "}
                Total
              </span>
            </div>
          </div>

          {/* Right: CTA panel */}
          <div
            className={`rounded-xl p-4 flex flex-col justify-between gap-4 ${
              isDark
                ? "bg-[#111318] border border-[#23262D]"
                : "bg-[#f7f3ec] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
            }`}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <StatTile
                isDark={isDark}
                icon={<BookOpen size={13} />}
                label="Lessons"
                value={totalLessons}
                accent="bg-[#00E5B3]/10 border-[#00E5B3]/25 text-[#00E5B3]"
              />
              <StatTile
                isDark={isDark}
                icon={<Clock size={13} />}
                label="Duration"
                value={formatDuration(totalMinutes)}
                accent="bg-[#9B51E0]/10 border-[#9B51E0]/25 text-[#9B51E0]"
              />
              <StatTile
                isDark={isDark}
                icon={<Target size={13} />}
                label="Level"
                value={level || "All"}
                accent="bg-[#2F80ED]/10 border-[#2F80ED]/25 text-[#2F80ED]"
              />
              <StatTile
                isDark={isDark}
                icon={<Users size={13} />}
                label="Students"
                value={studentsCount}
                accent="bg-[#F2C94C]/10 border-[#F2C94C]/25 text-[#F2C94C]"
              />
            </div>

            {canAccess ? (
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] ${
                  isDark
                    ? "bg-[#2F80ED] text-white font-bold hover:bg-[#256BCE] shadow-[0_4px_12px_rgba(47,128,237,0.3)] hover:shadow-[0_4px_20px_rgba(47,128,237,0.5)]"
                    : "bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                }`}
              >
                <PlayCircle size={16} />
                Continue Learning
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] disabled:opacity-60 ${
                  isDark
                    ? "bg-[#00E5B3] text-black font-bold hover:bg-[#00C298] shadow-[0_4px_12px_rgba(0,229,179,0.3)] hover:shadow-[0_4px_20px_rgba(0,229,179,0.5)]"
                    : "bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                }`}
              >
                {enrolling ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Enroll Now
                  </>
                )}
              </button>
            )}
            {justEnrolled && (
              <p
                className={`flex items-center justify-center gap-1.5 text-xs ${
                  isDark
                    ? "font-bold text-[#00E5B3]"
                    : "font-black font-serif text-[#b91c1c]"
                }`}
              >
                <CircleCheck size={13} /> You're enrolled! Start learning now.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ────── CURRICULUM + SIDEBAR ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Lessons / Curriculum */}
        <div
          className={`lg:col-span-2 rounded-xl overflow-hidden ${
            isDark
              ? "bg-[#111318] border border-[#23262D]"
              : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
          }`}
        >
          {/* Header with progress bar */}
          <div
            className={`p-4 border-b ${
              isDark
                ? "border-[#23262D] bg-[#161920]/50"
                : "border-[#d8d4cb] bg-[#e8e2d4]"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark
                      ? "bg-[#2F80ED]/10 border border-[#2F80ED]/30"
                      : "bg-[#1a1a1a] border border-[#1a1a1a]"
                  }`}
                >
                  <BookOpen
                    size={14}
                    className={isDark ? "text-[#2F80ED]" : "text-[#f2efe9]"}
                  />
                </div>
                <div className="min-w-0">
                  <h2
                    className={`text-sm leading-tight ${
                      isDark
                        ? "font-bold text-[#F5F7FA]"
                        : "font-black font-serif text-[#1a1a1a]"
                    }`}
                  >
                    Course Curriculum
                  </h2>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                    }`}
                  >
                    {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} ·{" "}
                    {formatDuration(totalMinutes)} total
                  </p>
                </div>
              </div>

              {/* Status legend (only meaningful if enrolled) */}
              {canAccess && lessons.length > 0 && (
                <div className="hidden sm:flex items-center gap-2.5 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span
                      className={
                        isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif font-bold"
                      }
                    >
                      Done
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDark ? "bg-[#2F80ED]" : "bg-[#b91c1c]"
                      }`}
                    />
                    <span
                      className={
                        isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif font-bold"
                      }
                    >
                      Current
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span
                      className={
                        isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif font-bold"
                      }
                    >
                      Locked
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar — visible only when enrolled */}
            {canAccess && lessons.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span
                    className={
                      isDark
                        ? "text-[#A1A8B3] font-medium"
                        : "text-[#333] font-bold font-serif"
                    }
                  >
                    Your progress
                  </span>
                  <span
                    className={
                      isDark
                        ? "text-[#00E5B3] font-bold"
                        : "text-[#b91c1c] font-black font-serif"
                    }
                  >
                    {Math.round(
                      (Math.min(2, lessons.length) / lessons.length) * 100
                    )}
                    % complete
                  </span>
                </div>
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isDark
                      ? "bg-[#1C1F26]"
                      : "bg-[#e0dcd5] border border-[#1a1a1a]"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDark
                        ? "bg-gradient-to-r from-[#2F80ED] to-[#00E5B3]"
                        : "bg-[#b91c1c]"
                    }`}
                    style={{
                      width: `${
                        (Math.min(2, lessons.length) / lessons.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lesson list */}
          {lessons.length > 0 ? (
            <div className="p-3">
              <ol className="relative space-y-1.5">
                {/* Vertical connector line */}
                <div
                  className={`absolute left-[19px] top-3 bottom-3 w-[2px] rounded-full ${
                    isDark ? "bg-[#23262D]" : "bg-[#d8d4cb]"
                  }`}
                  aria-hidden="true"
                />

                {lessons.map((lesson: any, i: number) => {
                  const isPreview = !!lesson.isPreview;
                  const isCurrent = canAccess && i === Math.min(2, lessons.length - 1);
                  const isDone = canAccess && i < Math.min(2, lessons.length - 1);
                  const isLocked = !canAccess && !isPreview;

                  const statusDot = isDone
                    ? isDark
                      ? "bg-emerald-500 border-emerald-400 text-emerald-500"
                      : "bg-[#1a1a1a] border-[#1a1a1a] text-[#f2efe9]"
                    : isCurrent
                      ? isDark
                        ? "bg-[#2F80ED] border-[#2F80ED] text-white"
                        : "bg-[#b91c1c] border-[#b91c1c] text-[#f2efe9]"
                      : isDark
                        ? "bg-[#161920] border-[#23262D] text-[#6B7280]"
                        : "bg-[#f2efe9] border-[#1a1a1a] text-[#333]";

                  return (
                    <li
                      key={lesson._id || i}
                      className={`relative flex items-center gap-3 p-2.5 rounded-lg border transition-all group cursor-pointer ${
                        isCurrent
                          ? isDark
                            ? "bg-[#2F80ED]/8 border-[#2F80ED]/40 shadow-[0_0_16px_-6px_rgba(47,128,237,0.4)]"
                            : "bg-[#faf8f5] border-[#b91c1c] shadow-[2px_2px_0px_0px_#b91c1c]"
                          : isDark
                            ? "bg-transparent border-transparent hover:bg-[#161920] hover:border-[#23262D]"
                            : "bg-transparent border-transparent hover:bg-[#e8e2d4] hover:border-[#1a1a1a]"
                      } ${isLocked ? "opacity-75" : ""}`}
                    >
                      {/* Status badge */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] ${statusDot}`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={14} />
                          ) : isCurrent ? (
                            <PlayCircle
                              size={14}
                              className={isDark ? "text-white" : ""}
                            />
                          ) : isLocked ? (
                            <Lock size={12} />
                          ) : (
                            <span
                              className={
                                isDark ? "font-bold" : "font-black font-serif"
                              }
                            >
                              {i + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Lesson content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm truncate ${
                              isCurrent
                                ? isDark
                                  ? "font-bold text-[#F5F7FA]"
                                  : "font-black font-serif text-[#1a1a1a]"
                                : isDone
                                  ? isDark
                                    ? "font-semibold text-[#A1A8B3]"
                                    : "font-bold font-serif text-[#333]"
                                  : isDark
                                    ? "font-semibold text-[#F5F7FA]"
                                    : "font-bold font-serif text-[#1a1a1a]"
                            }`}
                          >
                            {lesson.title || `Lesson ${i + 1}`}
                          </p>

                          {isPreview && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase flex-shrink-0 ${
                                isDark
                                  ? "bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/25 font-bold"
                                  : "bg-[#f2efe9] text-[#b91c1c] border border-[#b91c1c] font-black font-serif"
                              }`}
                            >
                              Free preview
                            </span>
                          )}
                          {isCurrent && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase flex-shrink-0 ${
                                isDark
                                  ? "bg-[#2F80ED]/15 text-[#2F80ED] border border-[#2F80ED]/30 font-bold"
                                  : "bg-[#1a1a1a] text-[#f2efe9] border border-[#1a1a1a] font-black font-serif"
                              }`}
                            >
                              ▶ Up next
                            </span>
                          )}
                          {isDone && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase flex-shrink-0 ${
                                isDark
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold"
                                  : "bg-[#e0dcd5] text-[#1a1a1a] border border-[#1a1a1a] font-black font-serif"
                              }`}
                            >
                              ✓ Done
                            </span>
                          )}
                          {isLocked && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase flex-shrink-0 ${
                                isDark
                                  ? "bg-[#161920] text-[#6B7280] border border-[#23262D] font-bold"
                                  : "bg-[#e0dcd5] text-[#666] border border-[#d8d4cb] font-bold font-serif"
                              }`}
                            >
                              Locked
                            </span>
                          )}
                        </div>

                        {lesson.description && (
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                            }`}
                          >
                            {lesson.description}
                          </p>
                        )}
                      </div>

                      {/* Duration + action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {lesson.duration ? (
                          <span
                            className={`flex items-center gap-1 text-[11px] ${
                              isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                            }`}
                          >
                            <Clock size={11} /> {lesson.duration}m
                          </span>
                        ) : null}

                        {canAccess && !isLocked && (
                          <PlayCircle
                            size={16}
                            className={`transition-transform group-hover:scale-110 ${
                              isDark ? "text-[#2F80ED]" : "text-[#b91c1c]"
                            }`}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Footer CTA if not enrolled */}
              {!canAccess && (
                <div
                  className={`mt-3 p-3 rounded-lg flex items-center gap-2.5 border ${
                    isDark
                      ? "bg-[#161920] border-[#23262D]"
                      : "bg-[#f7f3ec] border-2 border-dashed border-[#1a1a1a]"
                  }`}
                >
                  <Lock
                    size={14}
                    className={isDark ? "text-[#6B7280]" : "text-[#1a1a1a]"}
                  />
                  <p
                    className={`text-[11px] flex-1 ${
                      isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                    }`}
                  >
                    Enroll to unlock all {lessons.length} lessons and track your
                    progress.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BookOpen
                size={24}
                className={`mx-auto mb-2 ${
                  isDark ? "text-[#6B7280]" : "text-[#1a1a1a]"
                }`}
              />
              <p
                className={`text-sm ${
                  isDark
                    ? "font-semibold text-[#A1A8B3]"
                    : "font-black font-serif text-[#1a1a1a]"
                }`}
              >
                No lessons published yet
              </p>
              <p
                className={`text-[11px] mt-1 ${
                  isDark ? "text-[#6B7280]" : "text-[#333] font-serif"
                }`}
              >
                Check back soon for course content
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Subjects */}
          {subjects.length > 0 && (
            <div
              className={`rounded-xl p-4 ${
                isDark
                  ? "bg-[#111318] border border-[#23262D]"
                  : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
              }`}
            >
              <h3
                className={`text-sm mb-2.5 flex items-center gap-1.5 ${
                  isDark
                    ? "font-bold text-[#F5F7FA]"
                    : "font-black font-serif text-[#1a1a1a]"
                }`}
              >
                <Layers
                  size={13}
                  className={isDark ? "text-[#9B51E0]" : "text-[#b91c1c]"}
                />{" "}
                Subjects Covered
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((s: any) => (
                  <span
                    key={s._id || s.name}
                    className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                      isDark
                        ? "bg-[#161920] border border-[#23262D] text-[#A1A8B3] font-medium hover:border-[#9B51E0]/40 hover:text-[#F5F7FA]"
                        : "bg-[#e0dcd5] border border-[#d8d4cb] text-[#1a1a1a] font-bold font-serif"
                    }`}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What you'll get */}
          <div
            className={`rounded-xl p-4 ${
              isDark
                ? "bg-[#111318] border border-[#23262D]"
                : "bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
            }`}
          >
            <h3
              className={`text-sm mb-3 flex items-center gap-1.5 ${
                isDark
                  ? "font-bold text-[#F5F7FA]"
                  : "font-black font-serif text-[#1a1a1a]"
              }`}
            >
              <Sparkles
                size={13}
                className={isDark ? "text-[#00E5B3]" : "text-[#b91c1c]"}
              />{" "}
              What You'll Get
            </h3>
            <ul className="space-y-2.5">
              {[
                "Structured lessons that build skills step by step",
                "Track your progress across every course",
                "Learn at your own pace, anytime, anywhere",
                "Stay on target for your exam preparation",
              ].map((feature, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 text-[14px] ${
                    isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                  }`}
                >
                  <CheckCircle2
                    size={13}
                    className={`flex-shrink-0 mt-0.5 ${
                      isDark ? "text-[#00E5B3]" : "text-[#1a1a1a]"
                    }`}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ready to start */}
          <div
            className={`relative overflow-hidden rounded-xl p-4 text-center ${
              isDark
                ? "bg-gradient-to-br from-[#111318] to-[#1C1F26] border border-[#23262D]"
                : "bg-[#f7f3ec] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
            }`}
            style={
              isDark
                ? undefined
                : {
                    backgroundImage:
                      "radial-gradient(#d8d4cb 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }
            }
          >
            {isDark && (
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00E5B3]/8 rounded-full blur-2xl" />
            )}
            <div className="relative z-10">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2.5 ${
                  isDark
                    ? "bg-[#00E5B3]/10 border border-[#00E5B3]/30"
                    : "bg-[#1a1a1a] border border-[#1a1a1a]"
                }`}
              >
                {canAccess ? (
                  <PlayCircle
                    size={18}
                    className={isDark ? "text-[#00E5B3]" : "text-[#f2efe9]"}
                  />
                ) : (
                  <Sparkles
                    size={18}
                    className={isDark ? "text-[#00E5B3]" : "text-[#f2efe9]"}
                  />
                )}
              </div>
              <h3
                className={`text-sm mb-1 ${
                  isDark
                    ? "font-bold text-[#F5F7FA]"
                    : "font-black font-serif text-[#1a1a1a]"
                }`}
              >
                {canAccess ? "Ready to dive in?" : "Ready to start?"}
              </h3>
              <p
                className={`text-[11px] mb-3.5 leading-relaxed ${
                  isDark ? "text-[#A1A8B3]" : "text-[#333] font-serif"
                }`}
              >
                {canAccess
                  ? "Open the course and pick up where you left off."
                  : `Enroll in ${title} to unlock all ${totalLessons} lessons.`}
              </p>
              {canAccess ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs transition-all active:scale-[0.98] ${
                    isDark
                      ? "bg-[#2F80ED] text-white font-bold hover:bg-[#256BCE]"
                      : "bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                  }`}
                >
                  <PlayCircle size={13} /> Start Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs transition-all active:scale-[0.98] disabled:opacity-60 ${
                    isDark
                      ? "bg-[#00E5B3] text-black font-bold hover:bg-[#00C298]"
                      : "bg-[#1a1a1a] text-[#f2efe9] border-2 border-[#1a1a1a] font-black font-serif shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
                  }`}
                >
                  {enrolling ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Enrolling...
                    </>
                  ) : (
                    <>
                      <Plus size={13} /> Enroll Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}