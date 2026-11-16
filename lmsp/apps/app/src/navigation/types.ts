import type { SharedQuizResultData } from '@my-monorepo/store';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth screens live on the same native stack; they are only registered
  // while the user is signed out.
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string; email?: string } | undefined;

  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Onboarding: undefined;

  CourseDetail: { courseId: string; title?: string };
  Lesson: { courseId: string; courseTitle?: string; lessonId?: string };

  ExamPlayer: {
    examId: string;
    scheduleId?: string;
    versionId?: string;
    title?: string;
  };
  Result: { result?: SharedQuizResultData; attemptId?: string };

  Performance: undefined;
  Notebook: undefined;
  StudySection: undefined;
  PdfList: undefined;
  BlogList: undefined;
  BlogPost: { postId: string };
  StudyGroups: undefined;
  QuestionCenter: undefined;
  QuestionList: {
    examId: string;
    examName?: string;
    subjectId?: string;
    subjectName?: string;
    questionType?: 'board' | 'testpaper' | 'mockexam';
  };
  QuestionType: {
    examId: string;
    examName?: string;
    subjectId?: string;
    subjectName?: string;
  };
  QuestionPractice: {
    examId: string;
    examName?: string;
    subjectId?: string;
    subjectName?: string;
    questionType?: 'board' | 'testpaper' | 'mockexam';
  };
  QuestionView: {
    examId: string;
    examName?: string;
    subjectId?: string;
    subjectName?: string;
    questionType?: 'board' | 'testpaper' | 'mockexam';
  };
  QuestionPatterns: undefined;
  Reading: undefined;
  PrivacyPolicy: undefined;
  Search: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Courses: undefined;
  Exams: undefined;
  AI: undefined;
  More: undefined;
};

export type AuthStackParamList = Pick<
  RootStackParamList,
  'Login' | 'Register' | 'ForgotPassword' | 'ResetPassword'
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
