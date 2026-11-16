import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAppSelector, useGetMeQuery } from '@my-monorepo/store';

import type { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { useAppTheme } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import LessonScreen from '../screens/courses/LessonScreen';
import ExamPlayerScreen from '../screens/exams/ExamPlayerScreen';
import ResultScreen from '../screens/exams/ResultScreen';
import PerformanceScreen from '../screens/performance/PerformanceScreen';
import NotebookScreen from '../screens/notebook/NotebookScreen';
import StudySectionScreen from '../screens/study/StudySectionScreen';
import PdfListScreen from '../screens/study/PdfListScreen';
import BlogListScreen from '../screens/study/BlogListScreen';
import BlogPostScreen from '../screens/study/BlogPostScreen';
import StudyGroupsScreen from '../screens/study/StudyGroupsScreen';
import QuestionCenterScreen from '../screens/questions/QuestionCenterScreen';
import QuestionListScreen from '../screens/questions/QuestionListScreen';
import QuestionPatternsScreen from '../screens/questions/QuestionPatternsScreen';
import QuestionTypeScreen from '../screens/questions/QuestionTypeScreen';
import QuestionPracticeScreen from '../screens/questions/QuestionPracticeScreen';
import QuestionViewScreen from '../screens/questions/QuestionViewScreen';
import ReadingScreen from '../screens/study/ReadingScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';
import SearchScreen from '../screens/search/SearchScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useAppTheme();
  const { isAuthenticated, user } = useAppSelector((s) => s.user);

  // Fresh profile so onboarding is decided from server truth, not stale cache.
  const { data: freshUser, isLoading: isProfileLoading } = useGetMeQuery(
    undefined,
    { skip: !isAuthenticated }
  );

  const effectiveUser = freshUser || user;
  const selectedExams = (effectiveUser as any)?.selectedExams as
    | unknown[]
    | undefined;
  const hasExams = Array.isArray(selectedExams) && selectedExams.length > 0;
  const isStudent = effectiveUser?.role !== 'admin';

  const waitingForProfile =
    isAuthenticated &&
    isStudent &&
    !freshUser &&
    isProfileLoading &&
    !hasExams;

  if (waitingForProfile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // Only force onboarding once the server profile actually loaded, so a
  // flaky connection never sends an existing student through onboarding.
  const needsOnboarding = isAuthenticated && isStudent && !!freshUser && !hasExams;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Group>
      ) : needsOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="Tabs" component={MainTabs} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Lesson" component={LessonScreen} />
          <Stack.Screen name="ExamPlayer" component={ExamPlayerScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Performance" component={PerformanceScreen} />
          <Stack.Screen name="Notebook" component={NotebookScreen} />
          <Stack.Screen name="StudySection" component={StudySectionScreen} />
          <Stack.Screen name="PdfList" component={PdfListScreen} />
          <Stack.Screen name="BlogList" component={BlogListScreen} />
          <Stack.Screen name="BlogPost" component={BlogPostScreen} />
          <Stack.Screen name="StudyGroups" component={StudyGroupsScreen} />
          <Stack.Screen name="QuestionCenter" component={QuestionCenterScreen} />
          <Stack.Screen name="QuestionList" component={QuestionListScreen} />
          <Stack.Screen name="QuestionType" component={QuestionTypeScreen} />
          <Stack.Screen
            name="QuestionPractice"
            component={QuestionPracticeScreen}
          />
          <Stack.Screen name="QuestionView" component={QuestionViewScreen} />
          <Stack.Screen
            name="QuestionPatterns"
            component={QuestionPatternsScreen}
          />
          <Stack.Screen name="Reading" component={ReadingScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
