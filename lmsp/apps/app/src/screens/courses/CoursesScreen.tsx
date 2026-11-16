import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookOpen, CheckCircle2, GraduationCap } from 'lucide-react-native';
import {
  useAppSelector,
  useEnrollCourseMutation,
  useGetCoursesQuery,
  useGetEnrolledCourseQuery,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loader,
  ProgressBar,
  Screen,
  Segmented,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CoursesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const [tab, setTab] = useState<'mine' | 'catalogue'>('mine');
  const [error, setError] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const {
    data: enrolled,
    isLoading: enrolledLoading,
    refetch: refetchEnrolled,
  } = useGetEnrolledCourseQuery(userId, { skip: !userId });
  const { data: catalogueRaw, isLoading: catalogueLoading, refetch: refetchCatalogue } =
    useGetCoursesQuery();
  const [enroll] = useEnrollCourseMutation();

  const enrolledCourses: any[] = Array.isArray(enrolled) ? enrolled : [];
  const catalogue: any[] = useMemo(() => {
    const raw: any = catalogueRaw;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.courses)) return raw.courses;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [catalogueRaw]);

  const enrolledIds = new Set(
    enrolledCourses.map((c) => String(c._id || c.id))
  );

  const handleEnroll = async (courseId: string) => {
    setError(null);
    setEnrollingId(courseId);
    try {
      await enroll({ courseId, userId }).unwrap();
      await Promise.all([refetchEnrolled(), refetchCatalogue()]);
      setTab('mine');
    } catch (err: any) {
      setError(
        err?.data?.message || 'Could not enroll in this course. Try again.'
      );
    } finally {
      setEnrollingId(null);
    }
  };

  const loading = tab === 'mine' ? enrolledLoading : catalogueLoading;
  const list = tab === 'mine' ? enrolledCourses : catalogue;

  return (
    <Screen
      refreshing={loading}
      onRefresh={() =>
        tab === 'mine' ? refetchEnrolled() : refetchCatalogue()
      }
    >
      <AppBar
        title="My Courses"
        subtitle="Structured lessons that track your progress automatically"
      />

      <Segmented
        options={[
          { value: 'mine', label: `Enrolled (${enrolledCourses.length})` },
          { value: 'catalogue', label: `Catalogue (${catalogue.length})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {error ? <View style={{ marginTop: spacing.md }}><ErrorState message={error} /></View> : null}

      <View style={{ marginTop: spacing.md, gap: spacing.md }}>
        {loading ? (
          <Loader label="Loading courses…" />
        ) : list.length === 0 ? (
          <Card>
            <EmptyState
              icon={GraduationCap}
              title={tab === 'mine' ? 'No enrolled courses' : 'No courses yet'}
              message={
                tab === 'mine'
                  ? 'Open the catalogue and enroll in a course to start learning.'
                  : 'New courses will appear here once they are published.'
              }
              actionLabel={tab === 'mine' ? 'Open catalogue' : undefined}
              onAction={tab === 'mine' ? () => setTab('catalogue') : undefined}
            />
          </Card>
        ) : (
          list.map((course) => {
            const id = String(course._id || course.id);
            const isEnrolled = enrolledIds.has(id);
            const progress = Math.round(
              course.progress ??
                (course.totalLessons
                  ? ((course.completedLessons || 0) / course.totalLessons) * 100
                  : 0)
            );
            return (
              <Card key={id}>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      backgroundColor: colors.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookOpen size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}
                      numberOfLines={2}
                    >
                      {course.title}
                    </Text>
                    <Text
                      style={{ color: colors.sub, fontSize: 11, marginTop: 3 }}
                      numberOfLines={2}
                    >
                      {course.description ||
                        course.chapter ||
                        course.instructor ||
                        'Course content'}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 6,
                        marginTop: spacing.sm,
                        flexWrap: 'wrap',
                      }}
                    >
                      {course.category ? (
                        <Badge label={String(course.category)} tone="info" />
                      ) : null}
                      {isEnrolled ? (
                        <Badge label="Enrolled" tone="success" />
                      ) : null}
                      {course.totalLessons ? (
                        <Badge
                          label={`${course.totalLessons} lessons`}
                          tone="neutral"
                        />
                      ) : null}
                    </View>
                  </View>
                </View>

                {isEnrolled ? (
                  <View style={{ marginTop: spacing.md }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ color: colors.sub, fontSize: 11 }}>
                        Progress
                      </Text>
                      <Text
                        style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}
                      >
                        {progress}%
                      </Text>
                    </View>
                    <ProgressBar value={progress} />
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <Button
                          label="Continue"
                          small
                          onPress={() =>
                            navigation.navigate('CourseDetail', {
                              courseId: id,
                              title: course.title,
                            })
                          }
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="View details"
                        variant="secondary"
                        small
                        onPress={() =>
                          navigation.navigate('CourseDetail', {
                            courseId: id,
                            title: course.title,
                          })
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Enroll"
                        small
                        loading={enrollingId === id}
                        onPress={() => handleEnroll(id)}
                      />
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </View>

      {enrolledCourses.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: spacing.lg,
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={13} color={colors.success} />
          <Text style={{ color: colors.muted, fontSize: 10 }}>
            Progress syncs with the web app
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}
