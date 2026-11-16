import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Circle, Clock, PlayCircle } from 'lucide-react-native';
import {
  useAppSelector,
  useEnrollCourseMutation,
  useGetCourseByIdQuery,
  useGetCourseLessonsWithProgressQuery,
  useGetEnrolledCourseQuery,
  formatDuration,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Button,
  Card,
  EmptyState,
  Loader,
  ProgressBar,
  Screen,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;

export default function CourseDetailScreen({ navigation, route }: Props) {
  const { courseId, title } = route.params;
  const { colors } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const { data: courseData, isLoading } = useGetCourseByIdQuery(courseId);
  const { data: enrolled } = useGetEnrolledCourseQuery(userId, {
    skip: !userId,
  });
  const { data: lessonsData, isLoading: lessonsLoading, refetch } =
    useGetCourseLessonsWithProgressQuery(
      { courseId, userId: userId || undefined },
      { skip: !courseId }
    );
  const [enroll, { isLoading: enrolling }] = useEnrollCourseMutation();

  const course: any = (courseData as any)?.course ?? courseData ?? {};
  const enrolledCourses: any[] = Array.isArray(enrolled) ? enrolled : [];
  const enrolledCourse = enrolledCourses.find(
    (c) => String(c._id || c.id) === String(courseId)
  );
  const isEnrolled = Boolean(enrolledCourse);

  const lessons: any[] =
    (lessonsData as any)?.lessons ??
    course.lessons ??
    (Array.isArray(lessonsData) ? lessonsData : []);

  const completed = lessons.filter((l) => l.isCompleted).length;
  const progress = lessons.length
    ? Math.round((completed / lessons.length) * 100)
    : Math.round(enrolledCourse?.progress ?? 0);

  const handleEnroll = async () => {
    if (!userId) return;
    await enroll({ courseId, userId }).catch(() => undefined);
  };

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title={course.title || title || 'Course'}
        subtitle={course.instructor || course.category}
        onBack={navigation.goBack}
      />

      <Card style={{ marginBottom: spacing.md }}>
        <Text
          style={{ color: colors.text, fontSize: 15, fontWeight: '900' }}
          numberOfLines={3}
        >
          {course.title || title}
        </Text>
        <Text
          style={{
            color: colors.sub,
            fontSize: 12,
            lineHeight: 19,
            marginTop: spacing.sm,
          }}
        >
          {course.description ||
            'Open the lesson list below to continue this course.'}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            marginTop: spacing.md,
            flexWrap: 'wrap',
          }}
        >
          <Badge label={`${lessons.length} lessons`} tone="info" />
          {course.category ? (
            <Badge label={String(course.category)} tone="neutral" />
          ) : null}
          {isEnrolled ? <Badge label="Enrolled" tone="success" /> : null}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 5,
            }}
          >
            <Text style={{ color: colors.sub, fontSize: 11 }}>
              {completed} of {lessons.length} completed
            </Text>
            <Text style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}>
              {progress}%
            </Text>
          </View>
          <ProgressBar value={progress} />
        </View>

        {!isEnrolled ? (
          <View style={{ marginTop: spacing.md }}>
            <Button
              label="Enroll in this course"
              onPress={handleEnroll}
              loading={enrolling}
            />
          </View>
        ) : null}
      </Card>

      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: '900',
          marginBottom: spacing.md,
        }}
      >
        Lessons
      </Text>

      {lessonsLoading ? (
        <Loader label="Loading lessons…" />
      ) : lessons.length === 0 ? (
        <Card>
          <EmptyState
            icon={PlayCircle}
            title="No lessons available"
            message="Lesson content for this course has not been published yet."
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {lessons.map((lesson: any, index: number) => {
            const id = String(lesson._id || lesson.id || index);
            return (
              <Card
                key={id}
                onPress={() =>
                  navigation.navigate('Lesson', {
                    courseId,
                    courseTitle: course.title || title,
                    lessonId: id,
                  })
                }
                padded={false}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    padding: spacing.md,
                  }}
                >
                  {lesson.isCompleted ? (
                    <CheckCircle2 size={20} color={colors.success} />
                  ) : (
                    <Circle size={20} color={colors.muted} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 13,
                        fontWeight: '700',
                      }}
                      numberOfLines={2}
                    >
                      {index + 1}. {lesson.title || 'Untitled lesson'}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 3,
                      }}
                    >
                      <Clock size={11} color={colors.muted} />
                      <Text style={{ color: colors.muted, fontSize: 10 }}>
                        {formatDuration(
                          lesson.duration ??
                            (lesson.durationSeconds
                              ? Math.round(lesson.durationSeconds / 60)
                              : undefined)
                        )}
                      </Text>
                    </View>
                  </View>
                  <PlayCircle size={18} color={colors.accent} />
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
