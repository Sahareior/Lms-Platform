import { api } from './baseApi';
import type { Course } from '../../types';

// ─── Response Types ─────────────────────────────────────────
export interface CourseListResponse {
  courses: Course[];
  total: number;
}

export interface CourseDetailResponse {
  course: Course & {
    lessons: Lesson[];
  };
}

export interface Lesson {
  id: string;
  title: string;
  duration: number; // minutes
  isCompleted: boolean;
  content?: string;
}

// ─── Injected Endpoints ─────────────────────────────────────
const courseApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── List All Courses ─────────────────────────────────────
    getCourses: build.query<CourseListResponse, void>({
      query: () => ({ url: '/courses' }),
      providesTags: (result) =>
        result
          ? [
              ...result.courses.map(
                ({ id }) => ({ type: 'Course' as const, id }),
              ),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    // ── Get Single Course with Lessons ───────────────────────
    getCourseById: build.query({
      query: (courseId) => ({ url: `/course/${courseId}` }),
    }),

    // ── Enroll in a Course ───────────────────────────────────
    enrollCourse: build.mutation({
      query: ({ courseId, userId }) => ({
        url: `/course/enroll/${courseId}`,
        method: 'POST',
        body: { userId }
      })
    }),

    getEnrolledCourse: build.query({
      query: ( userId ) => ({ url: `/course/enrolled/${userId}` })
    }),

    getCourseLessons: build.query({
      query: ({courseId}) => ({url: `/lesson/${courseId}`})
    }),

    // ── Mark Lesson as Complete ──────────────────────────────
    completeLesson: build.mutation<
      void,
      { courseId: string; lessonId: string }
    >({
      query: ({ courseId, lessonId }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Course', id: courseId },
      ],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useEnrollCourseMutation,
  useCompleteLessonMutation,
  useGetEnrolledCourseQuery,
  useGetCourseLessonsQuery
} = courseApi;
