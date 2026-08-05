import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Star,
  Clock,
  Target,
  Sparkles,
  Plus,
  Loader2,
  CircleCheck,
  Search,
} from "lucide-react";
import {
  useAppSelector,
  useGetCoursesQuery,
  useEnrollCourseMutation,
} from "@my-monorepo/store";
import { useGetEnrolledCourseQuery } from "@my-monorepo/store/src/redux/api/courseApi";

// ─── Available Course Card ──────────────────────────────────
function AvailableCourseCard({
  course,
  isEnrolled,
  onEnroll,
  isEnrolling,
  onOpen,
}: {
  course: any;
  isEnrolled: boolean;
  onEnroll: () => void;
  isEnrolling: boolean;
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
          ) : isEnrolled ? (
            <>
              <CircleCheck size={15} />
              <span>Enrolled</span>
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

// ─── Available Courses Page ─────────────────────────────────
export default function AvailableCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeExam, setActiveExam] = useState("All");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const userId = useAppSelector((state) => state.user.user?._id) || "";

  const { data: courseData, isLoading } = useGetCoursesQuery();
  const { data: enrolledCourses, refetch: refetchEnrolled } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });
  const [enrollCourse] = useEnrollCourseMutation();

  // ─── Derived data ─────────────────────────────────────────
  const allCourses = useMemo(() => {
    if (Array.isArray(courseData)) return courseData;
    if (Array.isArray(courseData?.courses)) return courseData.courses;
    return [];
  }, [courseData]);

  const enrolledIds = useMemo(() => {
    const list = Array.isArray(enrolledCourses) ? enrolledCourses : [];
    return new Set(list.map((c: any) => c._id));
  }, [enrolledCourses]);

  const examTabs = useMemo(() => {
    const map = new Map<string, string>();
    allCourses.forEach((c: any) => {
      const id = c.exam?._id || c.category || "General";
      const name = c.exam?.name || c.category || "General";
      if (!map.has(id)) map.set(id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allCourses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCourses.filter((c: any) => {
      if (activeExam !== "All") {
        const id = c.exam?._id || c.category || "General";
        if (id !== activeExam) return false;
      }
      if (q) {
        const title = (c.title || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        if (!title.includes(q) && !desc.includes(q)) return false;
      }
      return true;
    });
  }, [allCourses, activeExam, search]);

  const handleEnroll = async (courseId: string) => {
    if (!userId) return;
    setEnrollingId(courseId);
    try {
      await enrollCourse({ userId, courseId }).unwrap();
      refetchEnrolled();
      setTimeout(() => setEnrollingId(null), 1500);
    } catch {
      setEnrollingId(null);
    }
  };

  return (
    <div className="w-full text-[#F5F7FA] space-y-6 max-w-8xl p-4 mx-auto">
      {/* ────── PAGE HEADER ────── */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#23262D]">
        <div className="p-2.5 rounded-xl bg-[#00E5B3]/10 border border-[#00E5B3]/30">
          <Sparkles size={20} className="text-[#00E5B3]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Available Courses
          </h1>
          <p className="text-xs text-[#A1A8B3]">
            Browse and enroll in new courses to expand your preparation
          </p>
        </div>
      </div>

      {/* ────── TOOLBAR: SEARCH + FILTER TABS ────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A8B3]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by title or description..."
            className="w-full bg-[#111318] border border-[#23262D] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder:text-[#6B7280] outline-none focus:border-[#00E5B3]/60 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveExam("All")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeExam === "All"
                ? "bg-[#00E5B3] text-black border-[#00E5B3] shadow-[0_4px_12px_rgba(0,229,179,0.25)]"
                : "bg-[#111318] text-[#A1A8B3] border-[#23262D] hover:bg-[#161920] hover:text-[#F5F7FA]"
            }`}
          >
            All
          </button>
          {examTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveExam(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeExam === tab.id
                  ? "bg-[#00E5B3] text-black border-[#00E5B3] shadow-[0_4px_12px_rgba(0,229,179,0.25)]"
                  : "bg-[#111318] text-[#A1A8B3] border-[#23262D] hover:bg-[#161920] hover:text-[#F5F7FA]"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* ────── RESULT COUNT ────── */}
      <div className="flex items-center gap-2 text-xs text-[#A1A8B3]">
        <BookOpen size={14} className="text-[#00E5B3]" />
        <span>
          {isLoading
            ? "Loading courses..."
            : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} available`}
        </span>
      </div>

      {/* ────── COURSES GRID ────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#00E5B3]" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course: any) => (
            <AvailableCourseCard
              key={course._id}
              course={course}
              isEnrolled={enrolledIds.has(course._id)}
              onEnroll={() => handleEnroll(course._id)}
              isEnrolling={enrollingId === course._id}
              onOpen={() => navigate(`/course/${course._id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-10 text-center">
          <BookOpen size={28} className="text-[#6B7280] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#A1A8B3]">
            No courses found
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            Try adjusting your search or filter
          </p>
          {(search || activeExam !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setActiveExam("All");
              }}
              className="mt-4 text-xs font-bold text-[#00E5B3] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ────── FOOTER BACK LINK ────── */}
      <div className="pt-2 pb-4">
        <button
          onClick={() => navigate("/")}
          className="text-xs font-bold text-[#A1A8B3] hover:text-[#00E5B3] transition-all"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
