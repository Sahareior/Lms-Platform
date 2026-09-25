import {
  Clock, Target, Star, Plus, Loader2, CircleCheck,
} from "lucide-react";

// ─── Available Course Card ─────────────────────────────────
export default function AvailableCard({
  course,
  onEnroll,
  isEnrolling,
  enrolledCourse,
  onOpen,
  isDark,
}: {
  course: any;
  onEnroll: () => void;
  isEnrolling: boolean;
  enrolledCourse: any[];
  onOpen: () => void;
  isDark: boolean;
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

  const isEnrolled = enrolledCourse.some((items: any) => items._id === course._id);

  // ─── LIGHT MODE (Vintage Paper Style) ──────────────────────
  if (!isDark) {
    return (
      <div
        onClick={onOpen}
        className="group relative bg-[#f2efe9] rounded-lg overflow-hidden border border-[#d8d4cb] shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer p-5"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="relative z-10">
          {/* Top Meta */}
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] font-serif block mb-1">
            {category} • {totalLessons} Lessons
          </span>

          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-black text-xl md:text-2xl text-[#1a1a1a] font-serif leading-tight group-hover:text-[#b91c1c] transition-colors flex-1 min-w-0 truncate">
              {title}
            </h4>
            {rating && (
              <div className="flex items-center gap-1 bg-[#e0dcd5] border border-[#d8d4cb] rounded-md px-1.5 py-0.5 flex-shrink-0">
                <Star size={11} className="fill-[#b91c1c] text-[#b91c1c]" />
                <span className="text-[10px] font-bold text-[#1a1a1a] font-serif">{rating}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-[#4a4a4a] font-serif leading-relaxed mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {duration && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#e0dcd5] border border-[#d8d4cb] rounded-md text-[10px] font-bold font-serif text-[#1a1a1a]">
                <Clock size={11} className="text-[#1a1a1a]" /> {duration}
              </span>
            )}
            {level && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#e0dcd5] border border-[#d8d4cb] rounded-md text-[10px] font-bold font-serif text-[#1a1a1a]">
                <Target size={11} className="text-[#b91c1c]" /> {level}
              </span>
            )}
          </div>

          {/* Instructor */}
          {instructors && (
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-[#f2efe9] flex items-center justify-center text-[10px] font-bold font-serif">
                {instructors.charAt(0)}
              </div>
              <span className="text-xs text-[#4a4a4a] font-serif font-medium truncate">
                {instructors}
              </span>
            </div>
          )}

          {/* Enroll Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnroll();
            }}
            disabled={isEnrolling || isEnrolled}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-bold text-sm font-serif transition-all active:scale-[0.98] ${
              isEnrolled
                ? "bg-[#f2efe9] text-[#1a1a1a] border-2 border-[#1a1a1a]"
                : "bg-[#1a1a1a] text-[#f2efe9] hover:bg-[#333] shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]"
            } disabled:opacity-50`}
          >
            {isEnrolling ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Enrolling...</span>
              </>
            ) : (
              <>
                {isEnrolled ? (
                  <div className="flex justify-center items-center gap-2">
                    <CircleCheck size={16} />
                    <span>Enrolled</span>
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-2">
                    <Plus size={16} />
                    <span>Enroll Now</span>
                  </div>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
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
                isEnrolled ? (
                  <div className="flex justify-center items-center gap-2">
                    <CircleCheck size={15} />
                    <span>Enrolled</span>
                  </div>
                ) : (
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