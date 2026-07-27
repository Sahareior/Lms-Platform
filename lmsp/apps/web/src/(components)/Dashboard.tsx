import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  ClipboardCheck,
  Brain,
  BarChart3,
  Search,
  Calendar,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Clock,
  ChevronRight,
  Users,
  Target,
  Star,
  Plus,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  useGetCoursesQuery,
  useEnrollCourseMutation,
  useGetExamsQuery,
  useGetProfileQuery,
  useGetCourseByIdQuery,
} from "@my-monorepo/store";
import { useGetEnrolledCourseQuery } from "@my-monorepo/store/src/redux/api/courseApi";

// ─── Mock Enrolled Courses ─────────────────────────────────
const mockEnrolledCourses = [
  {
    id: "1",
    title: "Bangladesh Affairs",
    chapter: "Liberation War",
    progress: 68,
    gradient: "from-[#1e293b] to-[#475569]",
    lessonsCompleted: 24,
    totalLessons: 36,
    instructor: "Prof. Karim",
    category: "BCS",
  },
  {
    id: "2",
    title: "General Mathematics",
    chapter: "Algebra Basics",
    progress: 45,
    gradient: "from-[#0f172a] to-[#334155]",
    lessonsCompleted: 18,
    totalLessons: 40,
    instructor: "Dr. Hossain",
    category: "BCS",
  },
  {
    id: "3",
    title: "English Grammar",
    chapter: "Tense & Voice",
    progress: 82,
    gradient: "from-[#1e1b4b] to-[#312e81]",
    lessonsCompleted: 33,
    totalLessons: 40,
    instructor: "Ms. Rahman",
    category: "BCS",
  },
  {
    id: "4",
    title: "General Knowledge",
    chapter: "International Org.",
    progress: 31,
    gradient: "from-[#022c22] to-[#064e3b]",
    lessonsCompleted: 10,
    totalLessons: 32,
    instructor: "Mr. Hasan",
    category: "Bank",
  },
];



// ─── Stats Data ────────────────────────────────────────────
const stats = [
  { title: "Courses Enrolled", value: 8, color: "bg-blue-50 text-blue-600 border border-blue-100", icon: BookOpen },
  { title: "Quizzes Completed", value: 142, color: "bg-green-50 text-green-600 border border-green-100", icon: ClipboardCheck },
  { title: "Mock Exams Taken", value: 23, color: "bg-yellow-50 text-yellow-600 border border-yellow-100", icon: Trophy },
  { title: "Current Rank", value: "#847", color: "bg-purple-50 text-purple-600 border border-purple-100", icon: BarChart3 },
];

// ─── Weekly Activity Data ──────────────────────────────────
const weeklyActivity = [
  { day: "Sat", count: 3, height: "40%", active: false },
  { day: "Sun", count: 7, height: "80%", active: false },
  { day: "Mon", count: 5, height: "60%", active: false },
  { day: "Tue", count: 9, height: "85%", active: false },
  { day: "Wed", count: 6, height: "65%", active: false },
  { day: "Thu", count: 11, height: "100%", active: true },
  { day: "Fri", count: 4, height: "45%", active: false },
];

// ─── Subject Strength Data ─────────────────────────────────
const subjectStrength = [
  { name: "Bangladesh Affairs", score: 82, color: "bg-emerald-500 text-white" },
  { name: "Mathematics", score: 54, color: "bg-emerald-100 text-emerald-700" },
  { name: "English", score: 68, color: "bg-emerald-100 text-emerald-700" },
  { name: "General Science", score: 71, color: "bg-emerald-100 text-emerald-700" },
  { name: "Bangla", score: 45, color: "bg-yellow-100 text-yellow-600" },
  { name: "ICT", score: 60, color: "bg-emerald-100 text-emerald-700" },
  { name: "Intl. Affairs", score: 77, color: "bg-emerald-100 text-emerald-700" },
  { name: "Mental Ability", score: 35, color: "bg-red-100 text-red-500" },
];

// ─── Progress Ring ─────────────────────────────────────────
function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const sw = 3;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="transform -rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={progress >= 80 ? "#10b981" : progress >= 40 ? "#f59e0b" : "#64748b"}
        strokeWidth={sw} strokeDasharray={c}
        strokeDashoffset={c - (progress / 100) * c}
        strokeLinecap="round" className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// ─── Enrolled Course Card ──────────────────────────────────
