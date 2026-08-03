import {
  BookOpen, Star, Clock, Target, Users, GraduationCap, PlayCircle, Sparkles,
} from 'lucide-react';
import { ProgressRing } from './VideoPlayer';

interface CourseSelectionScreenProps {
  enrolledCourses: any[];
  isLoading: boolean;
  onSelectCourse: (id: string) => void;
}



export default function CourseSelectionScreen({ enrolledCourses, onSelectCourse }: CourseSelectionScreenProps) {
  const coursesList = Array.isArray(enrolledCourses) && enrolledCourses.length > 0
    ? enrolledCourses
    : [];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coursesList.map((course: any) => {
            const _id = course._id || course.id;
            const title = course.title || 'Course Title';
            const category = course.exam?.name || course.category || 'General';
            const totalLessons = course.lessons?.length || course.totalLessons || 0;
            const rating = course.rating || 4.5;
            const chapter = course.chapter || 'Getting Started';
            const progress = course.progress || 0;
            const duration = course.duration || 'Self-paced';
            const level = course.level || 'Beginner';
            const students = course.enrolledStudents?.length || course.students || 0;
            const instructor = typeof course.instructor === 'object'
              ? course.instructor?.name || 'Instructor'
              : course.instructor || 'Instructor';

            return (
              <div
                key={_id}
                className="group bg-[#111318] rounded-2xl overflow-hidden border border-[#23262D] hover:border-[#2F80ED]/50 transition-all duration-300 flex flex-col cursor-pointer hover:shadow-[0_0_20px_-5px_rgba(47,128,237,0.3)]"
                onClick={() => _id && onSelectCourse(_id)}
              >
                {/* Card Header with Category & Rating */}
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
                    <div className="flex items-center gap-1 bg-[#23262D] border border-[#323742] rounded-lg px-2 py-1 flex-shrink-0">
                      <Star size={11} className="fill-[#F2C94C] text-[#F2C94C]" />
                      <span className="text-[10px] font-bold text-[#F5F7FA]">{rating}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#A1A8B3] mb-3">
                      Current: <span className="text-[#F5F7FA] font-bold">{chapter}</span>
                    </p>

                    {/* Progress Section */}
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

                    {/* Meta Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
                        <Clock size={10} className="text-[#00E5B3]" /> {duration}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
                        <Target size={10} className="text-[#2F80ED]" /> {level}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#161920] rounded-lg text-[10px] font-medium text-[#A1A8B3] border border-[#23262D]">
                        <Users size={10} className="text-[#9B51E0]" /> {students}
                      </span>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2F80ED]/20 text-[#2F80ED] border border-[#2F80ED]/40 flex items-center justify-center text-[9px] font-bold">
                        {instructor.charAt(0)}
                      </div>
                      <span className="text-xs text-[#A1A8B3] font-medium truncate">{instructor}</span>
                    </div>
                  </div>

                  {/* Action Button */}
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
        /* Empty State */
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