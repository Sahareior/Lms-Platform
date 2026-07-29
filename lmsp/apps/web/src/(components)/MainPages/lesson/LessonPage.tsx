import { useParams, useNavigate } from 'react-router-dom';
import { useGetEnrolledCourseQuery } from '@my-monorepo/store/src/redux/api/courseApi';
import { CourseSelectionScreen, LessonPlayerScreen } from './_components';

// Hardcoded user ID for now (will be replaced with auth context)
const DEMO_USER_ID = '507f1f77bcf86cd799439015';

const LessonPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { data: enrolledCourses, isLoading: isLoadingEnrolledCourses } =
    useGetEnrolledCourseQuery('6a5ee4291fda2cffc2eafca3');

  if (!courseId) {
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
  const selectedCourse = coursesList.find((c: any) => c._id === courseId) || {};

  return (
    <LessonPlayerScreen
      courseId={courseId}
      course={selectedCourse}
      userId={DEMO_USER_ID}
      onBack={() => navigate('/courses')}
    />
  );
};

export default LessonPage;
