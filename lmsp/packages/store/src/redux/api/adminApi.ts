import { api } from './baseApi';

// ─── Admin Types ──────────────────────────────────────────────
export interface AdminUser {
  _id: string;
  email: string;
  username?: string;
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  division?: string;
  district?: string;
  thana?: string;
  village?: string;
  postCode?: string;
  fullAddress?: string;
  education?: string;
  institute?: string;
  targetDate?: string;
  preferredCenter?: string;
  selectedExams?: string[];
  createdAt?: string;
}

export interface EnrolledStudent {
  _id: string;
  email: string;
  username?: string;
  phone?: string;
  education?: string;
  institute?: string;
  district?: string;
  division?: string;
  dateOfBirth?: string;
  enrolledAt?: string;
}

export interface AdminCourse {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor?: { _id: string; username?: string; email?: string };
  lessons?: string[];
  enrolledStudents?: EnrolledStudent[];
  exam?: { _id: string; name?: string };
  subjects?: Array<{ _id: string; name: string; code?: string }>;
  createdAt?: string;
}

export interface AdminExam {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  applicants?: string;
  createdAt?: string;
}

export interface AdminQuestion {
  _id: string;
  exam: string;
  examVersion?: string;
  subject?: string;
  data: Array<{
    question_number: number;
    question_text: string;
    options: Record<string, string>;
    correct_answer?: string;
  }>;
}

export interface AdminQuestionPattern {
  _id: string;
  exam: string;
  examVersion?: string;
  subject?: string;
  topics: Record<string, number>;
  subjects: Record<string, number>;
  categorized_questions: Array<{
    topic: string;
    subject: string;
  }>;
  createdAt?: string;
}

export interface CreateExamRequest {
  name: string;
  image?: string;
  description?: string;
  applicants?: string;
}

export interface UpdateExamRequest {
  name?: string;
  image?: string;
  description?: string;
  applicants?: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnail?: string;
  instructor: string;
  exam?: string;
  subjects?: string[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  thumbnail?: string;
  instructor?: string;
  exam?: string;
  subjects?: string[];
}

// ─── Exam Version Types ─────────────────────────────────────
export interface AdminExamVersion {
  _id: string;
  exam: string;
  examVersion: string;
}

export interface CreateExamVersionRequest {
  exam: string;
  examVersion: string;
}

export interface UpdateExamVersionRequest {
  exam?: string;
  examVersion?: string;
}

// ─── Subject Types ───────────────────────────────────────────
export interface AdminSubject {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  exam: { _id: string; name: string } | string;
  createdAt?: string;
}

export interface CreateSubjectRequest {
  name: string;
  code?: string;
  description?: string;
  exam: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  code?: string;
  description?: string;
}

// ─── Schedule Exam Types ────────────────────────────────────
export interface ScheduleExam {
  _id: string;
  exam: { _id: string; name: string; image?: string } | string;
  examVersion: { _id: string; examVersion: string } | string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalQuestions: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduleExamRequest {
  exam: string;
  examVersion: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration?: number;
  totalQuestions?: number;
}

export interface UpdateScheduleExamRequest {
  exam?: string;
  examVersion?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  totalQuestions?: number;
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

// ─── Quiz Attempt Types (for admin performance) ─────────────
export interface QuizAttemptSummary {
  totalAttempts: number;
  avgPercentage: number;
  completedAttempts: number;
}

export interface AdminQuizAttempt {
  _id: string;
  user: {
    _id: string;
    username?: string;
    email?: string;
    phone?: string;
    division?: string;
    district?: string;
  };
  exam?: { _id: string; name: string; image?: string } | null;
  examVersion?: { _id: string; examVersion: string } | null;
  subject?: string;
  type: 'mock_exam' | 'practice';
  source: 'question_center' | 'mock_exam' | 'quiz_practice';
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number;
  startedAt: string;
  completedAt?: string;
  isActive: boolean;
  isCompleted: boolean;
  timeTaken: number;
  createdAt: string;
}

export interface AdminQuizAttemptResponse {
  attempts: AdminQuizAttempt[];
  total: number;
  page: number;
  totalPages: number;
  summary: QuizAttemptSummary;
}

// ─── Lesson Types ────────────────────────────────────────────
export interface AdminLesson {
  _id: string;
  title: string;
  description: string;
  videoUri: string;
  material?: string[];
  course: string;
  order: number;
  duration: number;
  isPreview: boolean;
  isPublished: boolean;
  resources?: Array<{
    name: string;
    url: string;
    type: 'PDF' | 'DOC' | 'PPT' | 'VIDEO' | 'AUDIO' | 'OTHER';
  }>;
  completionCriteria?: 'WATCH' | 'QUIZ' | 'MANUAL';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonRequest {
  title: string;
  description: string;
  videoUri: string;
  course: string;
  order?: number;
  duration?: number;
  isPreview?: boolean;
  isPublished?: boolean;
  material?: string[];
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  videoUri?: string;
  order?: number;
  duration?: number;
  isPreview?: boolean;
  isPublished?: boolean;
  material?: string[];
}

// ─── Injected Endpoints ─────────────────────────────────────
const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── User Management ──────────────────────────────────────
    getAdminUsers: build.query<AdminUser[], void>({
      query: () => ({ url: '/auth/users' }),
      providesTags: ['User'],
    }),

