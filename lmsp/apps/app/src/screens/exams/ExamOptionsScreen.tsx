import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CalendarClock,
  ChevronRight,
  Clock3,
  FileCheck,
  History,
  PlayCircle,
  Trophy,
} from 'lucide-react-native';
import {
  useAppSelector,
  useGetExamVersionsByExamQuery,
  useGetExamsQuery,
  useGetMeQuery,
  useGetScheduleExamsByExamQuery,
  useGetUserAttemptsQuery,
  formatDate,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Button,
  Card,
  EmptyState,
  Loader,
  Screen,
  SectionHeader,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ExamOptionsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, radius } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const { data: me } = useGetMeQuery();
  const { data: examsRaw, isLoading: examsLoading } = useGetExamsQuery();
  const { data: attempts, isLoading: attemptsLoading } = useGetUserAttemptsQuery(
    { userId, source: 'mock_exam', limit: 30 },
    { skip: !userId }
  );

  const exams: any[] = useMemo(() => {
    const raw: any = examsRaw;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [examsRaw]);

  const selectedExamIds: string[] = useMemo(() => {
    const raw = (me as any)?.selectedExams;
    if (!Array.isArray(raw)) return [];
    return raw.map((e: any) => String(e?._id || e));
  }, [me]);

  const myExams = useMemo(
    () => exams.filter((e) => selectedExamIds.includes(String(e._id))),
    [exams, selectedExamIds]
  );

  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const examId = activeExamId || myExams[0]?._id;

  const { data: schedules, isLoading: schedulesLoading } =
    useGetScheduleExamsByExamQuery(examId || '', { skip: !examId });
  const { data: versions } = useGetExamVersionsByExamQuery(examId || '', {
    skip: !examId,
  });

  const activeExam = myExams.find((e) => e._id === examId);

  const examAttempts = (attempts || []).filter((a: any) => {
    const id =
      typeof a.exam === 'string' ? a.exam : a.exam?._id;
    return !examId || !id || id === examId;
  });

  if (examsLoading) {
    return (
      <Screen>
        <AppBar title="Mock Exams" />
        <Loader label="Loading your exams…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar
        title="Mock Exams"
        subtitle="Timed papers, instant results and mistake tracking"
        right={
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}>
            <CalendarClock size={20} color={colors.sub} />
          </Pressable>
        }
      />

      {myExams.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileCheck}
            title="No exams selected"
            message="Choose the exams you are preparing for in Settings, then come back to take a mock exam."
            actionLabel="Open Settings"
            onAction={() => navigation.navigate('Settings')}
          />
        </Card>
      ) : (
        <>
          <Text
            style={{
              color: colors.muted,
              fontSize: 10,
              letterSpacing: 1.5,
              fontWeight: '800',
              marginBottom: spacing.sm,
            }}
          >
            MY EXAMS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {myExams.map((exam) => {
              const active = exam._id === examId;
              return (
                <Pressable
                  key={exam._id}
                  onPress={() => setActiveExamId(exam._id)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: 8,
                    borderRadius: radius,
                    borderWidth: 1,
                    borderColor: active ? colors.border : colors.borderSoft,
                    backgroundColor: active ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: active ? colors.onAccent : colors.sub,
                      fontSize: 12,
                      fontWeight: '800',
                    }}
                  >
                    {exam.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SectionHeader title="Scheduled exams" />
          {schedulesLoading ? (
            <Loader label="Loading schedule…" />
          ) : !schedules || schedules.length === 0 ? (
            <Card>
              <EmptyState
                icon={CalendarClock}
                title="No scheduled exams"
                message="You can still practise with the full question bank for this exam."
              />
            </Card>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {schedules.map((schedule: any) => (
                <Card key={schedule._id}>
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
                      numberOfLines={2}
                    >
                      {schedule.title}
                    </Text>
                    <Badge
                      label={(schedule.status || 'upcoming').toUpperCase()}
                      tone={
                        schedule.status === 'active'
                          ? 'success'
                          : schedule.status === 'completed'
                            ? 'neutral'
                            : 'warning'
                      }
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: spacing.md,
                      marginTop: spacing.sm,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock3 size={11} color={colors.muted} />
                      <Text style={{ color: colors.sub, fontSize: 10 }}>
                        {schedule.duration ?? '—'} min
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <FileCheck size={11} color={colors.muted} />
                      <Text style={{ color: colors.sub, fontSize: 10 }}>
                        {schedule.totalQuestions ?? '—'} questions
                      </Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 10 }}>
                      {schedule.startDate ? formatDate(schedule.startDate) : ''}
                    </Text>
                  </View>
                  <View style={{ marginTop: spacing.md }}>
                    <Button
                      label={
                        schedule.status === 'completed'
                          ? 'Attempt again'
                          : 'Start exam'
                      }
                      small
                      icon={PlayCircle}
                      onPress={() =>
                        navigation.navigate('ExamPlayer', {
                          examId: String(
                            typeof schedule.exam === 'string'
                              ? schedule.exam
                              : schedule.exam?._id || examId
                          ),
                          scheduleId: schedule._id,
                          title: schedule.title,
                        })
                      }
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}

          <SectionHeader title="Practice" />
          <Card>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>
              {activeExam?.name || 'Full question bank'}
            </Text>
            <Text style={{ color: colors.sub, fontSize: 11, marginTop: 4 }}>
              Practise every available question for this exam with the same timer
              and scoring as a real mock.
            </Text>
            {versions && versions.length > 0 ? (
              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                {versions.map((version: any) => (
                  <Button
                    key={version._id}
                    label={`Practise ${version.examVersion || 'version'}`}
                    variant="secondary"
                    small
                    onPress={() =>
                      navigation.navigate('ExamPlayer', {
                        examId: examId!,
                        versionId: version._id,
                        title: `${activeExam?.name || 'Practice'} · ${version.examVersion || ''}`,
                      })
                    }
                  />
                ))}
              </View>
            ) : null}
            <View style={{ marginTop: spacing.sm }}>
              <Button
                label="Start practice paper"
                small
                onPress={() =>
                  examId &&
                  navigation.navigate('ExamPlayer', {
                    examId,
                    title: activeExam?.name,
                  })
                }
              />
            </View>
          </Card>

          <SectionHeader title="Recent attempts" />
          {attemptsLoading ? (
            <Loader />
          ) : examAttempts.length === 0 ? (
            <Card>
              <EmptyState
                icon={History}
                title="No attempts yet"
                message="Your completed mock exams will appear here with scores."
              />
            </Card>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {examAttempts.slice(0, 8).map((attempt: any) => (
                <Card
                  key={attempt._id}
                  onPress={() =>
                    navigation.navigate('Result', { attemptId: attempt._id })
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
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor:
                          attempt.percentage >= 60
                            ? colors.successSoft
                            : colors.dangerSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color:
                            attempt.percentage >= 60
                              ? colors.success
                              : colors.danger,
                          fontSize: 12,
                          fontWeight: '900',
                        }}
                      >
                        {Math.round(attempt.percentage || 0)}%
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}
                        numberOfLines={1}
                      >
                        {attempt.exam?.name || attempt.title || 'Mock exam'}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
                        {attempt.correctCount ?? 0} correct ·{' '}
                        {attempt.totalQuestions ?? 0} questions ·{' '}
                        {attempt.createdAt ? formatDate(attempt.createdAt) : ''}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={colors.muted} />
                  </View>
                </Card>
              ))}
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: spacing.lg,
            }}
          >
            <Trophy size={13} color={colors.accent} />
            <Text style={{ color: colors.muted, fontSize: 10 }}>
              Every completed attempt earns XP and updates your streak
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}
