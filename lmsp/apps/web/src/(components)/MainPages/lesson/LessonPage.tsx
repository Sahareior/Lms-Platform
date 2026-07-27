import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, SkipBack, SkipForward, Maximize, Volume2, Share2, BookOpen,
  MessageSquare, Layout, Clock, CheckCircle, PenTool, Bold, Italic, Underline,
  AlignLeft, List, ImageIcon, Link, Mic, Send, Check, PlayCircle, XCircle,
  ArrowLeft, Star, Users, Target, GraduationCap, FileCheck, Loader2
} from 'lucide-react';
import { useGetEnrolledCourseQuery, useGetCourseLessonsQuery } from '@my-monorepo/store/src/redux/api/courseApi';

const mockEnrolledCourses = [
  {
    id: '1', title: 'Bangladesh Affairs', chapter: 'Liberation War', progress: 68,
    gradient: 'from-[#1e293b] to-[#475569]', lessonsCompleted: 24, totalLessons: 36,
    instructor: 'Prof. Karim', category: 'BCS', rating: 4.8, students: '12.4k',
    duration: '8 weeks', level: 'Intermediate',
    lessons: [
      { id: 'l1', title: 'Introduction & Overview', duration: 510, isCompleted: true },
      { id: 'l2', title: 'Initial Phases of Movement', duration: 1320, isCompleted: true },
      { id: 'l3', title: 'Events of February 21', duration: 1155, isCompleted: true },
      { id: 'l4', title: 'Results & Impact of Language Movement', duration: 1725, isCompleted: false },
      { id: 'l5', title: 'Cultural Impact & Documents', duration: 1440, isCompleted: false },
    ]
  },
  {
    id: '2', title: 'General Mathematics', chapter: 'Algebra Basics', progress: 45,
    gradient: 'from-[#0f172a] to-[#334155]', lessonsCompleted: 18, totalLessons: 40,
    instructor: 'Dr. Hossain', category: 'BCS', rating: 4.7, students: '9.8k',
    duration: '6 weeks', level: 'Beginner',
    lessons: [
      { id: 'm1', title: 'Introduction to Algebra', duration: 600, isCompleted: true },
      { id: 'm2', title: 'Linear Equations', duration: 900, isCompleted: true },
      { id: 'm3', title: 'Quadratic Equations', duration: 1200, isCompleted: false },
      { id: 'm4', title: 'Functions & Graphs', duration: 1500, isCompleted: false },
    ]
  },
  {
    id: '3', title: 'English Grammar', chapter: 'Tense & Voice', progress: 82,
    gradient: 'from-[#1e1b4b] to-[#312e81]', lessonsCompleted: 33, totalLessons: 40,
    instructor: 'Ms. Rahman', category: 'BCS', rating: 4.9, students: '15.1k',
    duration: '5 weeks', level: 'Intermediate',
    lessons: [
      { id: 'e1', title: 'Present Tense', duration: 720, isCompleted: true },
      { id: 'e2', title: 'Past Tense', duration: 840, isCompleted: true },
      { id: 'e3', title: 'Future Tense', duration: 660, isCompleted: true },
      { id: 'e4', title: 'Active & Passive Voice', duration: 900, isCompleted: false },
    ]
  },
  {
    id: '4', title: 'General Knowledge', chapter: 'International Org.', progress: 31,
    gradient: 'from-[#022c22] to-[#064e3b]', lessonsCompleted: 10, totalLessons: 32,
    instructor: 'Mr. Hasan', category: 'Bank', rating: 4.6, students: '8.2k',
    duration: '4 weeks', level: 'Beginner',
    lessons: [
      { id: 'g1', title: 'United Nations', duration: 600, isCompleted: true },
      { id: 'g2', title: 'WHO & UNESCO', duration: 720, isCompleted: false },
      { id: 'g3', title: 'World Bank & IMF', duration: 840, isCompleted: false },
    ]
  },
];

