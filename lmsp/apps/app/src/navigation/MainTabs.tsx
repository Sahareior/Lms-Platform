import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bot,
  FileCheck,
  LayoutDashboard,
  Menu,
  BookOpen,
} from 'lucide-react-native';

import type { TabParamList } from './types';
import { useAppTheme } from '../theme';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import ExamOptionsScreen from '../screens/exams/ExamOptionsScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import MoreScreen from '../screens/more/MoreScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export function MainTabs() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? colors.accent : colors.text,
        tabBarInactiveTintColor: colors.sub,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          borderTopWidth: 1,
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 4,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exams"
        component={ExamOptionsScreen}
        options={{
          title: 'Exams',
          tabBarIcon: ({ color, size }) => (
            <FileCheck size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AI"
        component={AIChatScreen}
        options={{
          title: 'AI Tutor',
          tabBarIcon: ({ color, size }) => <Bot size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Menu size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;
