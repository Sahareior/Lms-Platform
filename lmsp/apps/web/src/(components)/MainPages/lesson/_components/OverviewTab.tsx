import { Clock, BookOpen, Target } from 'lucide-react';
import { useTheme } from '../../../../theme/ThemeContext';


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
  const { isDark } = useTheme();

  return (
    <div className={isDark ? 'bg-[#111318] rounded-2xl p-5 border border-[#23262D]' : 'bg-[#f2efe9] rounded-lg p-5 border border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]'}>
      <h3 className={isDark ? 'font-bold text-[#F5F7FA] text-sm mb-3' : 'font-black text-[#1a1a1a] text-sm mb-3 font-serif'}>Lesson Overview</h3>

      {description ? (
        <p className={isDark ? 'text-sm text-[#A1A8B3] mb-4 leading-relaxed' : 'text-sm text-[#4a4a4a] mb-4 leading-relaxed font-serif'}>{description}</p>
      ) : (
        <p className={isDark ? 'text-sm text-[#6B7280] italic mb-4' : 'text-sm text-[#4a4a4a] italic mb-4 font-serif'}>No description available for this lesson.</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {duration ? (
          <span className={isDark ? 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E5B3]/10 text-[#00E5B3] border border-[#00E5B3]/30 rounded-lg text-xs font-semibold' : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] rounded-md text-xs font-bold font-serif'}>
            <Clock size={12} /> {formatDuration(duration)}
          </span>
        ) : null}
        {courseTitle ? (
          <span className={isDark ? 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F80ED]/10 text-[#2F80ED] border border-[#2F80ED]/30 rounded-lg text-xs font-semibold' : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] rounded-md text-xs font-bold font-serif'}>
            <BookOpen size={12} /> {courseTitle}
          </span>
        ) : null}
        {lessonIndex !== undefined ? (
          <span className={isDark ? 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9B51E0]/10 text-[#9B51E0] border border-[#9B51E0]/30 rounded-lg text-xs font-semibold' : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e0dcd5] text-[#1a1a1a] border border-[#d8d4cb] rounded-md text-xs font-bold font-serif'}>
            <Target size={12} /> Lesson {lessonIndex + 1}
          </span>
        ) : null}
      </div>
    </div>
  );
}