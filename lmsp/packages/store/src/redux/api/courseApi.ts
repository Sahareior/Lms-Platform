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
      query: () => ({ url: '/course' }),

    }),

    // ── Get Single Course with Lessons ───────────────────────/by-course/:courseId
    getCourseById: build.query({
      query: (courseId) => ({ url: `/course/by-course/${courseId}` }),
    }),

    // ── Enroll in a Course ───────────────────────────────────
    enrollCourse: build.mutation({
      query: ({ courseId, userId }) => ({
        url: `/course/enroll/${courseId}`,
        method: 'POST',
        body: { userId }
      }),
      invalidatesTags: [{ type: 'Course', id: 'ENROLLED' }],
    }),

    // ── Enrolled Courses with per-user progress ───────────────
    // Backend merges progress %, lessonsCompleted, chapter and
    // completedLessons into each course (see CourseController).
    getEnrolledCourse: build.query<any, string>({
      query: (userId) => ({ url: `/course/enrolled/${userId}` }),
      providesTags: (result): { type: 'Course'; id: string }[] =>
        Array.isArray(result)
          ? [
              { type: 'Course', id: 'ENROLLED' },
              ...result.map((c: any) => ({ type: 'Course' as const, id: String(c._id) })),
            ]
          : [{ type: 'Course', id: 'ENROLLED' }],
    }),

    getCourseLessonsWithProgress: build.query<{ lessons: any[] }, { courseId: string; userId?: string }>({
      query: ({ courseId, userId }) => ({
        url: `/lesson/${courseId}${userId ? `?userId=${userId}` : ''}`,
      }),
      providesTags: ['Lesson'],
    }),

    // ── Mark Lesson as Complete ──────────────────────────────
    completeLesson: build.mutation<
      void,
      { userId: string; courseId: string; lessonId: string }
    >({
      query: ({ userId, courseId, lessonId }) => ({
        url: `/lesson/complete`,
        method: 'POST',
        body: { userId, courseId, lessonId },
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'ENROLLED' },
        { type: 'Lesson' },
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
  useGetCourseLessonsWithProgressQuery
} = courseApi;
