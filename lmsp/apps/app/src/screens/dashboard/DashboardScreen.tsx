import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarClock,
  FileCheck,
  Flame,
  NotebookPen,
  Search,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react-native';
import {
  useAppSelector,
  useGetEnrolledCourseQuery,
  useGetFeaturedScheduleExamQuery,
  useGetMyGamificationQuery,
  useGetQuizOverviewQuery,
  useGetWeeklyActivityQuery,
  useGetLeaderboardQuery,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Loader,
  ProgressBar,
  Screen,
  SectionHeader,
  StatTile,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';
import { getInitials, formatDate } from '@my-monorepo/store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, radius, isDark } = useAppTheme();

  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const { data: enrolled, isLoading: coursesLoading, refetch: refetchCourses } =
    useGetEnrolledCourseQuery(userId, { skip: !userId });
  const { data: weekly, refetch: refetchWeekly } = useGetWeeklyActivityQuery(
    { userId },
    { skip: !userId }
  );
  const { data: overview, refetch: refetchOverview } = useGetQuizOverviewQuery(
    { userId },
    { skip: !userId }
  );
  const { data: gamification, refetch: refetchGamification } =
    useGetMyGamificationQuery();
  const { data: featured } = useGetFeaturedScheduleExamQuery();
  const { data: leaderboard } = useGetLeaderboardQuery({ range: 'all', limit: 5 });

  const courses: any[] = Array.isArray(enrolled) ? enrolled : [];

  const weeklyBars = useMemo(() => {
    const attempts = weekly?.attempts || [];
    const today = new Date();
    const days: { label: string; count: number; accuracy: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toDateString();
      const dayAttempts = attempts.filter(
        (a) => new Date(a.createdAt).toDateString() === key
      );
      const accuracy =
        dayAttempts.length > 0
          ? Math.round(
              dayAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                dayAttempts.length
            )
          : 0;
      days.push({
        label: WEEKDAYS[(d.getDay() + 6) % 7],
        count: dayAttempts.length,
        accuracy,
      });
    }
    return days;
  }, [weekly]);

  const maxBar = Math.max(1, ...weeklyBars.map((b) => b.count));
  const overall = overview?.overall;

  const featuredExam: any = featured;
  const featuredExamId =
    typeof featuredExam?.exam === 'string'
      ? featuredExam.exam
      : featuredExam?.exam?._id;

  const refreshAll = () => {
    refetchCourses();
    refetchWeekly();
    refetchOverview();
    refetchGamification();
  };

  const quickActions = [
    {
      label: 'Mock Exam',
      icon: FileCheck,
      onPress: () => navigation.navigate('Tabs', { screen: 'Exams' }),
    },
    {
      label: 'AI Tutor',
      icon: Bot,
      onPress: () => navigation.navigate('Tabs', { screen: 'AI' }),
    },
    {
      label: 'Performance',
      icon: BarChart3,
      onPress: () => navigation.navigate('Performance'),
    },
    {
      label: 'Notebook',
      icon: NotebookPen,
      onPress: () => navigation.navigate('Notebook'),
    },
    {
      label: 'Study',
      icon: BookOpen,
      onPress: () => navigation.navigate('StudySection'),
    },
    {
      label: 'Search',
      icon: Search,
      onPress: () => navigation.navigate('Search'),
    },
  ];

  return (
    <Screen refreshing={coursesLoading} onRefresh={refreshAll}>
      {/* Greeting */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.onAccent, fontWeight: '900', fontSize: 16 }}>
            {getInitials(user?.name || user?.email)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700' }}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
            })}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 21,
              fontWeight: '900',
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            Hi, {user?.name?.split(' ')[0] || 'learner'}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          hitSlop={10}
          style={{
            width: 38,
            height: 38,
            borderRadius: radius,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15 }}>🔔</Text>
        </Pressable>
      </View>

      {/* XP / streak strip */}
      <Card
        style={{
          backgroundColor: isDark ? colors.surfaceAlt : colors.primary,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isDark ? colors.accentSoft : 'rgba(242,239,233,0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame size={20} color={isDark ? colors.accent : colors.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: isDark ? colors.text : colors.onAccent,
                fontWeight: '900',
                fontSize: 15,
              }}
            >
              {gamification?.currentStreak ?? 0} day streak
            </Text>
            <Text
              style={{
                color: isDark ? colors.sub : 'rgba(242,239,233,0.7)',
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Level {gamification?.level ?? 1} ·{' '}
              {gamification?.xp ?? 0} XP · best {gamification?.longestStreak ?? 0} days
            </Text>
          </View>
          <Trophy size={18} color={isDark ? colors.accent : colors.onAccent} />
        </View>
        <View style={{ marginTop: spacing.md }}>
          <ProgressBar
            value={gamification?.progress ?? 0}
            color={isDark ? colors.accent : colors.onAccent}
            height={6}
          />
          <Text
            style={{
              color: isDark ? colors.muted : 'rgba(242,239,233,0.65)',
              fontSize: 10,
              marginTop: 4,
            }}
          >
            {gamification?.xpIntoLevel ?? 0} / {gamification?.xpForNextLevel ?? 100}{' '}
            XP to next level
          </Text>
        </View>
      </Card>

      {/* Stats */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginTop: spacing.md,
        }}
      >
        <StatTile
          label="Courses"
          value={courses.length}
          icon={BookOpen}
          tone={colors.info}
        />
        <StatTile
          label="Attempts"
          value={overall?.attempts ?? 0}
          icon={Target}
          tone={colors.warning}
        />
        <StatTile
          label="Accuracy"
          value={`${overall?.accuracy ?? 0}%`}
          hint={`${overall?.correct ?? 0} correct of ${overall?.questions ?? 0}`}
          icon={BarChart3}
          tone={colors.success}
        />
        <StatTile
          label="Level"
          value={gamification?.level ?? 1}
          hint={`${gamification?.xp ?? 0} total XP`}
          icon={Sparkles}
          tone={colors.accent}
        />
      </View>

      {/* Weekly activity */}
      <SectionHeader title="This week" />
      <Card>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 90,
            gap: 6,
          }}
        >
          {weeklyBars.map((day, i) => {
            const height = 8 + (day.count / maxBar) * 66;
            const active = day.count > 0;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <Text style={{ color: colors.muted, fontSize: 9 }}>
                  {day.count > 0 ? day.count : ''}
                </Text>
                <View
                  style={{
                    width: '70%',
                    height,
                    borderRadius: 4,
                    backgroundColor: active ? colors.success : colors.surfaceAlt,
                  }}
                />
                <Text
                  style={{
                    color: active ? colors.text : colors.muted,
                    fontSize: 10,
                    fontWeight: '800',
                  }}
                >
                  {day.label}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={{ color: colors.sub, fontSize: 11, marginTop: spacing.md }}>
          {weekly?.attempts?.length ?? 0} attempts in the last 8 days
        </Text>
      </Card>

      {/* Featured exam */}
      {featuredExam ? (
        <>
          <SectionHeader title="Featured mock exam" />
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <CalendarClock size={16} color={colors.accent} />
              <Badge
                label={(featuredExam.status || 'upcoming').toUpperCase()}
                tone={featuredExam.status === 'active' ? 'success' : 'warning'}
              />
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 17,
                fontWeight: '900',
                marginTop: spacing.sm,
              }}
            >
              {featuredExam.title}
            </Text>
            <Text style={{ color: colors.sub, fontSize: 11, marginTop: 4 }}>
              {featuredExam.totalQuestions ?? '—'} questions ·{' '}
              {featuredExam.duration ?? '—'} minutes ·{' '}
              {featuredExam.startDate ? formatDate(featuredExam.startDate) : 'Anytime'}
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <Button
                label="Open exam"
                onPress={() =>
                  featuredExamId &&
                  navigation.navigate('ExamPlayer', {
                    examId: featuredExamId,
                    scheduleId: featuredExam._id,
                    title: featuredExam.title,
                  })
                }
                variant="primary"
                small
              />
            </View>
          </Card>
        </>
      ) : null}

      {/* Continue learning */}
      <SectionHeader
        title="Continue learning"
        action={courses.length > 0 ? 'All courses' : undefined}
        onAction={() => navigation.navigate('Tabs', { screen: 'Courses' })}
      />
      {coursesLoading ? (
        <Loader label="Loading your courses…" />
      ) : courses.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No enrolled courses yet"
            message="Browse the course catalogue and enroll to start tracking progress."
            actionLabel="Browse courses"
            onAction={() => navigation.navigate('Tabs', { screen: 'Courses' })}
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {courses.slice(0, 4).map((course) => {
            const progress = Math.round(
              course.progress ??
                (course.totalLessons
                  ? ((course.completedLessons || 0) / course.totalLessons) * 100
                  : 0)
            );
            return (
              <Card
                key={course._id}
                onPress={() =>
                  navigation.navigate('CourseDetail', {
                    courseId: course._id,
                    title: course.title,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: '800',
                      fontSize: 14,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {course.title}
                  </Text>
                  <Text style={{ color: colors.sub, fontSize: 11, fontWeight: '800' }}>
                    {progress}%
                  </Text>
                </View>
                <Text
                  style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {course.chapter ||
                    course.category ||
                    course.instructor ||
                    'Course'}
                </Text>
                <View style={{ marginTop: spacing.sm }}>
                  <ProgressBar value={progress} />
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* Quick actions */}
      <SectionHeader title="Quick actions" />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            style={{
              width: '31%',
              minWidth: 96,
              backgroundColor: colors.surface,
              borderRadius: radius,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              paddingVertical: spacing.md,
              alignItems: 'center',
              gap: 6,
            }}
          >
            <action.icon size={18} color={colors.accent} />
            <Text
              style={{
                color: colors.text,
                fontSize: 10,
                fontWeight: '800',
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Leaderboard */}
      {leaderboard?.leaderboard?.length ? (
        <>
          <SectionHeader title="Top learners" />
          <Card>
            {leaderboard.leaderboard.map((entry, index) => (
              <View
                key={entry._id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: 7,
                  borderBottomWidth: index === leaderboard.leaderboard.length - 1 ? 0 : 1,
                  borderBottomColor: colors.borderSoft,
                }}
              >
                <Text
                  style={{
                    color: index === 0 ? colors.warning : colors.muted,
                    fontWeight: '900',
                    fontSize: 12,
                    width: 18,
                  }}
                >
                  {entry.rank}
                </Text>
                <Text style={{ color: colors.text, fontSize: 13, flex: 1 }} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={{ color: colors.sub, fontSize: 11, fontWeight: '700' }}>
                  {entry.xp} XP
                </Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