function formatDuration(s: number) {
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const sw = 3, r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="transform -rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={progress >= 80 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#64748b'}
        strokeWidth={sw} strokeDasharray={c}
        strokeDashoffset={c - (progress / 100) * c}
        strokeLinecap="round" className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function CourseSelectionScreen({ onSelectCourse, enrolledCourses, isLoadingEnrolledCourses }: { onSelectCourse: (id: string) => void, enrolledCourses: any[], isLoadingEnrolledCourses: boolean }) {
  const [activeTab, setActiveTab] = useState('All');
  
  const enrolledCoursesList = Array.isArray(enrolledCourses) ? enrolledCourses : [];
  // For demo purposes, if enrolledCoursesList is empty, we can fallback to mockEnrolledCourses or just show empty
  const filtered = enrolledCoursesList.length > 0 ? enrolledCoursesList : mockEnrolledCourses;
  console.log(enrolledCourses, 'tdsf')
  return (
    <div className="min-h-screen bg-[#f7f9fc] font-sans text-slate-800">
      <header className="flex items-center justify-between w-full bg-[#1e293b] px-6 py-4 text-white border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="bg-[#10b981] p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-black">
              <path d="M12 2l9 5.25v10.5L12 23l-9-5.25V7.25L12 2z" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-base">BanglaPrep</span>
            <span className="text-[10px] text-gray-400">BCS Learning</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <img src="https://i.pravatar.cc/150?u=rahim" alt="User" className="w-8 h-8 rounded-full border border-gray-600" />
          <span className="font-medium">Rahim</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">My Courses</h1>
            <p className="text-sm text-slate-500">Select a course to start learning</p>
          </div>
        </div>



        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => {
              const _id = course._id || course.id;
              const title = course.title || "Course Title";
              const category = course.exam?.name || course.category || "General";
              const totalLessons = course.lessons?.length || course.totalLessons || 0;
              const rating = course.rating || 4.5;
              const gradient = course.gradient || "from-[#1e293b] to-[#475569]";
              const chapter = course.chapter || "Getting Started";
              const progress = course.progress || 0;
              const duration = course.duration || "Self-paced";
              const level = course.level || "Beginner";
              const students = course.enrolledStudents?.length || course.students || 0;
              const instructor = typeof course.instructor === 'object' ? course.instructor?.name || "Instructor" : course.instructors || course.instructor || "Instructor";

              return (
              <div key={_id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col cursor-pointer"
                onClick={() => onSelectCourse(_id)}>
                <div className={`relative h-32 bg-gradient-to-br ${gradient} p-5 flex flex-col justify-end overflow-hidden`}>
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 min-w-0 mr-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">{category} &bull; {totalLessons} Lessons</span>
                      <h4 className="font-extrabold text-lg text-white truncate">{title}</h4>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      <Star size={10} className="fill-amber-300 text-amber-300" />
                      <span className="text-[10px] font-bold text-white">{rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Current: <span className="text-slate-700 font-bold normal-case">{chapter}</span>
                    </p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500">Progress</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold ${progress >= 80 ? 'text-emerald-600' : progress >= 40 ? 'text-amber-600' : 'text-slate-500'}`}>{progress}%</span>
                        <ProgressRing progress={progress} size={32} />
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                      <div className={`h-full rounded-full ${progress >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : progress >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'}`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-semibold text-slate-500 border border-slate-100"><Clock size={10} /> {duration}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-semibold text-slate-500 border border-slate-100"><Target size={10} /> {level}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-semibold text-slate-500 border border-slate-100"><Users size={10} /> {students}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-400 font-medium">{instructor}</span>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97] shadow-sm">
                    <PlayCircle size={14} /><span>Start Learning</span>
                  </button>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen size={28} className="text-slate-400" /></div>
            <p className="text-slate-500 font-semibold">No courses in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LessonPlayerScreen({ courseId, onBack }: { courseId: string; onBack: () => void }) {
  const course = mockEnrolledCourses.find(c => c.id === courseId) || mockEnrolledCourses[0]; // fallback to demo data for now
  const [activeTab, setActiveTab] = useState('notes');
  const [noteContent, setNoteContent] = useState('');

  const { data: courseLessons, isLoading: isLoadingCourseLessons } = useGetCourseLessonsQuery({ courseId })
  console.log("courseLessons: ", courseLessons)

  const lessonsData = courseLessons?.lessons?.length > 0 ? courseLessons.lessons : course.lessons;
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  if (!course && !isLoadingCourseLessons) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Course not found</p>
          <button onClick={onBack} className="mt-4 text-emerald-600 font-semibold">Go back to courses</button>
        </div>
      </div>
    );
  }

  const currentLesson = lessonsData[currentLessonIndex] || lessonsData[0] || {};
  const completedCount = lessonsData.filter((l: any) => l.isCompleted).length;
  const progressPercent = lessonsData.length > 0 ? Math.round((completedCount / lessonsData.length) * 100) : 0;

  return (
    <div className="bg-[#f7f9fc] font-sans text-slate-800 min-h-screen">
      <header className="flex items-center mb-2 justify-between w-full bg-[#1e293b] px-6 py-4 text-white text-sm border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ArrowLeft size={18} /></button>
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981] p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-black"><path d="M12 2l9 5.25v10.5L12 23l-9-5.25V7.25L12 2z" /></svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base">BanglaPrep</span>
              <span className="text-[10px] text-gray-400">BCS Learning</span>
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-2 text-gray-400">
          <span className="text-gray-300">{course?.category || 'Category'}</span>
          <span className="text-gray-500 text-xs">{'>'}</span>
          <span className="text-gray-300">{course?.title || 'Course'}</span>
          <span className="text-gray-500 text-xs">{'>'}</span>
          <span className="text-[#10b981] font-medium">Lesson {currentLessonIndex + 1}</span>
        </nav>
        <div className="flex items-center gap-2.5">
          <img src="https://i.pravatar.cc/150?u=rahim" alt="User" className="w-8 h-8 rounded-full border border-gray-600" />
          <span className="font-medium">Rahim</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#111b29] rounded-xl overflow-hidden relative aspect-video flex flex-col justify-end shadow-lg">
            {isLoadingCourseLessons ? (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 size={32} className="animate-spin text-emerald-500" />
              </div>
            ) : (
            <>
              {currentLesson.videoUri ? (
                <video src={currentLesson.videoUri} controls className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <div className="w-16 h-16 bg-[#1eff70] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(30,255,112,0.4)] cursor-pointer hover:scale-105 transition">
                    <Play size={30} fill="white" className="text-white ml-1" />
                  </div>
                  <div className="mt-4 text-white text-center">
                    <h2 className="text-xl font-bold">{currentLesson.title || 'Lesson Title'}</h2>
                    <p className="text-gray-400 text-sm">{course?.instructor || 'Instructor'}</p>
                  </div>
                </div>
              )}
              {!currentLesson.videoUri && (
                <div className="bg-gradient-to-t from-black/80 to-transparent p-4 relative z-10">
                  <div className="w-full h-1 bg-gray-600 rounded-full mb-3"><div className="w-[0%] h-full bg-[#1eff70] rounded-full" /></div>
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-4">
                      <SkipBack fill="white" size={18} className="cursor-pointer" onClick={() => currentLessonIndex > 0 && setCurrentLessonIndex(currentLessonIndex - 1)} />
                      <Pause fill="white" size={20} className="cursor-pointer" />
                      <SkipForward fill="white" size={18} className="cursor-pointer" onClick={() => currentLessonIndex < lessonsData.length - 1 && setCurrentLessonIndex(currentLessonIndex + 1)} />
                      <Volume2 size={16} />
                      <span>0:00 / {formatDuration(currentLesson.duration || 0)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="border border-white/20 px-2 py-0.5 rounded">1.25x</span>
                      <Maximize size={16} className="cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}
            </>
            )}
          </div>

          <div className="flex flex-col gap-4 bg-white rounded-xl shadow-sm p-4 md:p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => currentLessonIndex > 0 && setCurrentLessonIndex(currentLessonIndex - 1)} disabled={currentLessonIndex === 0} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50">
                <span className="text-lg">{'<'}</span> Previous Lesson
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Lesson {currentLessonIndex + 1}</span>
                <div className="flex gap-0.5">
                  {lessonsData.map((_: any, idx: number) => (
                    <div key={idx} className={`w-6 h-1 rounded-full ${idx === currentLessonIndex ? 'bg-emerald-500' : idx < currentLessonIndex ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">of {lessonsData.length}</span>
              </div>
              <button onClick={() => currentLessonIndex < lessonsData.length - 1 && setCurrentLessonIndex(currentLessonIndex + 1)} disabled={currentLessonIndex === lessonsData.length - 1} className="flex items-center gap-1 text-sm font-medium bg-[#0a1a2b] text-white px-4 py-1.5 rounded-md hover:bg-[#15273b] disabled:opacity-50">
                Next Lesson <span className="text-lg">{'>'}</span>
              </button>
            </div>
            <div className="flex items-center border-b border-gray-200 gap-6 text-sm pt-2">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'notes', label: 'Notes', icon: PenTool },
                { key: 'ai', label: 'Ask AI', icon: MessageSquare },
                { key: 'resources', label: 'Resources', icon: Layout }
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === tab.key ? 'border-[#2cdf71] text-gray-900 font-semibold' : 'border-transparent text-gray-500'}`}>
                  {tab.icon && <tab.icon size={14} />} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'notes' && (
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">My Notes - Lesson {currentLessonIndex + 1}</h3>
                <div className="flex items-center gap-2">
                  <button className="text-xs flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"><Share2 size={12} /> Export</button>
                  <button className="text-xs flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"><Check size={12} /> Saved</button>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 text-gray-500">
                <Bold size={16} className="cursor-pointer" /><Italic size={16} className="cursor-pointer" /><Underline size={16} className="cursor-pointer" />
                <span className="w-px h-4 bg-gray-300" />
                <List size={16} className="cursor-pointer" /><AlignLeft size={16} className="cursor-pointer" />
                <span className="w-px h-4 bg-gray-300" />
                <ImageIcon size={16} className="cursor-pointer" /><Link size={16} className="cursor-pointer" /><Mic size={16} className="cursor-pointer" />
              </div>
              <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Take notes..." className="mt-3 min-h-[120px] w-full text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 resize-none" />
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="bg-[#2cdf71] w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                  <h3 className="font-bold text-gray-800">Ask AI</h3>
                </div>
                <span className="text-[10px] text-gray-400">Based on Lesson {currentLessonIndex + 1}</span>
              </div>
              <div className="py-4 space-y-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2cdf71] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">A</div>
                  <div className="max-w-[80%] bg-[#f3f4f6] p-3 rounded-xl rounded-tl-none text-sm text-gray-700">
                    <p>How can I help you with this lesson?</p>
                    <p className="mt-2 text-xs text-gray-400">10:27 AM</p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="relative">
                  <input type="text" placeholder="Ask anything about this lesson..." className="w-full pl-4 pr-12 py-3 bg-[#f9fafb] border border-gray-200 rounded-lg focus:outline-none focus:border-[#2cdf71] text-sm" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#2cdf71] rounded-full flex items-center justify-center text-white hover:bg-[#24c762] transition"><Send size={14} /></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Lesson Overview</h3>
              <p className="text-sm text-gray-600 mb-4">{currentLesson.description || "This lesson covers fundamental concepts. Watch carefully and take notes."}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg text-xs font-semibold text-emerald-700"><Clock size={12} /> {formatDuration(currentLesson.duration || 0)}</span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700"><BookOpen size={12} /> {course?.title || 'Course'}</span>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Resources & Materials</h3>
              <div className="space-y-3">
                {currentLesson.resources?.length > 0 ? (
                  currentLesson.resources.map((res: any) => (
                    <a key={res._id} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><BookOpen size={18} className="text-blue-600" /></div>
                      <div><p className="text-sm font-semibold text-slate-800">{res.name}</p><p className="text-xs text-slate-500">{res.type}</p></div>
                    </a>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><BookOpen size={18} className="text-blue-600" /></div>
                      <div><p className="text-sm font-semibold text-slate-800">Lesson Slides</p><p className="text-xs text-slate-500">PDF</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><FileCheck size={18} className="text-green-600" /></div>
                      <div><p className="text-sm font-semibold text-slate-800">Practice Worksheet</p><p className="text-xs text-slate-500">PDF</p></div>
                    </div>
                  </>
                )}
                {currentLesson.material?.map((mat: string, idx: number) => (
                    <a key={idx} href={mat} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><FileCheck size={18} className="text-indigo-600" /></div>
                      <div className="overflow-hidden"><p className="text-sm font-semibold text-slate-800 truncate">{mat.split('/').pop()}</p><p className="text-xs text-slate-500">Link</p></div>
                    </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800">Course Curriculum</h3>
              <span className="text-[10px] text-gray-500 font-medium">{progressPercent}% complete</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
              <div className="h-full bg-[#2cdf71] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="space-y-3">
              {isLoadingCourseLessons ? (
                <div className="flex justify-center py-4"><Loader2 size={24} className="animate-spin text-emerald-500" /></div>
              ) : lessonsData.map((lesson: any, idx: number) => (
                <div key={lesson.id || lesson._id} onClick={() => setCurrentLessonIndex(idx)}
                  className={`flex items-center gap-3 text-xs cursor-pointer p-2 rounded-md transition ${idx === currentLessonIndex ? 'font-medium text-black bg-[#f0fdf4]' : lesson.isCompleted ? 'text-gray-500' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {lesson.isCompleted ? (<CheckCircle size={16} className="text-[#2cdf71] flex-shrink-0" />) : idx === currentLessonIndex ? (<PlayCircle size={16} className="text-[#2cdf71] flex-shrink-0" />) : (<div className="w-4 h-4 border border-gray-300 rounded-full flex-shrink-0" />)}
                  <span className="flex-1 truncate">{lesson.title}</span>
                  <span className="ml-auto">{formatDuration(lesson.duration || 0)}</span>
                  {idx === currentLessonIndex && <span className="text-[10px] text-[#2cdf71] font-medium">Now</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3">Your Progress</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#f8f9fa] p-3 rounded-lg">
                <div className="flex items-center gap-2 text-[#2cdf71]"><CheckCircle size={20} fill="#2cdf71" className="text-white" /><span className="font-bold text-lg text-gray-800">{completedCount}</span></div>
                <div className="text-[10px] text-gray-500 font-medium">Lessons Done</div>
              </div>
              <div className="bg-[#f8f9fa] p-3 rounded-lg">
                <div className="flex items-center gap-2 text-[#3b82f6]"><Clock size={20} fill="#3b82f6" className="text-white" /><span className="font-bold text-lg text-gray-800">{lessonsData.length - completedCount}</span></div>
                <div className="text-[10px] text-gray-500 font-medium">Remaining</div>
              </div>
            </div>
            {currentLesson.completionCriteria === 'QUIZ' && currentLesson.quiz ? (
               <button className="w-full bg-[#d1fae5] text-[#0f7a3e] hover:bg-[#a7f3d0] font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"><PenTool size={16} /> Take Required Quiz</button>
            ) : (
               <button className="w-full bg-[#d1fae5] text-[#0f7a3e] hover:bg-[#a7f3d0] font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"><Check size={16} /> Mark as Complete</button>
            )}
          </div>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 w-12 h-12 bg-[#2cdf71] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#24c762] transition z-50"><MessageSquare size={24} /></button>
    </div>
  );
}

const LessonPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
    const {data: enrolledCourses,isLoading:isLoadingEnrolledCourses}=useGetEnrolledCourseQuery("6a5ee4291fda2cffc2eafca3")
    


  if (!courseId) {
    return <CourseSelectionScreen enrolledCourses={enrolledCourses} isLoadingEnrolledCourses={isLoadingEnrolledCourses} onSelectCourse={(id) => navigate('/courses/' + id)} />;
  }
  return <LessonPlayerScreen courseId={courseId} onBack={() => navigate('/courses')} />;
};

export default LessonPage;
