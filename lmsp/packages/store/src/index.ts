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
  useGetExamsQuery
} from './redux/api/examApi';
export type{
  courseResponse
} from "./redux/api/examApi"

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
