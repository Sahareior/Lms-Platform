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
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="bg-[#161920] border border-[#23262D] rounded-xl p-3">
      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center mb-2 ${accent}`}>
        {icon}
      </div>
      <div className="text-base font-extrabold text-[#F5F7FA] leading-none truncate">{value}</div>
      <div className="text-[9px] uppercase tracking-wider font-bold text-[#A1A8B3] mt-1">{label}</div>
    </div>
  );
}

// ─── Course Details Page ───────────────────────────────────
export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [justEnrolled, setJustEnrolled] = useState(false);

  const userId = useAppSelector((state) => state.user.user?._id) || "";

  const { data: course, isLoading, isError } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });
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
    return [...list].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [course]);

  const subjects = Array.isArray(course?.subjects) ? course.subjects : [];
  const totalMinutes = lessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
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
      <div className="w-full max-w-8xl p-4 mx-auto flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#00E5B3]" />
      </div>
    );
  }

  // ─── Error / Not found ───────────────────────────────────
  if (isError || !course) {
    return (
      <div className="w-full max-w-8xl p-4 mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A1A8B3] hover:text-[#00E5B3] transition-all"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-10 text-center mt-4">
          <div className="w-16 h-16 rounded-full bg-[#161920] border border-[#23262D] flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-[#6B7280]" />
          </div>
          <p className="text-sm font-semibold text-[#A1A8B3]">Course not found</p>
          <p className="text-xs text-[#6B7280] mt-1">It may have been removed or the link is invalid</p>
          <button
            onClick={() => navigate("/available-courses")}
            className="mt-5 text-xs font-bold text-[#00E5B3] hover:underline"
          >
            Browse available courses
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────
  return (
    <div className="w-full text-[#F5F7FA] space-y-6 max-w-8xl p-4 mx-auto">
      {/* ────── BACK ────── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#A1A8B3] hover:text-[#00E5B3] transition-all"
      >
        <ArrowLeft size={15} /> Back to courses
      </button>

      {/* ────── HERO ────── */}
      <div className="relative overflow-hidden rounded-2xl border border-[#23262D] bg-gradient-to-br from-[#161920] to-[#1C1F26] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00E5B3]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -left-20 w-72 h-72 bg-[#2F80ED]/8 rounded-full blur-3xl" />
        <div className="relative z-10 p-6 md:p-10 grid lg:grid-cols-[1fr_300px] gap-8 items-stretch">
          {/* Left: course info */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[#00E5B3]/10 border border-[#00E5B3]/30 text-[#00E5B3] rounded-full text-[10px] font-bold uppercase tracking-wider">
                {examName}
              </span>
              <span className="px-3 py-1 bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED] rounded-full text-[10px] font-bold uppercase tracking-wider">
                {totalLessons} Lessons
              </span>
              {level && (
                <span className="px-3 py-1 bg-[#9B51E0]/10 border border-[#9B51E0]/30 text-[#9B51E0] rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {level}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#F5F7FA] leading-tight mb-3">
              {title}
            </h1>

            {course?.description && (
              <p className="text-sm text-[#A1A8B3] leading-relaxed max-w-2xl mb-6">
                {course.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-[#A1A8B3]">
              {rating && (
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="fill-[#F2C94C] text-[#F2C94C]" />
                  <strong className="text-[#F5F7FA]">{rating}</strong> Rating
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-[#00E5B3]" />
                <strong className="text-[#F5F7FA]">{studentsCount}</strong> Students
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#9B51E0]" />
                <strong className="text-[#F5F7FA]">{formatDuration(totalMinutes)}</strong> Total
              </span>
            </div>


          </div>

          {/* Right: CTA panel */}
          <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 flex flex-col justify-between gap-5">
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                icon={<BookOpen size={14} className="text-[#00E5B3]" />}
                label="Lessons"
                value={totalLessons}
                accent="bg-[#00E5B3]/10 border-[#00E5B3]/25"
              />
              <StatTile
                icon={<Clock size={14} className="text-[#9B51E0]" />}
                label="Duration"
                value={formatDuration(totalMinutes)}
                accent="bg-[#9B51E0]/10 border-[#9B51E0]/25"
              />
              <StatTile
                icon={<Target size={14} className="text-[#2F80ED]" />}
                label="Level"
                value={level || "All"}
                accent="bg-[#2F80ED]/10 border-[#2F80ED]/25"
              />
              <StatTile
                icon={<Users size={14} className="text-[#F2C94C]" />}
                label="Students"
                value={studentsCount}
                accent="bg-[#F2C94C]/10 border-[#F2C94C]/25"
              />
            </div>

            {canAccess ? (
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="w-full flex items-center justify-center gap-2 bg-[#2F80ED] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#256BCE] transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(47,128,237,0.3)] hover:shadow-[0_4px_20px_rgba(47,128,237,0.5)]"
              >
                <PlayCircle size={17} />
                Continue Learning
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full flex items-center justify-center gap-2 bg-[#00E5B3] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#00C298] transition-all active:scale-[0.98] disabled:opacity-60 shadow-[0_4px_12px_rgba(0,229,179,0.3)] hover:shadow-[0_4px_20px_rgba(0,229,179,0.5)]"
              >
                {enrolling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Enroll Now
                  </>
                )}
              </button>
            )}
            {justEnrolled && (
              <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#00E5B3]">
                <CircleCheck size={14} /> You're enrolled! Start learning now.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ────── CURRICULUM + SIDEBAR ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Lessons / Curriculum */}
        <div className="lg:col-span-2 bg-[#111318] border border-[#23262D] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-[#23262D]">
            <div className="p-2 rounded-lg bg-[#2F80ED]/10 border border-[#2F80ED]/30">
              <BookOpen size={16} className="text-[#2F80ED]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#F5F7FA]">Course Curriculum</h2>
              <p className="text-xs text-[#A1A8B3]">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} • {formatDuration(totalMinutes)} total
              </p>
            </div>
          </div>

          {lessons.length > 0 ? (
            <div className="divide-y divide-[#23262D]">
              {lessons.map((lesson: any, i: number) => (
                <div
                  key={lesson._id || i}
                  className="flex items-center gap-4 p-4 hover:bg-[#161920] transition-colors group"
                >
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#161920] border border-[#23262D] flex items-center justify-center text-xs font-bold text-[#00E5B3] group-hover:border-[#00E5B3]/40 transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#F5F7FA] truncate">{lesson.title}</p>
                    {lesson.description && (
                      <p className="text-[11px] text-[#A1A8B3] truncate">{lesson.description}</p>
                    )}
                  </div>
                  {lesson.duration ? (
                    <span className="flex items-center gap-1 text-[11px] text-[#A1A8B3] flex-shrink-0">
                      <Clock size={12} /> {lesson.duration}m
                    </span>
                  ) : null}
                  {lesson.isPreview ? (
                    <span className="px-2 py-0.5 rounded bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/25 text-[9px] font-bold uppercase flex-shrink-0">
                      Preview
                    </span>
                  ) : canAccess ? (
                    <PlayCircle size={16} className="text-[#2F80ED] flex-shrink-0" />
                  ) : (
                    <Lock size={14} className="text-[#6B7280] flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <BookOpen size={26} className="text-[#6B7280] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#A1A8B3]">No lessons published yet</p>
              <p className="text-xs text-[#6B7280] mt-1">Check back soon for course content</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subjects */}
          {subjects.length > 0 && (
            <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5">
              <h3 className="font-bold text-sm text-[#F5F7FA] mb-3 flex items-center gap-2">
                <Layers size={14} className="text-[#9B51E0]" /> Subjects Covered
              </h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s: any) => (
                  <span
                    key={s._id || s.name}
                    className="px-2.5 py-1 rounded-lg bg-[#161920] border border-[#23262D] text-[11px] font-medium text-[#A1A8B3] hover:border-[#9B51E0]/40 hover:text-[#F5F7FA] transition-colors"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What you'll get */}
          <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5">
            <h3 className="font-bold text-sm text-[#F5F7FA] mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-[#00E5B3]" /> What You'll Get
            </h3>
            <ul className="space-y-3">
              {[
                "Structured lessons that build skills step by step",
                "Track your progress across every course",
                "Learn at your own pace, anytime, anywhere",
                "Stay on target for your exam preparation",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[#A1A8B3]">
                  <CheckCircle2 size={14} className="text-[#00E5B3] flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Ready to start */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111318] to-[#1C1F26] border border-[#23262D] p-5 text-center">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00E5B3]/8 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-11 h-11 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                {canAccess ? (
                  <PlayCircle size={20} className="text-[#00E5B3]" />
                ) : (
                  <Sparkles size={20} className="text-[#00E5B3]" />
                )}
              </div>
              <h3 className="font-bold text-sm text-[#F5F7FA] mb-1">
                {canAccess ? "Ready to dive in?" : "Ready to start?"}
              </h3>
              <p className="text-[11px] text-[#A1A8B3] mb-4 leading-relaxed">
                {canAccess
                  ? "Open the course and pick up where you left off."
                  : `Enroll in ${title} to unlock all ${totalLessons} lessons.`}
              </p>
              {canAccess ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2F80ED] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#256BCE] transition-all active:scale-[0.98]"
                >
                  <PlayCircle size={14} /> Start Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#00E5B3] text-black py-2.5 rounded-xl font-bold text-xs hover:bg-[#00C298] transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {enrolling ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Enrolling...
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Enroll Now
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
