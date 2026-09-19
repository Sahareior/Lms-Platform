import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@my-monorepo/store';
import { useGetEnrolledCourseQuery } from '@my-monorepo/store/src/redux/api/courseApi';
// import { useTheme } from '../../theme/ThemeContext';
import { CourseSelectionScreen, LessonPlayerScreen } from './_components';
import { useTheme } from '../../../theme/ThemeContext';

const LessonPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const userId = useAppSelector((state) => state.user.user?._id) || '';

  const { data: enrolledCourses, isLoading: isLoadingEnrolledCourses } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });

  if (isLoadingEnrolledCourses) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${isDark ? 'bg-[#0B0D14] text-[#F5F7FA]' : 'bg-[#f3f7fb] text-[#1a1a1a]'}`}>
        <div className={`w-8 h-8 border-4 ${isDark ? 'border-[#2F80ED] border-t-transparent' : 'border-[#b91c1c] border-t-transparent'} rounded-full animate-spin`} />
      </div>
    );
  }

  if (!courseId || courseId === 'undefined') {
    return (
      <CourseSelectionScreen
        enrolledCourses={enrolledCourses}
        isLoading={isLoadingEnrolledCourses}
        onSelectCourse={(id) => navigate('/courses/' + id)}
      />
    );
  }

  // Find the selected course from enrolled list
  const coursesList = Array.isArray(enrolledCourses) ? enrolledCourses : [];
  const selectedCourse = coursesList.find((c: any) => c._id === courseId);

  if (!selectedCourse) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen gap-4 ${isDark ? 'bg-[#0B0D14] text-[#F5F7FA]' : 'bg-[#f3f7fb] text-[#1a1a1a]'}`}>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className={isDark ? 'text-[#A1A8B3]' : 'text-[#4a4a4a]'}>You need to enroll in this course to view its lessons.</p>
        <button 
          onClick={() => navigate('/')}
          className={`px-6 py-2 rounded-xl font-semibold transition active:scale-[0.98] ${isDark ? 'bg-[#2F80ED] hover:bg-[#256BCE] text-white' : 'bg-[#1a1a1a] text-[#f2efe9] hover:bg-[#2b2b2b]'}`}
        >
          Explore Courses
        </button>
      </div>
    );
  }

  return (
    <LessonPlayerScreen
      courseId={courseId}
      course={selectedCourse}
      userId={userId}
      onBack={() => navigate('/courses')}
    />
  );
};

export default LessonPage;
