import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart3, Brain, Flame, Target, TrendingUp } from 'lucide-react-native';
import {
  useAppSelector,
  useGetMyGamificationQuery,
  useGetOrGenerateAiPerformanceMutation,
  useGetQuizOverviewQuery,
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
  ErrorState,
  Loader,
  ProgressBar,
  Screen,
  SectionHeader,
  StatTile,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Performance'>;

export default function PerformanceScreen({ navigation }: Props) {
  const { colors, radius } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const { data: overview, isLoading, refetch } = useGetQuizOverviewQuery(
    { userId },
    { skip: !userId }
  );
  const { data: gamification } = useGetMyGamificationQuery();
  const { data: attempts } = useGetUserAttemptsQuery(
    { userId, limit: 10 },
    { skip: !userId }
  );
  const [generateAi, { isLoading: aiLoading }] =
    useGetOrGenerateAiPerformanceMutation();

  const [report, setReport] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const overall = overview?.overall;
  const subjects = overview?.bySubject ?? [];
  const exams = overview?.byExam ?? [];

  const loadAiReport = async () => {
    if (!userId) return;
    setAiError(null);
    try {
      const res = await generateAi({ userId }).unwrap();
      if (res.empty || !res.ai_report) {
        setAiError('Not enough attempts yet to generate an AI report.');
        return;
      }
      setReport(res);
    } catch {
      setAiError('The AI report service is unavailable right now.');
    }
  };

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Performance"
        subtitle="Understand where your marks are going"
        onBack={navigation.goBack}
      />

      {isLoading ? (
        <Loader label="Calculating your performance…" />
      ) : !overall || overall.attempts === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No attempts yet"
            message="Complete a mock exam or practice paper to unlock accuracy, subject breakdowns and AI insights."
            actionLabel="Take a mock exam"
            onAction={() => navigation.navigate('Tabs', { screen: 'Exams' })}
          />
        </Card>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
            }}
          >
            <StatTile
              label="Attempts"
              value={overall.attempts}
              icon={Target}
              tone={colors.info}
            />
            <StatTile
              label="Accuracy"
              value={`${overall.accuracy}%`}
              icon={TrendingUp}
              tone={colors.success}
            />
            <StatTile
              label="Correct"
              value={overall.correct}
              hint={`${overall.incorrect} incorrect`}
              tone={colors.success}
            />
            <StatTile
              label="Streak"
              value={`${gamification?.currentStreak ?? 0}d`}
              hint={`Level ${gamification?.level ?? 1}`}
              icon={Flame}
              tone={colors.warning}
            />
          </View>

          <SectionHeader title="Subject accuracy" />
          <Card>
            {subjects.length === 0 ? (
              <Text style={{ color: colors.sub, fontSize: 12 }}>
                Attempt more questions to see a subject breakdown.
              </Text>
            ) : (
              subjects.map((subject, index) => (
                <View
                  key={subject.subject}
                  style={{
                    marginBottom:
                      index === subjects.length - 1 ? 0 : spacing.md,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                  >
                    <Text
                      style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}
                      numberOfLines={1}
                    >
                      {subject.subject}
                    </Text>
                    <Text
                      style={{
                        color:
                          subject.accuracy >= 60 ? colors.success : colors.danger,
                        fontSize: 11,
                        fontWeight: '900',
                      }}
                    >
                      {subject.accuracy}%
                    </Text>
                  </View>
                  <ProgressBar
                    value={subject.accuracy}
                    color={
                      subject.accuracy >= 60 ? colors.success : colors.danger
                    }
                    height={6}
                  />
                  <Text style={{ color: colors.muted, fontSize: 9, marginTop: 3 }}>
                    {subject.correct} correct of {subject.attempted}
                    {subject.isWeak ? ' · weak area' : ''}
                  </Text>
                </View>
              ))
            )}
          </Card>

          {exams.length > 0 ? (
            <>
              <SectionHeader title="By exam" />
              <Card>
                {exams.map((exam, index) => (
                  <View
                    key={exam.examId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                      paddingVertical: 8,
                      borderBottomWidth: index === exams.length - 1 ? 0 : 1,
                      borderBottomColor: colors.borderSoft,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          fontWeight: '700',
                        }}
                        numberOfLines={1}
                      >
                        {exam.examName}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 9, marginTop: 2 }}>
                        {exam.attempts} attempts · {exam.questions} questions
                      </Text>
                    </View>
                    <Badge
                      label={`${exam.accuracy}%`}
                      tone={exam.accuracy >= 60 ? 'success' : 'danger'}
                    />
                  </View>
                ))}
              </Card>
            </>
          ) : null}
        </>
      )}

      <SectionHeader title="AI insight" />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Brain size={16} color={colors.accent} />
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>
            Personalised analysis
          </Text>
        </View>
        <Text style={{ color: colors.sub, fontSize: 11, lineHeight: 17, marginTop: 4 }}>
          Generate a detailed report with weak areas, mistake explanations and a
          study plan built from your attempts.
        </Text>

        {aiError ? (
          <View style={{ marginTop: spacing.md }}>
            <ErrorState message={aiError} />
          </View>
        ) : null}

        {!report ? (
          <View style={{ marginTop: spacing.md }}>
            <Button
              label="Generate AI report"
              small
              icon={Brain}
              loading={aiLoading}
              disabled={!userId}
              onPress={loadAiReport}
            />
          </View>
        ) : (
          <View style={{ marginTop: spacing.md }}>
            {report.ai_report?.score_analysis ? (
              <View
                style={{
                  backgroundColor: colors.accentSoft,
                  borderRadius: radius,
                  padding: spacing.md,
                }}
              >
                <Text
                  style={{ color: colors.accent, fontWeight: '900', fontSize: 12 }}
                >
                  {report.ai_report.score_analysis.verdict}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 12,
                    lineHeight: 18,
                    marginTop: 4,
                  }}
                >
                  {report.ai_report.score_analysis.message}
                </Text>
              </View>
            ) : null}

            {report.ai_report?.weak_areas?.length ? (
              <View style={{ marginTop: spacing.md }}>
                <Text
                  style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}
                >
                  Weak areas
                </Text>
                {report.ai_report.weak_areas.map((area: any) => (
                  <View
                    key={area.topic}
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor: colors.danger,
                      paddingLeft: spacing.sm,
                      marginTop: spacing.sm,
                    }}
                  >
                    <Text
                      style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}
                    >
                      {area.topic} · {area.accuracy}%
                    </Text>
                    <Text
                      style={{
                        color: colors.sub,
                        fontSize: 11,
                        lineHeight: 17,
                        marginTop: 2,
                      }}
                    >
                      {area.recommendation}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {report.ai_report?.study_plan?.length ? (
              <View style={{ marginTop: spacing.md }}>
                <Text
                  style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}
                >
                  Study plan
                </Text>
                {report.ai_report.study_plan.slice(0, 5).map((item: any, i: number) => (
                  <View
                    key={`${item.day}-${i}`}
                    style={{
                      flexDirection: 'row',
                      gap: spacing.sm,
                      marginTop: spacing.sm,
                    }}
                  >
                    <Badge label={item.day} tone="info" />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          fontWeight: '700',
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text style={{ color: colors.sub, fontSize: 10, marginTop: 2 }}>
                        {item.focus_subject} · {item.duration_minutes} min
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={{ marginTop: spacing.md }}>
              <Button
                label="Refresh report"
                variant="secondary"
                small
                loading={aiLoading}
                onPress={loadAiReport}
              />
            </View>
          </View>
        )}
      </Card>

      <SectionHeader title="Recent attempts" />
      {attempts && attempts.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          {attempts.slice(0, 6).map((attempt: any) => (
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
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: '900',
                    width: 42,
                  }}
                >
                  {Math.round(attempt.percentage || 0)}%
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}
                    numberOfLines={1}
                  >
                    {attempt.exam?.name || attempt.type || 'Attempt'}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 9, marginTop: 2 }}>
                    {attempt.correctCount ?? 0}/{attempt.totalQuestions ?? 0} ·{' '}
                    {attempt.createdAt ? formatDate(attempt.createdAt) : ''}
                  </Text>
                </View>
                <Badge
                  label={attempt.isCompleted ? 'Completed' : 'In progress'}
                  tone={attempt.isCompleted ? 'success' : 'warning'}
                />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card>
          <Text style={{ color: colors.sub, fontSize: 12 }}>
            No recent attempts to show.
          </Text>
        </Card>
      )}
    </Screen>
  );
}
