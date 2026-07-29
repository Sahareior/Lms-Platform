import { Clock, BookOpen, Target } from 'lucide-react';

interface OverviewTabProps {
  description?: string;
  duration?: number;
  courseTitle?: string;
  lessonIndex?: number;
}

function formatDuration(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function OverviewTab({ description, duration, courseTitle, lessonIndex }: OverviewTabProps) {
  return (
    <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
      <h3 className="font-bold text-[#F5F7FA] text-sm mb-3">Lesson Overview</h3>

      {description ? (
        <p className="text-sm text-[#A1A8B3] mb-4 leading-relaxed">{description}</p>
      ) : (
        <p className="text-sm text-[#6B7280] italic mb-4">No description available for this lesson.</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {duration ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 rounded-lg text-xs font-semibold">
            <Clock size={12} /> {formatDuration(duration)}
          </span>
        ) : null}
        {courseTitle ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30 rounded-lg text-xs font-semibold">
            <BookOpen size={12} /> {courseTitle}
          </span>
        ) : null}
        {lessonIndex !== undefined ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30 rounded-lg text-xs font-semibold">
            <Target size={12} /> Lesson {lessonIndex + 1}
          </span>
        ) : null}
      </div>
    </div>
  );
}