import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, BookOpen, MessageSquare, Layout, PenTool, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useCompleteLessonMutation, useGetCourseLessonsWithProgressQuery } from '@my-monorepo/store';
import VideoPlayer from './VideoPlayer';
import OverviewTab from './OverviewTab';
import NotesTab from './NotesTab';
import AskAiTab from './AskAiTab';
import ResourcesTab from './ResourcesTab';
import CourseCurriculum from './CourseCurriculum';
import ProgressCard from './ProgressCard';

interface CourseInfo {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  exam?: { name?: string };
  instructor?: string | { name?: string };
  lessons?: Array<{ id: string; title: string; duration: number; isCompleted: boolean }>;
  course?: any;
}

interface LessonPlayerScreenProps {
  courseId: string;
  course: CourseInfo;
  userId: string;
  onBack: () => void;
}

export default function LessonPlayerScreen({ courseId, course, userId, onBack }: LessonPlayerScreenProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: courseLessons, isLoading: isLoadingCourseLessons } = useGetCourseLessonsWithProgressQuery(
    courseId && courseId !== 'undefined' ? { courseId, userId } : skipToken
  );

  const [completeLesson, { isLoading: isCompleting }] = useCompleteLessonMutation();

  // Merge API lessons with fallback
  const apiLessons: any[] = (courseLessons as any)?.lessons || [];
  const lessonsData: any[] = apiLessons.length > 0
    ? apiLessons
    : (course.lessons || []);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson: any = lessonsData[currentLessonIndex] || lessonsData[0] || {};
  const currentLessonId = currentLesson._id || currentLesson.id || '';

  // ─── Resume at the first uncompleted lesson ───────────────
  // On load (and when switching courses), jump to the first lesson
  // that isn't completed instead of always starting at lesson 1.
  const hasResumedRef = useRef<string | null>(null);
  useEffect(() => {
    const isFirstLoadForThisCourse = hasResumedRef.current !== courseId;

    // Reset the player position when switching to a different course
    if (isFirstLoadForThisCourse) {
      setCurrentLessonIndex(0);
    }

    // Once completion data is available, jump to the first uncompleted lesson
    const hasCompletionData = lessonsData.some((l: any) => typeof l.isCompleted === 'boolean');
    if (isFirstLoadForThisCourse && hasCompletionData && lessonsData.length > 0) {
      hasResumedRef.current = courseId;
      const firstUncompleted = lessonsData.findIndex((l: any) => !l.isCompleted);
      if (firstUncompleted > 0) {
        setCurrentLessonIndex(firstUncompleted);
      }
    }
  }, [lessonsData, courseId]);

  const completedCount = lessonsData.filter((l: any) => l.isCompleted).length;
  const progressPercent = lessonsData.length > 0
    ? Math.round((completedCount / lessonsData.length) * 100)
    : 0;

  // ─── Lesson Completion ────────────────────────────────────
  const markLessonComplete = async (lessonId: string) => {
    if (!lessonId || !userId || !courseId) return;
    try {
      await completeLesson({ userId, courseId, lessonId }).unwrap();
    } catch (err) {
      console.error('Failed to mark lesson as complete:', err);
    }
  };

  // Mark the current lesson complete and move to the next one
  const advanceToNextLesson = () => {
    markLessonComplete(currentLessonId);
    if (currentLessonIndex < lessonsData.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BookOpen },
    { key: 'notes', label: 'Notes', icon: PenTool },
    { key: 'ai', label: 'Ask AI', icon: MessageSquare },
    { key: 'resources', label: 'Resources', icon: Layout },
  ];

  return (
    <div className="w-full text-[#F5F7FA] min-h-screen">
      {/* ────── TOP HEADER ────── */}
      <header className="flex items-center justify-between w-full bg-[#111318] px-6 py-4 border-b border-[#23262D]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-[#161920] rounded-xl transition-colors text-[#A1A8B3] hover:text-[#F5F7FA] border border-transparent hover:border-[#23262D]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/30">
              <BookOpen size={18} className="text-[#2F80ED]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm text-[#F5F7FA]">{course?.title || 'Course'}</span>
              <span className="text-[10px] text-[#A1A8B3]">Lesson {currentLessonIndex + 1} of {lessonsData.length}</span>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-xs">
          <span className="text-[#A1A8B3]">{course?.category || course?.exam?.name || 'Course'}</span>
          <ChevronRight size={12} className="text-[#6B7280]" />
          <span className="text-[#2F80ED] font-semibold">Lesson {currentLessonIndex + 1}</span>
        </nav>


      </header>

      {/* ────── MAIN CONTENT ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        {/* Left column: Video + Tabs + Tab Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Video Player */}
          <VideoPlayer
            videoUri={currentLesson.videoUri}
            title={currentLesson.title}
            instructor={typeof course.instructor === 'object' ? course.instructor?.name : course.instructor}
            duration={currentLesson.duration}
            isLoading={isLoadingCourseLessons}
            onPrevious={() => currentLessonIndex > 0 && setCurrentLessonIndex(currentLessonIndex - 1)}
            onNext={advanceToNextLesson}
            onComplete={advanceToNextLesson}
            hasPrevious={currentLessonIndex > 0}
            hasNext={currentLessonIndex < lessonsData.length - 1}
          />

          {/* Lesson navigation + Tabs */}
          <div className="flex flex-col gap-4 bg-[#111318] rounded-2xl p-5 border border-[#23262D]">
            {/* Previous / Next Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => currentLessonIndex > 0 && setCurrentLessonIndex(currentLessonIndex - 1)}
                disabled={currentLessonIndex === 0}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#A1A8B3] hover:text-[#F5F7FA] disabled:opacity-40 transition px-3 py-1.5 rounded-lg hover:bg-[#161920] border border-transparent hover:border-[#23262D]"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              
              {/* Lesson Progress Dots */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F5F7FA]">
                  {currentLessonIndex + 1} <span className="text-[#6B7280] font-medium">/ {lessonsData.length}</span>
                </span>
                <div className="flex gap-1">
                  {lessonsData.map((_: any, idx: number) => (
                    <div
                      key={idx}
                      className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentLessonIndex
                          ? 'bg-[#2F80ED] w-7'
                          : idx < currentLessonIndex
                            ? 'bg-[#00E5B3]/60'
                            : 'bg-[#23262D]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={advanceToNextLesson}
                disabled={currentLessonIndex === lessonsData.length - 1}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#2F80ED] text-white px-4 py-1.5 rounded-lg hover:bg-[#256BCE] disabled:opacity-50 transition active:scale-[0.98]"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#161920] rounded-xl p-1 border border-[#23262D]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#2F80ED] text-white shadow-sm'
                        : 'text-[#A1A8B3] hover:text-[#F5F7FA] hover:bg-[#111318]'
                    }`}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OverviewTab
              description={currentLesson.description}
              duration={currentLesson.duration}
              courseTitle={course?.title}
              lessonIndex={currentLessonIndex}
            />
          )}

          {activeTab === 'notes' && (
            <NotesTab
              lessonId={currentLessonId}
              userId={userId}
              lessonIndex={currentLessonIndex}
            />
          )}

          {activeTab === 'ai' && (
            <AskAiTab
              lessonTitle={currentLesson.title}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesTab
              resources={currentLesson.resources}
              material={currentLesson.material}
            />
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <CourseCurriculum
            lessons={lessonsData}
            currentIndex={currentLessonIndex}
            onSelectLesson={setCurrentLessonIndex}
            isLoading={isLoadingCourseLessons}
            progressPercent={progressPercent}
          />

          <ProgressCard
            completedCount={completedCount}
            totalCount={lessonsData.length}
            completionCriteria={currentLesson.completionCriteria}
            hasQuiz={!!currentLesson.quiz}
            isCurrentCompleted={!!currentLesson.isCompleted}
            isCompleting={isCompleting}
            onMarkComplete={() => markLessonComplete(currentLessonId)}
          />
        </div>
      </div>
    </div>
  );
}