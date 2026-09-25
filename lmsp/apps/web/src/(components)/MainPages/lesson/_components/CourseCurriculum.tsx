import { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle, PlayCircle, ChevronDown, FolderOpen, Clock } from 'lucide-react';
import { useTheme } from '../../../../theme/ThemeContext';


interface Lesson {
  id?: string;
  _id?: string;
  title: string;
  duration?: number;
  isCompleted?: boolean;
  module?: { _id?: string; title?: string } | string | null;
}

interface CourseCurriculumProps {
  lessons: Lesson[];
  currentIndex: number;
  onSelectLesson: (index: number) => void;
  isLoading?: boolean;
  progressPercent: number;
}

interface LessonGroup {
  key: string;
  title: string;
  lessons: Array<Lesson & { _index: number }>;
}

function formatDuration(s: number) {
  const total = Math.max(0, Math.floor(s || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function CourseCurriculum({
  lessons,
  currentIndex,
  onSelectLesson,
  isLoading,
  progressPercent,
}: CourseCurriculumProps) {
  const { isDark } = useTheme();

  const groups: LessonGroup[] = useMemo(() => {
    const map = new Map<string, LessonGroup>();
    lessons.forEach((lesson, idx) => {
      const mod = lesson.module as any;
      const moduleId = mod && typeof mod === 'object' ? mod._id : typeof mod === 'string' ? mod : '';
      const moduleTitle = mod && typeof mod === 'object' ? mod.title : '';
      const key = moduleId || 'uncategorized';
      if (!map.has(key)) {
        map.set(key, { key, title: moduleTitle || 'Uncategorized', lessons: [] });
      }
      map.get(key)!.lessons.push({ ...lesson, _index: idx });
    });
    return Array.from(map.values());
  }, [lessons]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const groupOfCurrent = groups.find((g) => g.lessons.some((l) => l._index === currentIndex));
    if (groupOfCurrent) {
      setCollapsed((prev) => {
        if (!prev.has(groupOfCurrent.key)) return prev;
        const next = new Set(prev);
        next.delete(groupOfCurrent.key);
        return next;
      });
    }
  }, [groups, currentIndex]);

  const toggleModule = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className={isDark ? 'bg-[#111318] rounded-2xl p-5 border border-[#23262D]' : 'bg-[#f2efe9] rounded-lg p-5 border border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]'}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={isDark ? 'font-bold text-[#F5F7FA] text-sm' : 'font-black text-[#1a1a1a] text-sm font-serif'}>Course Curriculum</h3>
        <span className={isDark ? 'text-[10px] text-[#A1A8B3] font-medium' : 'text-[10px] text-[#4a4a4a] font-bold font-serif'}>{progressPercent}% complete</span>
      </div>

      <div className={isDark ? 'w-full h-1.5 bg-[#1C1F26] rounded-full mb-4 overflow-hidden' : 'w-full h-2 bg-[#e0dcd5] rounded-full mb-4 overflow-hidden border border-[#d8d4cb]'}>
        <div
          className={isDark ? 'h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3] transition-all duration-700' : 'h-full rounded-full bg-[#b91c1c] transition-all duration-700'}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={24} className={isDark ? 'animate-spin text-[#2F80ED]' : 'animate-spin text-[#b91c1c]'} />
          </div>
        ) : (
          groups.map((group) => {
            const isCollapsed = collapsed.has(group.key);
            const completedInGroup = group.lessons.filter((l) => l.isCompleted).length;
            const totalInGroup = group.lessons.length;
            const totalDuration = group.lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
            const isComplete = totalInGroup > 0 && completedInGroup === totalInGroup;

            return (
              <div key={group.key} className={isDark ? 'rounded-xl overflow-hidden border border-[#23262D]' : 'rounded-md overflow-hidden border border-[#d8d4cb]'}>
                <button
                  onClick={() => toggleModule(group.key)}
                  className={isDark ? 'w-full flex items-center gap-2.5 px-3 py-2.5 bg-[#161920] hover:bg-[#1C1F26] transition-colors text-left' : 'w-full flex items-center gap-2.5 px-3 py-2.5 bg-[#e0dcd5] hover:bg-[#d8d4cb] transition-colors text-left'}
                >
                  <ChevronDown size={14} className={isDark ? `text-[#6B7280] flex-shrink-0 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}` : `text-[#4a4a4a] flex-shrink-0 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
                  {isComplete ? (
                    <CheckCircle size={15} className={isDark ? 'text-[#00E5B3] flex-shrink-0' : 'text-[#1a1a1a] flex-shrink-0'} />
                  ) : (
                    <FolderOpen size={14} className={isDark ? 'text-[#2F80ED] flex-shrink-0' : 'text-[#b91c1c] flex-shrink-0'} />
                  )}
                  <span className={`flex-1 truncate text-xs font-semibold ${isDark ? (isComplete ? 'text-[#00E5B3]' : 'text-[#F5F7FA]') : (isComplete ? 'text-[#1a1a1a]' : 'text-[#1a1a1a] font-serif')}`}>
                    {group.title}
                  </span>
                  <span className={isDark ? 'flex items-center gap-1 text-[10px] text-[#A1A8B3] flex-shrink-0' : 'flex items-center gap-1 text-[10px] text-[#4a4a4a] flex-shrink-0 font-serif'}>
                    {totalDuration > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} />
                        {formatDuration(totalDuration)}
                      </span>
                    )}
                    <span className={isComplete ? (isDark ? 'text-[#00E5B3] font-semibold' : 'text-[#1a1a1a] font-bold') : ''}>{completedInGroup}/{totalInGroup}</span>
                  </span>
                </button>

                {!isCollapsed && (
                  <div className={isDark ? 'space-y-1 py-1.5 px-1.5' : 'space-y-1 py-1.5 px-1.5 bg-[#f7f4ef]'}>
                    {group.lessons.map((lesson) => {
                      const isActive = lesson._index === currentIndex;
                      const isCompleted = lesson.isCompleted;

                      return (
                        <div
                          key={lesson.id || lesson._id || lesson._index}
                          onClick={() => onSelectLesson(lesson._index)}
                          className={`flex items-center gap-3 text-xs cursor-pointer p-2.5 rounded-lg transition-all border border-transparent ${
                            isDark
                              ? (isActive
                                ? 'bg-[#2F80ED]/10 border-[#2F80ED]/30 text-[#F5F7FA] font-medium'
                                : isCompleted
                                  ? 'text-[#A1A8B3] hover:bg-[#161920] hover:border-[#23262D]'
                                  : 'text-[#6B7280] hover:bg-[#161920] hover:border-[#23262D] hover:text-[#A1A8B3]')
                              : (isActive
                                ? 'bg-[#e0dcd5] border-[#1a1a1a] text-[#1a1a1a] font-bold'
                                : isCompleted
                                  ? 'text-[#1a1a1a] hover:bg-[#e0dcd5] hover:border-[#d8d4cb]'
                                  : 'text-[#4a4a4a] hover:bg-[#e0dcd5] hover:border-[#d8d4cb]')
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle size={16} className={isDark ? 'text-[#00E5B3] flex-shrink-0' : 'text-[#1a1a1a] flex-shrink-0'} />
                          ) : isActive ? (
                            <PlayCircle size={16} className={isDark ? 'text-[#2F80ED] flex-shrink-0' : 'text-[#b91c1c] flex-shrink-0'} />
                          ) : (
                            <div className={isDark ? 'w-4 h-4 border border-[#323742] rounded-full flex-shrink-0' : 'w-4 h-4 border border-[#1a1a1a] rounded-full flex-shrink-0'} />
                          )}

                          <span className="flex-1 truncate">{lesson.title}</span>

                          {lesson.duration ? (
                            <span className={isDark ? 'text-[10px] text-[#6B7280] ml-auto flex-shrink-0' : 'text-[10px] text-[#4a4a4a] ml-auto flex-shrink-0 font-serif'}>
                              {formatDuration(lesson.duration)}
                            </span>
                          ) : null}

                          {isActive && (
                            <span className={isDark ? 'text-[10px] text-[#2F80ED] font-semibold flex-shrink-0' : 'text-[10px] text-[#b91c1c] font-bold flex-shrink-0'}>
                              Now
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
