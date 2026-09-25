import {
  BookOpen, Users, PlayCircle, Loader2,
} from 'lucide-react';
import { ProgressRing } from '../lesson/_components/VideoPlayer';
import { useTheme } from '../../../theme/ThemeContext';

interface CourseSelectionScreenProps {
  enrolledCourses: any[];
  isLoading: boolean;
  onSelectCourse: (id: string) => void;
}

export default function CourseSelectionScreen({
  enrolledCourses,
  isLoading,
  onSelectCourse,
}: CourseSelectionScreenProps) {
  const { isDark } = useTheme();

  const coursesList = Array.isArray(enrolledCourses) ? enrolledCourses : [];

  // ─── THEME TOKENS ───────────────────────────────────────────
  const t = isDark
    ? {
        // Page
        pageWrapper:
          'w-full text-[#F5F7FA] space-y-8 max-w-8xl p-4 mx-auto',
        // Header
        headerBorder: 'border-[#23262D]',
        headerIconWrap:
          'p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/30 glow-primary',
        headerIcon: 'text-[#2F80ED]',
        headerTitle:
          'text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight',
        headerSubtitle: 'text-xs text-[#A1A8B3]',
        // Body / Loading
        bodyLoadingWrap:
          'flex-1 min-h-[300px] flex items-center justify-center',
        loadingSpinner: 'text-[#9B51E0]',
        loadingText: 'text-[#A1A8B3] font-semibold',
        // Card
        card:
          'group bg-[#111318] rounded-2xl overflow-hidden border border-[#23262D] hover:border-[#2F80ED]/50 transition-all duration-300 flex flex-col cursor-pointer hover:shadow-[0_0_20px_-5px_rgba(47,128,237,0.3)]',
        cardHeader:
          'relative h-24 bg-[#161920] p-5 flex flex-col justify-end border-b border-[#23262D] overflow-hidden',
        cardHeaderBlob:
          'absolute -right-8 -top-8 w-24 h-24 bg-[#2F80ED]/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-700',
        cardCategory:
          'text-[10px] uppercase font-bold tracking-wider text-[#A1A8B3]',
        cardTitle:
          'font-bold text-lg text-[#F5F7FA] truncate group-hover:text-[#2F80ED] transition-colors',
        cardBody: 'p-5 flex-1 flex flex-col justify-between space-y-4',
        currentLabel: 'text-xs font-semibold text-[#A1A8B3] mb-3',
        currentValue: 'text-[#F5F7FA] font-bold',
        progressLabel: 'text-xs font-medium text-[#A1A8B3]',
        progressPercent: 'text-xs font-extrabold text-[#00E5B3]',
        progressTrack:
          'w-full h-1.5 bg-[#1C1F26] rounded-full mb-4 overflow-hidden',
        progressFill:
          'h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3] transition-all duration-700',
        metaTag:
          'inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]',
        metaIcon: 'text-[#9B51E0]',
        button:
          'w-full flex items-center justify-center gap-2 bg-[#2F80ED] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#256BCE] transition-all active:scale-[0.98] glow-primary',
        // Empty state
        emptyWrap:
          'bg-[#111318] rounded-2xl border border-[#23262D] p-10 text-center',
        emptyIconWrap:
          'w-16 h-16 rounded-full bg-[#161920] border border-[#23262D] flex items-center justify-center mx-auto mb-4',
        emptyIcon: 'text-[#6B7280]',
        emptyTitle: 'text-sm font-semibold text-[#A1A8B3]',
        emptySubtitle: 'text-xs text-[#6B7280] mt-1',
      }
    : {
        // Page
        pageWrapper:
          'w-full text-[#1a1a1a] space-y-8 max-w-8xl md:p-4 p-1 mx-auto',
        // Header
        headerBorder: 'border-[#d8d4cb]',
        headerIconWrap:
          'p-2.5 rounded-lg bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center',
        headerIcon: 'text-[#f2efe9]',
        headerTitle:
          'text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight font-serif',
        headerSubtitle: 'text-xs text-[#4a4a4a] font-serif italic',
        // Body / Loading
        bodyLoadingWrap:
          'flex-1 min-h-[300px] flex items-center justify-center',
        loadingSpinner: 'text-[#b91c1c]',
        loadingText: 'text-[#4a4a4a] font-serif font-semibold',
        // Card
        card:
          'group bg-[#f2efe9] rounded-lg overflow-hidden border border-[#d8d4cb] hover:border-[#1a1a1a] transition-all duration-300 flex flex-col cursor-pointer shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5',
        cardHeader:
          'relative h-24 bg-[#e0dcd5] p-5 flex flex-col justify-end border-b border-[#d8d4cb] overflow-hidden',
        cardHeaderBlob: '',
        cardCategory:
          'text-[10px] uppercase font-black tracking-widest text-[#1a1a1a] font-serif',
        cardTitle:
          'font-black text-lg text-[#1a1a1a] truncate font-serif',
        cardBody: 'p-5 flex-1 flex flex-col justify-between space-y-4',
        currentLabel: 'text-xs font-bold text-[#4a4a4a] mb-3 font-serif',
        currentValue: 'text-[#1a1a1a] font-black',
        progressLabel: 'text-xs font-bold text-[#4a4a4a] font-serif',
        progressPercent: 'text-xs font-black text-[#b91c1c] font-serif',
        progressTrack:
          'w-full h-2 bg-[#e0dcd5] rounded-full mb-4 overflow-hidden border border-[#d8d4cb]',
        progressFill:
          'h-full rounded-full bg-[#b91c1c] transition-all duration-700',
        metaTag:
          'inline-flex items-center gap-1 px-2.5 py-1 bg-[#e0dcd5] rounded-md text-[10px] font-bold text-[#1a1a1a] border border-[#d8d4cb] font-serif',
        metaIcon: 'text-[#b91c1c]',
        button:
          'w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-[#f2efe9] py-2.5 rounded-md font-black text-xs font-serif border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c] transition-all active:scale-[0.98]',
        // Empty state
        emptyWrap:
          'bg-[#f2efe9] rounded-lg border border-[#d8d4cb] p-10 text-center shadow-[3px_3px_0px_0px_#1a1a1a]',
        emptyIconWrap:
          'w-16 h-16 rounded-full bg-[#e0dcd5] border border-[#d8d4cb] flex items-center justify-center mx-auto mb-4',
        emptyIcon: 'text-[#1a1a1a]',
        emptyTitle: 'text-sm font-black text-[#1a1a1a] font-serif',
        emptySubtitle: 'text-xs text-[#4a4a4a] mt-1 font-serif italic',
      };

  // ─── BODY RENDERER ──────────────────────────────────────────
  const renderBody = () => {
    // 1) Loading — only the body is replaced
    if (isLoading) {
      return (
        <div className={t.bodyLoadingWrap}>
          <div className="text-center space-y-4">
            <Loader2
              size={32}
              className={`animate-spin mx-auto ${t.loadingSpinner}`}
            />
            <p className={t.loadingText}>Loading your courses...</p>
          </div>
        </div>
      );
    }

    // 2) Courses grid
    if (coursesList.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0 gap-5">
          {coursesList.map((course: any) => {
            const _id = course._id || course.id;
            const title = course.title || 'Course Title';
            const category =
              course.exam?.name || course.category || 'General';
            const totalLessons =
              course.lessons?.length || course.totalLessons || 0;
            const chapter = course.chapter || 'Getting Started';
            const progress = course.progress || 0;
            const students =
              course.enrolledStudents?.length || course.students || 0;

            return (
              <div
                key={_id}
                className={t.card}
                onClick={() => _id && onSelectCourse(_id)}
              >
                {/* Card Header */}
                <div className={t.cardHeader}>
                  {t.cardHeaderBlob && <div className={t.cardHeaderBlob} />}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 min-w-0 mr-2">
                      <span className={t.cardCategory}>
                        {category} &bull; {totalLessons} Lessons
                      </span>
                      <h4 className={t.cardTitle}>{title}</h4>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className={t.cardBody}>
                  <div>
                    <p className={t.currentLabel}>
                      Current:{' '}
                      <span className={t.currentValue}>{chapter}</span>
                    </p>

                    {/* Progress Section */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={t.progressLabel}>Progress</span>
                      <div className="flex items-center gap-2">
                        <span className={t.progressPercent}>
                          {progress}%
                        </span>
                        <ProgressRing progress={progress} size={32} />
                      </div>
                    </div>
                    <div className={t.progressTrack}>
                      <div
                        className={t.progressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={t.metaTag}>
                        <Users size={10} className={t.metaIcon} />{' '}
                        {students} students
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className={t.button}>
                    <PlayCircle size={15} />
                    <span>Start Learning</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 3) Empty state
    return (
      <div className={t.emptyWrap}>
        <div className={t.emptyIconWrap}>
          <BookOpen size={28} className={t.emptyIcon} />
        </div>
        <p className={t.emptyTitle}>No courses found</p>
        <p className={t.emptySubtitle}>
          Enroll in a course to get started
        </p>
      </div>
    );
  };

  // ─── MAIN RENDER ────────────────────────────────────────────
  return (
    <div
      className={t.pageWrapper}
      style={
        isDark
          ? undefined
          : {
              backgroundImage:
                'radial-gradient(#d8d4cb 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }
      }
    >
      {/* ────── PAGE HEADER (always visible) ────── */}
      <div
        className={`flex items-center gap-3 pb-6 border-b ${t.headerBorder}`}
      >
        <div className={t.headerIconWrap}>
          <BookOpen size={20} className={t.headerIcon} />
        </div>
        <div>
          <h1 className={t.headerTitle}>My Courses</h1>
          <p className={t.headerSubtitle}>
            Select a course to start learning
          </p>
        </div>
      </div>

      {/* ────── BODY (loading / grid / empty) ────── */}
      {renderBody()}
    </div>
  );
}