import {
  BookOpen, Star, Clock, Target, Users, GraduationCap, PlayCircle, Sparkles,
} from 'lucide-react';
import { ProgressRing } from '../lesson/_components/VideoPlayer';
import { useTheme } from '../../../theme/ThemeContext';

interface CourseSelectionScreenProps {
  enrolledCourses: any[];
  isLoading: boolean;
  onSelectCourse: (id: string) => void;
}

export default function CourseSelectionScreen({ enrolledCourses, onSelectCourse }: CourseSelectionScreenProps) {
  const { isDark } = useTheme();

  const coursesList = Array.isArray(enrolledCourses) && enrolledCourses.length > 0
    ? enrolledCourses
    : [];

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div 
        className="w-full text-[#1a1a1a] space-y-8 max-w-8xl md:p-4 p-1  mx-auto"
        style={{
          backgroundImage: 'radial-gradient(#d8d4cb 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* ────── PAGE HEADER ────── */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#d8d4cb]">
          <div className="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center">
            <BookOpen size={20} className="text-[#f2efe9]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight font-serif">My Courses</h1>
            <p className="text-xs text-[#4a4a4a] font-serif italic">Select a course to start learning</p>
          </div>
        </div>

        {/* ────── COURSES GRID ────── */}
        {coursesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0 gap-5">
            {coursesList.map((course: any) => {
              const _id = course._id || course.id;
              const title = course.title || 'Course Title';
              const category = course.exam?.name || course.category || 'General';
              const totalLessons = course.lessons?.length || course.totalLessons || 0;
              const chapter = course.chapter || 'Getting Started';
              const progress = course.progress || 0;
              const students = course.enrolledStudents?.length || course.students || 0;

              return (
                <div
                  key={_id}
                  className="group bg-[#f2efe9] rounded-lg overflow-hidden border border-[#d8d4cb] hover:border-[#1a1a1a] transition-all duration-300 flex flex-col cursor-pointer shadow-[3px_3px_0px_0px_#1a1a1a] hover:shadow-[4px_4px_0px_0px_#1a1a1a] hover:-translate-y-0.5"
                  onClick={() => _id && onSelectCourse(_id)}
                >
                  {/* Card Header */}
                  <div className="relative h-24 bg-[#e0dcd5] p-5 flex flex-col justify-end border-b border-[#d8d4cb] overflow-hidden">
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1 min-w-0 mr-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#1a1a1a] font-serif">
                          {category} &bull; {totalLessons} Lessons
                        </span>
                        <h4 className="font-black text-lg text-[#1a1a1a] truncate font-serif">
                          {title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs font-bold text-[#4a4a4a] mb-3 font-serif">
                        Current: <span className="text-[#1a1a1a] font-black">{chapter}</span>
                      </p>

                      {/* Progress Section */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#4a4a4a] font-serif">Progress</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#b91c1c] font-serif">{progress}%</span>
                          <ProgressRing progress={progress} size={32} />
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[#e0dcd5] rounded-full mb-4 overflow-hidden border border-[#d8d4cb]">
                        <div
                          className="h-full rounded-full bg-[#b91c1c] transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e0dcd5] rounded-md text-[10px] font-bold text-[#1a1a1a] border border-[#d8d4cb] font-serif">
                          <Users size={10} className="text-[#b91c1c]" /> {students} students
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-[#f2efe9] py-2.5 rounded-md font-black text-xs font-serif border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c] transition-all active:scale-[0.98]">
                      <PlayCircle size={15} />
                      <span>Start Learning</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#f2efe9] rounded-lg border border-[#d8d4cb] p-10 text-center shadow-[3px_3px_0px_0px_#1a1a1a]">
            <div className="w-16 h-16 rounded-full bg-[#e0dcd5] border border-[#d8d4cb] flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-[#1a1a1a]" />
            </div>
            <p className="text-sm font-black text-[#1a1a1a] font-serif">No courses found</p>
            <p className="text-xs text-[#4a4a4a] mt-1 font-serif italic">Enroll in a course to get started</p>
          </div>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className="w-full text-[#F5F7FA] space-y-8 max-w-8xl p-4 mx-auto">
      {/* ────── PAGE HEADER ────── */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#23262D]">
        <div className="p-2.5 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/30 glow-primary">
          <BookOpen size={20} className="text-[#2F80ED]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">My Courses</h1>
          <p className="text-xs text-[#A1A8B3]">Select a course to start learning</p>
        </div>
      </div>

      {/* ────── COURSES GRID ────── */}
      {coursesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0 gap-5">
          {coursesList.map((course: any) => {
            const _id = course._id || course.id;
            const title = course.title || 'Course Title';
            const category = course.exam?.name || course.category || 'General';
            const totalLessons = course.lessons?.length || course.totalLessons || 0;
            const chapter = course.chapter || 'Getting Started';
            const progress = course.progress || 0;
            const students = course.enrolledStudents?.length || course.students || 0;

            return (
              <div
                key={_id}
                className="group bg-[#111318] rounded-2xl overflow-hidden border border-[#23262D] hover:border-[#2F80ED]/50 transition-all duration-300 flex flex-col cursor-pointer hover:shadow-[0_0_20px_-5px_rgba(47,128,237,0.3)]"
                onClick={() => _id && onSelectCourse(_id)}
              >
                <div className="relative h-24 bg-[#161920] p-5 flex flex-col justify-end border-b border-[#23262D] overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#2F80ED]/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 min-w-0 mr-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#A1A8B3]">
                        {category} &bull; {totalLessons} Lessons
                      </span>
                      <h4 className="font-bold text-lg text-[#F5F7FA] truncate group-hover:text-[#2F80ED] transition-colors">
                        {title}
                      </h4>
                    </div>
                  </div>
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

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
                        <Users size={10} className="text-[#9B51E0]" /> {students} students
                      </span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 bg-[#2F80ED] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#256BCE] transition-all active:scale-[0.98] glow-primary">
                    <PlayCircle size={15} />
                    <span>Start Learning</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[#161920] border border-[#23262D] flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-[#6B7280]" />
          </div>
          <p className="text-sm font-semibold text-[#A1A8B3]">No courses found</p>
          <p className="text-xs text-[#6B7280] mt-1">Enroll in a course to get started</p>
        </div>
      )}
    </div>
  );
}