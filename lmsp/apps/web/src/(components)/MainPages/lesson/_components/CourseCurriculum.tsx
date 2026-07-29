import { Loader2, CheckCircle, PlayCircle } from 'lucide-react';

interface Lesson {
  id?: string;
  _id?: string;
  title: string;
  duration?: number;
  isCompleted?: boolean;
}

interface CourseCurriculumProps {
  lessons: Lesson[];
  currentIndex: number;
  onSelectLesson: (index: number) => void;
  isLoading?: boolean;
  progressPercent: number;
}

function formatDuration(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function CourseCurriculum({
  lessons,
  currentIndex,
  onSelectLesson,
  isLoading,
  progressPercent,
}: CourseCurriculumProps) {
  return (
    <div className="bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
      {/* Header with progress */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-[#F5F7FA] text-sm">Course Curriculum</h3>
        <span className="text-[10px] text-[#A1A8B3] font-medium">
          {progressPercent}% complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#1C1F26] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3] transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Lesson list */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
          </div>
        ) : (
          lessons.map((lesson, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = lesson.isCompleted;

            return (
              <div
                key={lesson.id || lesson._id || idx}
                onClick={() => onSelectLesson(idx)}
                className={`flex items-center gap-3 text-xs cursor-pointer p-2.5 rounded-lg transition-all border border-transparent ${
                  isActive
                    ? 'bg-[#2F80ED]/10 border-[#2F80ED]/30 text-[#F5F7FA] font-medium'
                    : isCompleted
                      ? 'text-[#A1A8B3] hover:bg-[#161920] hover:border-[#23262D]'
                      : 'text-[#6B7280] hover:bg-[#161920] hover:border-[#23262D] hover:text-[#A1A8B3]'
                }`}
              >
                {/* Status icon */}
                {isCompleted ? (
                  <CheckCircle size={16} className="text-[#00E5B3] flex-shrink-0" />
                ) : isActive ? (
                  <PlayCircle size={16} className="text-[#2F80ED] flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 border border-[#323742] rounded-full flex-shrink-0" />
                )}

                <span className="flex-1 truncate">{lesson.title}</span>

                {lesson.duration && (
                  <span className="text-[10px] text-[#6B7280] ml-auto flex-shrink-0">
                    {formatDuration(lesson.duration)}
                  </span>
                )}

                {isActive && (
                  <span className="text-[10px] text-[#2F80ED] font-semibold flex-shrink-0">
                    Now
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}