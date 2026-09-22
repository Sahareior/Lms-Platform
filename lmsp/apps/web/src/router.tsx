import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import Seo from './seo/Seo';
import App from './App';
import { Login, SignUp, ForgotPassword, ResetPassword } from './auth/AuthPages';
import AuthGuard from './auth/AuthGuard';
import HomeRedirect from './auth/HomeRedirect';
import Omer from './(components)/MainPages/mock_exam/ExamPaper/omr/Omr';
import PrivacyPolicy from './legal/PrivacyPolicy';

// ─── Lazy page imports (route-level code splitting) ─────────
// Each page ships in its own chunk, loaded on first visit, so the
// initial bundle stays small instead of pulling in the whole admin
// panel, recharts, antd, etc. up front.
const Dashboard = lazy(() => import('./(components)/MainPages/dashboard/Dashboard'));
const LessonPage = lazy(() => import('./(components)/MainPages/lesson/LessonPage'));
const QuizPreatise = lazy(() => import('./(components)/MainPages/mock_exam/ExamPaper/ExamPaper'));
const MockExamInterface = lazy(() => import('./(components)/MockExamInterface'));
const AIChatInterface = lazy(() => import('./(components)/MainPages/chat_interface/AIChatInterface'));
const QuestionPatterns = lazy(() => import('./(components)/MainPages/question_patterns/QuestionPatterns'));
const Perfomence = lazy(() => import('./(components)/MainPages/performence/Perfomence'));
const SearchPage = lazy(() => import('./(components)/MainPages/search/SearchPage'));
const MistakeNotebook = lazy(() => import('./(components)/MainPages/mistake_notebook/MistakeNotebook'));
const Settings = lazy(() => import('./(components)/Settings'));
const NavigationHub = lazy(() => import('./navigation/NavigationHub'));
const AvailableCourses = lazy(() => import('./(components)/AvailableCourses'));
const CourseDetails = lazy(() => import('./(components)/CourseDetails'));
const Onboarding = lazy(() => import('./(components)/onBoarding/Onboarding'));
const ExamOptions = lazy(() => import('./(components)/MainPages/mock_exam/ExamOptions'));
const StudySection = lazy(() => import('./(components)/MainPages/study_section/StudySection'));
const PdfSection = lazy(() => import('./(components)/MainPages/study_section/PdfSection'));
const BlogSection = lazy(() => import('./(components)/MainPages/study_section/BlogSection'));
const BlogPostDetail = lazy(() => import('./(components)/MainPages/study_section/BlogPostDetail'));
const StudyGroupSection = lazy(() => import('./(components)/MainPages/study_section/StudyGroupSection'));
const ReadingPage = lazy(() => import('./(components)/MainPages/study_section/ReadingPage/ReadingPage'));
const PdfManagement = lazy(() => import('./AdminDashboard/pages/StudySection/PdfManagement'));
const BlogManagement = lazy(() => import('./AdminDashboard/pages/StudySection/BlogManagement'));
const BlogPostEditor = lazy(() => import('./AdminDashboard/pages/StudySection/BlogPostEditor'));
const StudyGroupManagement = lazy(() => import('./AdminDashboard/pages/StudySection/StudyGroupManagement'));
const SelectedExam = lazy(() => import('./(components)/MainPages/mock_exam/routes/SelectedExam'));
const Exampage = lazy(() => import('./(components)/MainPages/mock_exam/routes/StartExam'));
const ResultPage = lazy(() => import('./(components)/MainPages/mock_exam/routes/ResultPage'));
const QuestionMaster = lazy(() => import('./(components)/MainPages/Question_Master/component/QuestionMaster'));
const ExamDin = lazy(() => import('./(components)/MainPages/Question_Master/component/ExamDin'));
const QuestionView = lazy(() => import('./(components)/MainPages/Question_Master/component/QuestionView'));
const QuestionTypeSelection = lazy(() => import('./(components)/MainPages/Question_Master/QuestionTypeSelection'));
const ExamCategorySelection = lazy(() => import('./(components)/MainPages/Question_Master/ExamCategorySelection'));
const SubjectCategorySelection = lazy(() => import('./(components)/MainPages/Question_Master/SubjectCategorySelection'));
const AdminDashboard = lazy(() => import('./AdminDashboard/AdminDashboard'));
const DashboardOverview = lazy(() => import('./AdminDashboard/pages/DashboardOverview'));
const UserManagement = lazy(() => import('./AdminDashboard/pages/UserManagement'));
const ExamManagement = lazy(() => import('./AdminDashboard/pages/ExamManagement'));
const CourseManagement = lazy(() => import('./AdminDashboard/pages/CourseManagement'));
const LessonManagement = lazy(() => import('./AdminDashboard/pages/LessonManagement/LessonManagement'));
const QuestionManagement = lazy(() => import('./AdminDashboard/pages/QuestionManagement'));
const QuestionBank = lazy(() => import('./AdminDashboard/pages/QuestionBank/QuestionBank'));
const QuestionManager = lazy(() => import('./AdminDashboard/pages/QuestionBank/QuestionManager'));
const SubjectManagement = lazy(() => import('./AdminDashboard/pages/SubjectManagement'));
const ExamControl = lazy(() => import('./AdminDashboard/pages/ExamControl'));
const FeaturedExamControl = lazy(() => import('./AdminDashboard/pages/FeaturedExamControl'));
const UserPerformance = lazy(() => import('./AdminDashboard/pages/UserPerformance/UserPerformance'));
const AttemptDetail = lazy(() => import('./AdminDashboard/pages/UserPerformance/AttemptDetail'));
const CreativeQuestions = lazy(() => import('./AdminDashboard/pages/CreativeQuestions/CreativeQuestions'));
const CreativeQuestionManager = lazy(() => import('./AdminDashboard/pages/CreativeQuestions/CreativeQuestionManager'));

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
    path: 'omr',
    element: <Omer />
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
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
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
          {
            path: 'study-section',
            element: <StudySection />,
            children: [
              { path: 'reading', element: <ReadingPage /> },
              { path: 'pdf', element: <PdfSection /> },
              { path: 'pdf/:category', element: <PdfSection /> },
              { path: 'posts', element: <BlogSection /> },
              { path: 'posts/:postId', element: <BlogPostDetail /> },
              { path: 'study-group', element: <StudyGroupSection /> },
            ],
          },
          { path: 'reading', element: <ReadingPage /> },
          { path: 'ai-assistant', element: <AIChatInterface /> },
          { path: 'question-bank', element: <QuestionPatterns /> },
          { path: 'performance', element: <Perfomence /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'notebook', element: <MistakeNotebook /> },
          // Old path kept as a redirect so existing links keep working
          { path: 'mistake-notebook', element: <Navigate to="/notebook" replace /> },
          { path: 'question-center', element: <ExamCategorySelection /> },
          {
            path: 'question-center/:examType',
            element: <SubjectCategorySelection />,
          },
          {
            path: 'question-center/:examType/:subjectId',
            element: <QuestionMaster />,
            children: [
              {
                path: 'exam-din',
                element: <ExamDin />,
              },
              {
                path: 'question-view',
                element: <QuestionView />,
              },
            ],
          },
          {
            path: 'question-center/:examType/:subjectId/type',
            element: <QuestionTypeSelection />,
          },
          { path: 'settings', element: <Settings /> },
          { path: 'navigate', element: <NavigationHub /> },
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
          { path: 'question-bank/:documentId', element: <QuestionManager /> },
          { path: 'creative-questions', element: <CreativeQuestions /> },
          { path: 'creative-questions/:setId', element: <CreativeQuestionManager /> },
          { path: 'subjects', element: <SubjectManagement /> },
          { path: 'exam-control', element: <ExamControl /> },
          { path: 'featured-exam', element: <FeaturedExamControl /> },
          { path: 'user-performance', element: <UserPerformance /> },
          { path: 'user-performance/:attemptId', element: <AttemptDetail /> },

          // ── Study Section (PDFs / Blog / Groups) ──────────
          { path: 'study-section/pdf', element: <PdfManagement /> },
          { path: 'study-section/blog', element: <BlogManagement /> },
          { path: 'study-section/blog/new', element: <BlogPostEditor /> },
          { path: 'study-section/blog/edit/:postId', element: <BlogPostEditor /> },
          { path: 'study-section/groups', element: <StudyGroupManagement /> },
        ],
      },
    ],
  },
]);

export default router;