function EnrolledCard({ course, onResume }: { course: any; onResume: () => void }) {
  const gradient = course.gradient || "from-[#1e293b] to-[#475569]";
  const category = course.exam?.name || course.category || "General";
  const totalLessons = course.lessons?.length || course.totalLessons || 0;
  const title = course.title || "Course Title";
  const chapter = course.chapter || "Getting Started";
  const progress = course.progress || 0;
  const lessonsCompleted = course.lessonsCompleted || 0;
  const instructor = typeof course.instructor === 'object' ? (course.instructor?.name || "Instructor") : (course.instructors || "Instructor");

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      <div className={`relative h-28 bg-gradient-to-br ${gradient} p-5 flex flex-col justify-end overflow-hidden`}>
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
        <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-lg" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 relative z-10">
          {category} &bull; {totalLessons} Lessons
        </span>
        <h4 className="font-extrabold text-lg text-white truncate relative z-10 group-hover:translate-x-0.5 transition-transform">
          {title}
        </h4>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Current: <span className="text-slate-700 font-bold normal-case">{chapter}</span>
          </p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Progress</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold ${progress >= 80 ? "text-emerald-600" : progress >= 40 ? "text-amber-600" : "text-slate-500"}`}>
                {progress}%
              </span>
              <ProgressRing progress={progress} size={32} />
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${progress >= 80
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : progress >= 40
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-gradient-to-r from-slate-300 to-slate-400"
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">
              <span className="text-slate-700 font-bold">{lessonsCompleted}</span> / {totalLessons} lessons done
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">{instructor}</span>
          </div>
        </div>
        <button
          onClick={onResume}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 active:scale-[0.97] shadow-sm shadow-emerald-200/50 hover:shadow-md hover:shadow-emerald-200/60"
        >
          <PlayCircle size={14} />
          <span>Start Learning</span>
        </button>
      </div>
    </div>
  );
}

// ─── Available Course Card ─────────────────────────────────
function AvailableCard({ course, onEnroll, isEnrolling }: {
  course: any;
  onEnroll: () => void;
  isEnrolling: boolean;
}) {
  const gradient = course.gradient || "from-emerald-600 to-teal-500";
  const totalLessons = course.lessons?.length || course.totalLessons || 0;
  const category = course.exam?.name || course.category || "General";
  const title = course.title || "Course Title";
  const rating = course.rating || "4.5";
  const description = course.description || "No description available.";
  const duration = course.duration || "Self-paced";
  const level = course.level || "Beginner";
  const students = course.enrolledStudents?.length || course.students || 0;
  const instructors = typeof course.instructor === 'object' ? (course.instructor?.name || "Instructor") : (course.instructors || "Instructor");

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      <div className={`relative h-28 bg-gradient-to-br ${gradient} p-5 flex flex-col justify-end overflow-hidden`}>
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
        <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-lg" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0 mr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">
              {category} &bull; {totalLessons} Lessons
            </span>
            <h4 className="font-extrabold text-lg text-white truncate group-hover:translate-x-0.5 transition-transform">
              {title}
            </h4>
          </div>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 flex-shrink-0">
            <Star size={10} className="fill-amber-300 text-amber-300" />
            <span className="text-[10px] font-bold text-white">{rating}</span>
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-semibold text-slate-500 border border-slate-100">
              <Clock size={10} /> {duration}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-semibold text-slate-500 border border-slate-100">
              <Target size={10} /> {level}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-semibold text-slate-500 border border-slate-100">
              <Users size={10} /> {students}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[8px] font-bold text-white">
              {instructors.charAt(0)}
            </div>
            <span className="text-xs text-slate-400 font-medium truncate">{instructors}</span>
          </div>
        </div>
        <button
          onClick={onEnroll} disabled={isEnrolling}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 active:scale-[0.97] shadow-sm shadow-emerald-200/50 hover:shadow-md hover:shadow-emerald-200/60 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isEnrolling ? (
            <><Loader2 size={14} className="animate-spin" /><span>Enrolling...</span></>
          ) : (
            <><Plus size={14} /><span>Enroll Now</span></>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const { data: userData } = useGetProfileQuery("6a5ee4291fda2cffc2eafca3")
  const [enrollCourse] = useEnrollCourseMutation()
  const {data: enrolledCourses,isLoading:isLoadingEnrolledCourses}=useGetEnrolledCourseQuery("6a5ee4291fda2cffc2eafca3")
  
  const selectedExams = userData?.selectedExams;
  console.log(enrolledCourses, 'thjis ')

  useEffect(() => {
    if (activeTab === "All" && selectedExams && selectedExams.length > 0) {
      setActiveTab(selectedExams[0]._id);
    }
  }, [activeTab, selectedExams]);

  const { data: courseData, isLoading: isLoadingCourses } = useGetCourseByIdQuery(activeTab, { skip: activeTab === "All" })
  console.log(courseData, 'courseData')

  // RTK Query hooks for future real API integration
  useGetCoursesQuery();
  useGetExamsQuery();
 

  const handleEnroll = async (courseId: string) => {
    const payLoad = {
      userId: '6a5ee4291fda2cffc2eafca3',
      courseId: courseId,
    }
    setEnrollingId(courseId);
    try {
      await enrollCourse(payLoad).unwrap();
      setTimeout(() => setEnrollingId(null), 1500);
    } catch {
      setEnrollingId(null);
    }
  };

  const enrolledCoursesList = Array.isArray(enrolledCourses) ? enrolledCourses : [];
  const filteredEnrolled = enrolledCoursesList.filter(
    (c) => activeTab === "All" || c.exam?._id === activeTab || c.category === activeTab
  );
  
  const availableCoursesList = Array.isArray(courseData) ? courseData : [];

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-BD", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="w-full font-sans text-slate-800 p-4 md:p-6 max-w-7xl mx-auto">
      <main className="space-y-8">
        {/* ────── TOP HEADER ────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">Welcome back, Rahim!</h1>
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span>{dateStr}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
              <span className="text-emerald-600 font-semibold">Keep pushing forward!</span>
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 w-full md:w-[320px] shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
            <Search size={18} className="text-slate-400" />
            <input placeholder="Search courses, topics, questions..." className="outline-none flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400" />
            <kbd className="hidden md:inline-flex text-[10px] font-bold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
          </div>
        </div>

        {/* ────── TABS ────── */}


        {/* ────── STATS ROW ────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                  <Icon size={22} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-950 mb-1 leading-none">{item.value}</h2>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.title}</p>
              </div>
            );
          })}
        </div>

                <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-px">
          {selectedExams?.map((tab) => (
            <button
              key={tab._id}
              onClick={() => setActiveTab(tab._id)}
              className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 relative ${activeTab === tab._id ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab.name}
              {activeTab === tab._id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ────── AVAILABLE COURSES ────── */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-200/40">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Courses Available</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {isLoadingCourses ? "Loading..." : `${availableCoursesList.length} course${availableCoursesList.length !== 1 ? "s" : ""} to explore`}
                </p>
              </div>
            </div>
            <button onClick={() => navigate("/courses")} className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group">
              <span>Browse All</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {isLoadingCourses ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
          ) : availableCoursesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableCoursesList.map((course) => (
                <AvailableCard key={course._id} course={course} onEnroll={() => handleEnroll(course._id)} isEnrolling={enrollingId === course._id} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-10 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold">No available courses in this category</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting a different category</p>
            </div>
          )}

          <button className="sm:hidden w-full mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl py-3 transition-colors hover:bg-emerald-100">
            <span>Browse All Courses</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ────── ENROLLED COURSES ────── */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200/40">
                <PlayCircle size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Continue Learning</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {filteredEnrolled.length} active course{filteredEnrolled.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group flex items-center gap-1">
              <span>View All</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {isLoadingEnrolledCourses ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : filteredEnrolled.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEnrolled.map((course) => (
                <EnrolledCard key={course._id} course={course} onResume={() => navigate(`/courses/${course._id}`)} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-10 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle size={28} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold">No enrolled courses yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Start by enrolling in one of the available courses above</p>
              <button
                onClick={() => navigate("/on-boarding")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
              >
                <Plus size={14} />
                <span>Browse Courses</span>
              </button>
            </div>
          )}
        </div>

        {/* ────── CONTENT GRID ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Left: Mock Exam */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#182a5c] to-[#1e3a7a] text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={10} /> Today's Mock
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-white/70 rounded-full text-[10px] font-medium">
                    <Clock size={10} /> 02:45:00 remaining
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight">BCS 47th Full Mock</h2>
                <p className="text-slate-300 text-xs font-medium mb-6">General Knowledge + Math + English &bull; 100 Questions &bull; 200 Marks</p>
                <div className="flex gap-3 mb-6">
                  {[
                    { val: "02", label: "hours" },
                    { val: "45", label: "mins" },
                    { val: "00", label: "secs" },
                  ].map((t, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl text-center flex-1 border border-white/5">
                      <div className="text-2xl font-extrabold tracking-tight">{t.val}</div>
                      <div className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold mt-0.5">{t.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/mock-exam")} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-extrabold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-[0.98]">
                  Start Exam Now
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI Recommendations + Today's Target */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-600 rounded-lg shadow-md shadow-violet-200/40">
                  <Brain className="text-white" size={16} />
                </div>
                <h2 className="font-bold text-lg text-slate-900 tracking-tight">AI Recommended</h2>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Bangladesh Constitution", desc: "Article 70 - Review recommended", color: "border-l-emerald-500", bg: "bg-emerald-50/50" },
                  { title: "Ratio & Proportion", desc: "Practice problems needed", color: "border-l-amber-500", bg: "bg-amber-50/50" },
                  { title: "Bangla Grammar", desc: "Weak area - 45% accuracy", color: "border-l-red-500", bg: "bg-red-50/50" },
                  { title: "English Prepositions", desc: "Improving - 72% accuracy", color: "border-l-blue-500", bg: "bg-blue-50/50" },
                ].map((item, index) => (
                  <div key={index} className={`${item.bg} border-l-4 ${item.color} rounded-xl p-3.5 hover:shadow-sm transition-all duration-200 cursor-pointer group`}>
                    <h3 className="font-bold text-xs text-slate-800 group-hover:text-slate-900 transition-colors">{item.title}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-xl py-2.5 hover:bg-violet-100 transition-colors">
                View All Recommendations
              </button>
            </div>

            {/* Today's Target */}
            {/* <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} className="text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">Today's Target</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Complete 2 lessons", done: true },
                  { label: "Solve 20 MCQs", done: true },
                  { label: "Take 1 mock quiz", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-300"}`}>
                      {item.done && <CheckCircle size={12} strokeWidth={3} />}
                    </div>
                    <span className={`text-xs font-semibold ${item.done ? "text-slate-500 line-through" : "text-slate-800"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/50">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-emerald-600">2/3 completed</span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full w-[67%]" />
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* ────── BOTTOM CHARTS ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* Weekly Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Weekly Quiz Activity</h3>
                <p className="text-sm text-slate-500 mt-1">Total: 45 quizzes this week</p>
              </div>
              <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 transition-colors">
                <Calendar size={14} /> This Week
              </button>
            </div>
            <div className="flex justify-between items-end h-48 px-1 pt-2 pb-1 gap-2 md:gap-4">
              {weeklyActivity.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-between h-full gap-2 w-full">
                  <div className="w-full flex flex-col items-center justify-end h-full gap-1">
                    <span className="text-[10px] font-bold text-slate-800">{item.count}</span>
                    <div
                      className={`w-full md:w-10 rounded-t-lg transition-all duration-500 ${item.active
                        ? "bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-sm shadow-emerald-200/50"
                        : "bg-emerald-100 hover:bg-emerald-200"
                        }`}
                      style={{ height: item.height }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${item.active ? "text-emerald-600 font-bold" : "text-slate-500"}`}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Strength */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Subject-wise Strength</h3>
                <p className="text-sm text-slate-500 mt-1">Based on last 30 days performance</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 items-center">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-200" /> Weak</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-200" /> Below Avg</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-200" /> Average</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strong</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subjectStrength.map((item, idx) => (
                <div key={idx} className={`rounded-xl p-4 flex flex-col justify-between aspect-square transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${item.color}`}>
                  <h4 className="text-xs font-bold leading-tight opacity-90">{item.name}</h4>
                  <div className="flex items-end gap-1 mt-auto">
                    <span className="text-2xl md:text-3xl font-extrabold tracking-tight">{item.score}</span>
                    <span className="text-[10px] font-bold mb-1 opacity-70">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-6" />
      </main>
    </div>
  );
}
