import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import Seo from './seo/Seo';
import App from './App';
import { Login, SignUp, ForgotPassword, ResetPassword } from './auth/AuthPages';
import AuthGuard from './auth/AuthGuard';
import HomeRedirect from './auth/HomeRedirect';

// ─── Lazy page imports (route-level code splitting) ─────────
// Each page ships in its own chunk, loaded on first visit, so the
// initial bundle stays small instead of pulling in the whole admin
// panel, recharts, antd, etc. up front.
const Dashboard = lazy(() => import('./(components)/dashboard/Dashboard'));
const LessonPage = lazy(() => import('./(components)/MainPages/lesson/LessonPage'));
const QuizPreatise = lazy(() => import('./(components)/ExamPaper/ExamPaper'));
const MockExamInterface = lazy(() => import('./(components)/MockExamInterface'));
const AIChatInterface = lazy(() => import('./(components)/MainPages/chat_interface/AIChatInterface'));
const QuestionPatterns = lazy(() => import('./(components)/MainPages/question_patterns/QuestionPatterns'));
const Perfomence = lazy(() => import('./(components)/MainPages/performence/Perfomence'));
const SearchPage = lazy(() => import('./(components)/MainPages/search/SearchPage'));
const Settings = lazy(() => import('./(components)/Settings'));
const AvailableCourses = lazy(() => import('./(components)/AvailableCourses'));
const CourseDetails = lazy(() => import('./(components)/CourseDetails'));
const Onboarding = lazy(() => import('./(components)/onBoarding/Onboarding'));
const ExamOptions = lazy(() => import('./(components)/MainPages/mock_exam/ExamOptions'));
const SelectedExam = lazy(() => import('./(components)/MainPages/mock_exam/routes/SelectedExam'));
const Exampage = lazy(() => import('./(components)/MainPages/mock_exam/routes/StartExam'));
const ResultPage = lazy(() => import('./(components)/MainPages/mock_exam/routes/ResultPage'));
const QuestionMaster = lazy(() => import('./(components)/MainPages/Question_Master/component/QuestionMaster'));
const ExamDin = lazy(() => import('./(components)/MainPages/Question_Master/component/ExamDin'));
const ExamCategorySelection = lazy(() => import('./(components)/MainPages/Question_Master/ExamCategorySelection'));
const AdminDashboard = lazy(() => import('./AdminDashboard/AdminDashboard'));
const DashboardOverview = lazy(() => import('./AdminDashboard/pages/DashboardOverview'));
const UserManagement = lazy(() => import('./AdminDashboard/pages/UserManagement'));
const ExamManagement = lazy(() => import('./AdminDashboard/pages/ExamManagement'));
const CourseManagement = lazy(() => import('./AdminDashboard/pages/CourseManagement'));
const LessonManagement = lazy(() => import('./AdminDashboard/pages/LessonManagement/LessonManagement'));
const QuestionManagement = lazy(() => import('./AdminDashboard/pages/QuestionManagement'));
const QuestionBank = lazy(() => import('./AdminDashboard/pages/QuestionBank'));
const SubjectManagement = lazy(() => import('./AdminDashboard/pages/SubjectManagement'));
const ExamControl = lazy(() => import('./AdminDashboard/pages/ExamControl'));
const FeaturedExamControl = lazy(() => import('./AdminDashboard/pages/FeaturedExamControl'));
const UserPerformance = lazy(() => import('./AdminDashboard/pages/UserPerformance'));

const router = createBrowserRouter([
  // ── Landing page at / (public marketing page with its own per-route SEO) ──
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Seo />
        <ScrollToTop />
        <HomeRedirect />
      </Suspense>
    ),
  },
  // Old /landing URL → redirect to the new home
  {
    path: '/landing',
    element: <Navigate to="/" replace />,
  },

  {
    element: (
      <>
        <Seo />
        <ScrollToTop />
        <Outlet />
      </>
    ),
    children: [
      // ── Public Routes (no auth required) ──────────────────
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <SignUp />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },

      // ── Onboarding (auth required, first-time exam selection) ──
      {
        path: 'onboarding',
        element: (
          <AuthGuard>
            <Onboarding />
          </AuthGuard>
        ),
      },

      // ── Main App Layout (auth required) ──────────────────
      // Pathless layout so the app keeps its top-level URLs (/mock-exam,
      // /performance, …) while / itself stays the public landing page.
      {
        element: (
          <AuthGuard>
            <App />
          </AuthGuard>
        ),
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'available-courses', element: <AvailableCourses /> },
          { path: 'course/:courseId', element: <CourseDetails /> },
          { path: 'courses', element: <LessonPage /> },
          { path: 'courses/:courseId', element: <LessonPage /> },
          {
            path: 'quiz',
            element: <QuizPreatise />,
            children: [],
          },
          {
            path: 'mock-exam',
            element: <ExamOptions />,
            children: [
              {
                path: 'selected-exam',
                element: <SelectedExam />,
                children: [
                  {
                    path: 'exam-page',
                    element: <Exampage />,
                  },
                ],
              },
              {
                path: 'result',
                element: <ResultPage />,
              },
            ],
          },
          { path: 'ai-assistant', element: <AIChatInterface /> },
          { path: 'question-bank', element: <QuestionPatterns /> },
          { path: 'performance', element: <Perfomence /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'question-center', element: <ExamCategorySelection /> },
          {
            path: 'question-center/:examType',
            element: <QuestionMaster />,
            children: [
              {
                path: 'exam-din',
                element: <ExamDin />,
              },
            ],
          },
          { path: 'settings', element: <Settings /> },
        ],
      },

      // ── Admin Routes (auth + admin role required) ────────
      {
        path: 'admin',
        element: (
          <AuthGuard requireAdmin>
            <AdminDashboard />
          </AuthGuard>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'users', element: <UserManagement /> },
          { path: 'exams', element: <ExamManagement /> },
          { path: 'courses', element: <CourseManagement /> },
          { path: 'courses/:courseId/lessons', element: <LessonManagement /> },
          { path: 'questions', element: <QuestionManagement /> },
          { path: 'question-bank', element: <QuestionBank /> },
          { path: 'subjects', element: <SubjectManagement /> },
          { path: 'exam-control', element: <ExamControl /> },
          { path: 'featured-exam', element: <FeaturedExamControl /> },
          { path: 'user-performance', element: <UserPerformance /> },
        ],
      },
    ],
  },
]);

export default router;
