import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './(components)/Dashboard';
import LessonPage from './(components)/MainPages/lesson/LessonPage';
import ExamUI from './(components)/Quiz';
import MockExamInterface from './(components)/MockExamInterface';
import AIChatInterface from './(components)/MainPages/chat_interface/AIChatInterface';
import QuestionPatterns from './(components)/MainPages/question_patterns/QuestionPatterns';
import Perfomence from './(components)/MainPages/performence/Perfomence';
import Settings from './(components)/Settings';
import ExamSelection from './(components)/onBoarding/ExamSelection';
import EnrollmentPage from './(components)/onBoarding/enrollment/EnrollmentPage';

import { Login, SignUp } from './auth/AuthPages';
import AuthGuard from './auth/AuthGuard';
import ExamOptions from './exam/ExamOptions';
import QuizPreatise from './(components)/QuizPreatise/QuizPreatise';
import SelectedExam from './exam/routes/SelectedExam';
import Exampage from './exam/routes/StartExam';
import QuestionMaster from './(components)/MainPages/Question_Master/component/QuestionMaster';
import ExamDin from './(components)/MainPages/Question_Master/component/ExamDin';
import ExamCategorySelection from './(components)/MainPages/Question_Master/ExamCategorySelection';
import AdminDashboard from './AdminDashboard/AdminDashboard';
import DashboardOverview from './AdminDashboard/pages/DashboardOverview';
import UserManagement from './AdminDashboard/pages/UserManagement';
import ExamManagement from './AdminDashboard/pages/ExamManagement';
import CourseManagement from './AdminDashboard/pages/CourseManagement';
import LessonManagement from './AdminDashboard/pages/LessonManagement';
import QuestionManagement from './AdminDashboard/pages/QuestionManagement';
import QuestionBank from './AdminDashboard/pages/QuestionBank';
import SubjectManagement from './AdminDashboard/pages/SubjectManagement';
import ExamControl from './AdminDashboard/pages/ExamControl';
import UserPerformance from './AdminDashboard/pages/UserPerformance';

const router = createBrowserRouter([
  // ── Public Routes (no auth required) ──────────────────
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <SignUp />,
  },

  // ── Onboarding Routes (auth required) ────────────────
  {
    path: 'on-boarding',
    element: (
      <AuthGuard>
        <ExamSelection />
      </AuthGuard>
    ),
  },
  {
    path: 'on-boarding/enroll',
    element: (
      <AuthGuard>
        <EnrollmentPage />
      </AuthGuard>
    ),
  },

  // ── Main App Layout (auth required) ──────────────────
  {
    path: '/',
    element: (
      <AuthGuard>
        <App />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
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
        ],
      },
      { path: 'ai-assistant', element: <AIChatInterface /> },
      { path: 'question-bank', element: <QuestionPatterns /> },
      { path: 'performance', element: <Perfomence /> },
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
      <AuthGuard >
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
      { path: 'user-performance', element: <UserPerformance /> },
    ],
  },
]);

export default router;
