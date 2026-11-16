import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Library,
  LogOut,
  NotebookPen,
  Search,
  Settings,
  Bell,
  FileCheck,
} from 'lucide-react-native';
import {
  useAppDispatch,
  useAppSelector,
  useGetMeQuery,
  logout,
  setAuthToken,
  clearAuthTokens,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Avatar,
  Badge,
  Button,
  Card,
  ListRow,
  Screen,
  SectionHeader,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';
import { clearSession } from '../../lib/authStorage';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { colors, radius } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const { data: me } = useGetMeQuery();

  const profile: any = me || user;
  const selectedExams = Array.isArray(profile?.selectedExams)
    ? profile.selectedExams
    : [];

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will be signed out on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setAuthToken(null);
          clearAuthTokens();
          await clearSession();
          dispatch(logout());
        },
      },
    ]);
  };

  const items = [
    {
      icon: BarChart3,
      title: 'Performance',
      subtitle: 'Score history, subject accuracy and AI insights',
      onPress: () => navigation.navigate('Performance'),
      tone: colors.info,
    },
    {
      icon: NotebookPen,
      title: 'Mistake notebook',
      subtitle: 'Every wrong answer, ready for revision',
      onPress: () => navigation.navigate('Notebook'),
      tone: colors.warning,
    },
    {
      icon: GraduationCap,
      title: 'Study section',
      subtitle: 'PDFs, blog notes and study groups',
      onPress: () => navigation.navigate('StudySection'),
      tone: colors.success,
    },
    {
      icon: Search,
      title: 'Question center',
      subtitle: 'Browse questions by exam and subject',
      onPress: () => navigation.navigate('QuestionCenter'),
      tone: colors.accent,
    },
    {
      icon: Library,
      title: 'Question patterns',
      subtitle: 'Repeated question analysis per topic',
      onPress: () => navigation.navigate('QuestionPatterns'),
      tone: colors.info,
    },
    {
      icon: FileCheck,
      title: 'Mock exams',
      subtitle: 'Scheduled papers and practice attempts',
      onPress: () => navigation.navigate('Tabs', { screen: 'Exams' }),
      tone: colors.warning,
    },
    {
      icon: BookOpen,
      title: 'My courses',
      subtitle: 'Enrolled courses and lesson progress',
      onPress: () => navigation.navigate('Tabs', { screen: 'Courses' }),
      tone: colors.success,
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Exam announcements and account updates',
      onPress: () => navigation.navigate('Notifications'),
      tone: colors.accent,
    },
  ];

  return (
    <Screen>
      <AppBar title="More" subtitle="Everything else in one place" />

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar name={profile?.name || profile?.email} size={52} />
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.text, fontSize: 16, fontWeight: '900' }}
              numberOfLines={1}
            >
              {profile?.name || 'Learner'}
            </Text>
            <Text
              style={{ color: colors.sub, fontSize: 11, marginTop: 2 }}
              numberOfLines={1}
            >
              {profile?.email}
            </Text>
          </View>
          <Badge
            label={String(profile?.role || 'student').toUpperCase()}
            tone="info"
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: spacing.md,
          }}
        >
          {selectedExams.slice(0, 4).map((exam: any) => (
            <Badge key={exam?._id || exam} label={exam?.name || String(exam)} />
          ))}
          {selectedExams.length === 0 ? (
            <Text style={{ color: colors.muted, fontSize: 10 }}>
              No exams selected yet
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Button
              label="Settings"
              variant="secondary"
              small
              icon={Settings}
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Log out"
              variant="ghost"
              small
              icon={LogOut}
              onPress={confirmLogout}
            />
          </View>
        </View>
      </Card>

      <SectionHeader title="Explore" />
      <View style={{ gap: spacing.sm }}>
        {items.map((item) => (
          <ListRow
            key={item.title}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            tone={item.tone}
            onPress={item.onPress}
          />
        ))}
      </View>

      <View
        style={{
          marginTop: spacing.xl,
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          padding: spacing.md,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 1,
          }}
        >
          GENESEON
        </Text>
        <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
          AI LMS Platform · mobile v1.0.0
        </Text>
        <Text
          style={{
            color: colors.muted,
            fontSize: 9,
            marginTop: 6,
            textAlign: 'center',
          }}
        >
          Your progress syncs with the website automatically.
        </Text>
      </View>
    </Screen>
  );
}
