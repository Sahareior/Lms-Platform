import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@my-monorepo/store';
import { useGetEnrolledCourseQuery } from '@my-monorepo/store/src/redux/api/courseApi';
import { CourseSelectionScreen, LessonPlayerScreen } from './_components';

const LessonPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const userId = useAppSelector((state) => state.user.user?._id) || '';

  const { data: enrolledCourses, isLoading: isLoadingEnrolledCourses } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });

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
  const selectedCourse = coursesList.find((c: any) => c._id === courseId) || {};

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