    getAdminUserById: build.query<AdminUser, string>({
      query: (userId) => ({ url: `/auth/user/${userId}` }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    updateAdminUser: build.mutation<AdminUser, { userId: string; data: Partial<AdminUser> }>({
      query: ({ userId, data }) => ({
        url: `/auth/update/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // ── Exam Management ──────────────────────────────────────
    getAdminExams: build.query<AdminExam[], void>({
      query: () => ({ url: '/exams' }),
      providesTags: ['Quiz'],
    }),

    createAdminExam: build.mutation<AdminExam, CreateExamRequest>({
      query: (data) => ({
        url: '/exams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Quiz'],
    }),

    updateAdminExam: build.mutation<AdminExam, { examId: string; data: UpdateExamRequest }>({
      query: ({ examId, data }) => ({
        url: `/exams/${examId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Quiz'],
    }),

    deleteAdminExam: build.mutation<{ message: string }, string>({
      query: (examId) => ({
        url: `/exams/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quiz'],
    }),

    // ── Exam Version Management ─────────────────────────────
    getAdminExamVersions: build.query<AdminExamVersion[], void>({
      query: () => ({ url: '/exam-version' }),
      providesTags: ['ExamVersion'],
    }),

    createAdminExamVersion: build.mutation<AdminExamVersion, CreateExamVersionRequest>({
      query: (data) => ({
        url: '/exam-version',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamVersion'],
    }),

    updateAdminExamVersion: build.mutation<AdminExamVersion, { versionId: string; data: UpdateExamVersionRequest }>({
      query: ({ versionId, data }) => ({
        url: `/exam-version/${versionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ExamVersion'],
    }),

    deleteAdminExamVersion: build.mutation<{ message: string }, string>({
      query: (versionId) => ({
        url: `/exam-version/${versionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamVersion'],
    }),

    // ── Course Management ────────────────────────────────────
    getAdminCourses: build.query<AdminCourse[], void>({
      query: () => ({ url: '/course' }),
      providesTags: ['Course'],
    }),

    getAdminCourseById: build.query<AdminCourse, string>({
      query: (courseId) => ({ url: `/course/by-course/${courseId}` }),
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),

    createAdminCourse: build.mutation<{ message: string; course: AdminCourse }, CreateCourseRequest>({
      query: (data) => ({
        url: '/course/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),

    updateAdminCourse: build.mutation<{ message: string; course: AdminCourse }, { courseId: string; data: UpdateCourseRequest }>({
      query: ({ courseId, data }) => ({
        url: `/course/update/${courseId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),

    deleteAdminCourse: build.mutation<{ message: string }, string>({
      query: (courseId) => ({
        url: `/course/delete/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course', 'Lesson'],
    }),

    deleteAdminUser: build.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/auth/delete/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // ── Lesson Management ────────────────────────────────────
    getCourseLessons: build.query<{ lessons: AdminLesson[] }, string>({
      query: (courseId) =>  `/lesson/${courseId}`,
      providesTags: ['Lesson'],
    }),

    createAdminLesson: build.mutation<{ message: string; lesson: AdminLesson }, CreateLessonRequest>({
      query: (data) => ({
        url: '/lesson/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Lesson', 'Course'],
    }),

    updateAdminLesson: build.mutation<{ message: string; lesson: AdminLesson }, { lessonId: string; data: UpdateLessonRequest }>({
      query: ({ lessonId, data }) => ({
        url: `/lesson/update/${lessonId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Lesson'],
    }),

    deleteAdminLesson: build.mutation<{ message: string }, string>({
      query: (lessonId) => ({
        url: `/lesson/delete/${lessonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lesson', 'Course'],
    }),

    // ── Subject Management ──────────────────────────────────
    getAdminSubjects: build.query<AdminSubject[], void>({
      query: () => ({ url: '/subjects' }),
      providesTags: ['Subject'],
    }),

    getAdminSubjectsByExam: build.query<AdminSubject[], string>({
      query: (examId) => ({ url: `/subjects/exam/${examId}` }),
      providesTags: (_result, _error, examId) => [{ type: 'Subject', id: examId }],
    }),

    createAdminSubject: build.mutation<AdminSubject, CreateSubjectRequest>({
      query: (data) => ({
        url: '/subjects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subject'],
    }),

    updateAdminSubject: build.mutation<AdminSubject, { subjectId: string; data: UpdateSubjectRequest }>({
      query: ({ subjectId, data }) => ({
        url: `/subjects/${subjectId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subject'],
    }),

    deleteAdminSubject: build.mutation<{ message: string }, string>({
      query: (subjectId) => ({
        url: `/subjects/${subjectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subject'],
    }),

    // ── Schedule Exam Management ────────────────────────────
    getScheduleExams: build.query<ScheduleExam[], void>({
      query: () => ({ url: '/schedule-exams' }),
      providesTags: ['ScheduleExam'],
    }),

    getScheduleExamsByExam: build.query<ScheduleExam[], string>({
      query: (examId) => ({ url: `/schedule-exams/exam/${examId}` }),
      providesTags: (_result, _error, examId) => [{ type: 'ScheduleExam', id: examId }],
    }),

    createScheduleExam: build.mutation<ScheduleExam, CreateScheduleExamRequest>({
      query: (data) => ({
        url: '/schedule-exams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ScheduleExam'],
    }),

    updateScheduleExam: build.mutation<ScheduleExam, { examId: string; data: UpdateScheduleExamRequest }>({
      query: ({ examId, data }) => ({
        url: `/schedule-exams/${examId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ScheduleExam'],
    }),

    deleteScheduleExam: build.mutation<{ message: string }, string>({
      query: (examId) => ({
        url: `/schedule-exams/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ScheduleExam'],
    }),

    // ── Featured Mock Exam Management ───────────────────────
    getFeaturedScheduleExam: build.query<ScheduleExam | null, void>({
      query: () => ({ url: '/schedule-exams/featured' }),
      providesTags: ['ScheduleExam'],
    }),

    setFeaturedScheduleExam: build.mutation<ScheduleExam, { examId: string; isFeatured: boolean }>({
      query: ({ examId, isFeatured }) => ({
        url: `/schedule-exams/${examId}/featured`,
        method: 'PUT',
        body: { isFeatured },
      }),
      invalidatesTags: ['ScheduleExam'],
    }),

    // ── Question Bank Management ────────────────────────────
    getAdminQuestions: build.query<AdminQuestion[], void>({
      query: () => ({ url: '/questions' }),
      providesTags: ['Question'],
    }),

    updateAdminQuestionDocument: build.mutation<AdminQuestion, { questionId: string; data: Partial<AdminQuestion> }>({
      query: ({ questionId, data }) => ({
        url: `/questions/${questionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Question'],
    }),

    deleteAdminQuestionDocument: build.mutation<{ message: string }, string>({
      query: (questionId) => ({
        url: `/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Question'],
    }),

    updateAdminSingleQuestion: build.mutation<
      AdminQuestion,
      { questionId: string; questionNumber: number; data: { question_text?: string; options?: Record<string, string>; correct_answer?: string } }
    >({
      query: ({ questionId, questionNumber, data }) => ({
        url: `/questions/${questionId}/question/${questionNumber}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Question'],
    }),

    deleteAdminSingleQuestion: build.mutation<
      { message: string; document: AdminQuestion },
      { questionId: string; questionNumber: number }
    >({
      query: ({ questionId, questionNumber }) => ({
        url: `/questions/${questionId}/question/${questionNumber}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Question'],
    }),

    getAdminQuestionPatterns: build.query<AdminQuestionPattern[], void>({
      query: () => ({ url: '/questions/question-pattern' }),
      providesTags: ['Question'],
    }),

    // ── Quiz Attempt Performance ────────────────────────────
    getAllQuizAttempts: build.query<
      AdminQuizAttemptResponse,
      { type?: string; examId?: string; userId?: string; page?: number; limit?: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.set('type', params.type);
        if (params.examId) queryParams.set('examId', params.examId);
        if (params.userId) queryParams.set('userId', params.userId);
        if (params.page) queryParams.set('page', String(params.page));
        if (params.limit) queryParams.set('limit', String(params.limit));
        return { url: `/quiz-attempts?${queryParams.toString()}` };
      },
      providesTags: [{ type: 'QuizAttempt', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
  useGetAdminExamsQuery,
  useCreateAdminExamMutation,
  useGetAdminCoursesQuery,
  useGetAdminCourseByIdQuery,
  useCreateAdminCourseMutation,
  useUpdateAdminCourseMutation,
  useUpdateAdminExamMutation,
  useDeleteAdminExamMutation,
  useGetAdminQuestionsQuery,
  useUpdateAdminQuestionDocumentMutation,
  useDeleteAdminQuestionDocumentMutation,
  useUpdateAdminSingleQuestionMutation,
  useDeleteAdminSingleQuestionMutation,
  useGetAdminQuestionPatternsQuery,
  useGetCourseLessonsQuery,
  useCreateAdminLessonMutation,
  useUpdateAdminLessonMutation,
  useDeleteAdminLessonMutation,
  useDeleteAdminCourseMutation,
  useDeleteAdminUserMutation,
  useGetAdminExamVersionsQuery,
  useCreateAdminExamVersionMutation,
  useUpdateAdminExamVersionMutation,
  useDeleteAdminExamVersionMutation,

  useGetAdminSubjectsQuery,
  useGetAdminSubjectsByExamQuery,
  useCreateAdminSubjectMutation,
  useUpdateAdminSubjectMutation,
  useDeleteAdminSubjectMutation,

  useGetScheduleExamsQuery,
  useGetScheduleExamsByExamQuery,
  useCreateScheduleExamMutation,
  useUpdateScheduleExamMutation,
  useDeleteScheduleExamMutation,
  useGetFeaturedScheduleExamQuery,
  useSetFeaturedScheduleExamMutation,

  useGetAllQuizAttemptsQuery,
} = adminApi;
