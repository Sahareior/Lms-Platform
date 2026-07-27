import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './(components)/Dashboard';
import LessonPage from './(components)/MainPages/lesson/LessonPage';
import ExamUI from './(components)/Quiz';
import MockExamInterface from './(components)/MockExamInterface';
import AIChatInterface from './(components)/MainPages/chat_interface/AIChatInterface';
import QuestionPatterns from './(components)/MainPages/question_bank/QuestionPatterns';
import Perfomence from './(components)/MainPages/performence/Perfomence';
import Settings from './(components)/Settings';
import ExamSelection from './(components)/ExamSelection';
import EnrollmentPage from './(components)/onBoarding/enrollment/EnrollmentPage';

import { Login, SignUp } from './auth/AuthPages';
import ExamOptions from './exam/ExamOptions';
import QuizPreatise from './(components)/QuizPreatise/QuizPreatise';
import SelectedExam from './exam/routes/SelectedExam';
import Exampage from './exam/routes/StartExam';
import QuestionMaster from './(components)/MainPages/Question_Master/QuestionMaster';
import ExamDin from './(components)/MainPages/Question_Master/component/ExamDin';
import ExamCategorySelection from './(components)/MainPages/Question_Master/_components/ExamCategorySelection';
import AdminDashboard from './AdminDashboard/AdminDashboard';

const router = createBrowserRouter([  {
    path:'on-boarding',
    element:<ExamSelection />
   },
   {
    path:'on-boarding/enroll',
    element:<EnrollmentPage />
   },
  {
    path:'login',
    element: <Login />
  },
  {
    path:'register',
    element: <SignUp />
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'courses', element: <LessonPage /> },
      { path: 'courses/:courseId', element: <LessonPage /> },
      { path: 'quiz', element: <QuizPreatise />,
        children:[

        ]
       },
      { path: 'mock-exam', element: <ExamOptions />,
        children:[
          {
            path:'selected-exam',
            element:<SelectedExam />,
            children:[
              {
                path:'exam-page',
                element:<Exampage />
              }
            ]
          }
        ]
       },
      { path: 'ai-assistant', element: <AIChatInterface /> },
      { path: 'question-bank', element: <QuestionPatterns /> },
      { path: 'performance', element: <Perfomence /> },
      { path: 'question-center', element: <ExamCategorySelection /> },
      { path: 'question-center/:examType', element: <QuestionMaster />,
        children:[
          {
            path:'exam-din',
            element:<ExamDin />
          }
        ]
       },
      { path: 'settings', element: <Settings /> },
      { path: 'admin', element: <AdminDashboard /> },

    ],
  },
]);

export default router;
