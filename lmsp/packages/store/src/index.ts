// ─── Redux Store ────────────────────────────────────────────
export { store, createStore } from './redux/store';
export type { AppDispatch, AppStore } from './redux/store';
export { useAppDispatch, useAppSelector } from './redux/hooks';
export type { RootState } from './redux/hooks';

// ─── Redux Slices ───────────────────────────────────────────
export { default as userReducer } from './redux/slices/userSlice';
export {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
} from './redux/slices/userSlice';

export { default as courseReducer } from './redux/slices/courseSlice';
export {
  setCourses,
  setActiveCourse,
  updateCourseProgress,
  setLoading as setCourseLoading,
} from './redux/slices/courseSlice';

export { default as uiReducer } from './redux/slices/uiSlice';
export {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  toggleTheme as toggleThemeInStore,
  setIsMobile,
} from './redux/slices/uiSlice';

// ─── RTK Query Base (config + auth token) ───────────────────
export { configureApi, setAuthToken, getAuthToken } from './redux/api/baseApi';

// ─── RTK Query AI API (separate endpoint on port 5000) ─────
export { configureAiApi, aiApi } from './redux/api/aiApi';
export {
  useSendChatMessageMutation,
  useUploadDocumentsMutation,
  useQuestionAnalyzerMutation,
  useQuestionPaperScraperMutation,
} from './redux/api/aiApi';
export type {
  AiChatRequest,
  AiChatResponse,
  ScrapedQuestion,
  QuestionPaperScraperResponse,
  QuestionAnalyzerQuestion,
  QuestionAnalyzerRequest,
} from './redux/api/aiApi';

// ─── RTK Query Auth API ─────────────────────────────────────
export {
  useLoginMutation,
  useRegisterMutation,
  useAddUserInfoMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from './redux/api/authApi';
export type {
  LoginRequest,
  RegisterRequest,
  UpdateUser,
  AuthResponse,
} from './redux/api/authApi';

// ─── RTK Query Course API ───────────────────────────────────
export {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useEnrollCourseMutation,
  useCompleteLessonMutation,
} from './redux/api/courseApi';
export type {
  CourseListResponse,
  CourseDetailResponse,
  Lesson,
} from './redux/api/courseApi';

// ─── RTK Query Note API ──────────────────────────────────────
export {
  useGetLessonNoteQuery,
  useSaveLessonNoteMutation,
  useGetAllUserNotesQuery,
} from './redux/api/noteApi';
export type {
  Note,
  NoteResponse,
  NotesListResponse,
} from './redux/api/noteApi';

// ─── RTK Query Quiz / Exam API ──────────────────────────────
export {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useSubmitQuizMutation,
  useGetQuizResultsQuery,
} from './redux/api/quizApi';
export type {
  Question,
  Quiz,
  QuizListResponse,
  SubmitAnswerRequest,
  QuizResult,
} from './redux/api/quizApi';

export {
  useGetExamsQuery,
  useGetAnalyzedQuestionsQuery,
  useGetSubjectsByExamQuery,
  useGetExamVersionsByExamQuery,
  useGetQuestionsByExamQuery
} from './redux/api/examApi';
export type {
  courseResponse,
  SubjectByExam
} from "./redux/api/examApi"

// ─── RTK Query Admin API ─────────────────────────────────────
export {
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
  useGetAdminExamsQuery,
  useCreateAdminExamMutation,
  useUpdateAdminExamMutation,
  useDeleteAdminExamMutation,
  useGetAdminExamVersionsQuery,
  useCreateAdminExamVersionMutation,
  useUpdateAdminExamVersionMutation,
  useDeleteAdminExamVersionMutation,
  useGetAdminCoursesQuery,
  useGetAdminCourseByIdQuery,
  useCreateAdminCourseMutation,
  useUpdateAdminCourseMutation,
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
} from './redux/api/adminApi';
export type {
  AdminUser,
  AdminCourse,
  AdminExam,
  AdminExamVersion,
  AdminQuestion,
  AdminQuestionPattern,
  AdminLesson,
  EnrolledStudent,
  CreateExamRequest,
  CreateExamVersionRequest,
  UpdateExamVersionRequest,
  CreateCourseRequest,
  CreateLessonRequest,
  UpdateLessonRequest,
  AdminSubject,
  CreateSubjectRequest,
  UpdateSubjectRequest,

  ScheduleExam,
  CreateScheduleExamRequest,
  UpdateScheduleExamRequest,
} from './redux/api/adminApi';

// ─── Context Providers ──────────────────────────────────────
export { SharedProviders } from './providers';
export { ThemeProvider, useTheme } from './contexts/ThemeContext';

// ─── Types ──────────────────────────────────────────────────
export type {
  User,
  AuthState,
  Course,
  CourseState,
  Theme,
  UIState,
  RootState as AppRootState,
} from './types';
