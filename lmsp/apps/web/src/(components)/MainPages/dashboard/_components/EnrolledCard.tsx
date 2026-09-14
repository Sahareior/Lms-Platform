import { BookOpen, GraduationCap, PlayCircle } from "lucide-react";

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
export default function EnrolledCard({
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
