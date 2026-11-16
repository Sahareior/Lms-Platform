import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Clock3, RotateCcw, XCircle } from 'lucide-react-native';
import {
  useGetAttemptByIdQuery,
  type SharedQuizResultData,
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
  StatTile,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

function ScoreRing({
  percentage,
  correct,
  total,
  color,
  track,
  textColor,
  subColor,
}: {
  percentage: number;
  correct: number;
  total: number;
  color: string;
  track: string;
  textColor: string;
  subColor: string;
}) {
  const size = 148;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (circumference * clamped) / 100;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ color: textColor, fontSize: 34, fontWeight: '900' }}>
        {percentage}%
      </Text>
      <Text style={{ color: subColor, fontSize: 11, fontWeight: '700' }}>
        {correct} / {total} correct
      </Text>
    </View>
  );
}

function verdictFor(percentage: number) {
  if (percentage >= 80) return { label: 'Excellent', tone: 'success' as const };
  if (percentage >= 60) return { label: 'Good', tone: 'info' as const };
  if (percentage >= 40)
    return { label: 'Needs improvement', tone: 'warning' as const };
  return { label: 'Critical', tone: 'danger' as const };
}

export default function ResultScreen({ navigation, route }: Props) {
  const { colors, radius } = useAppTheme();
  const { result: passedResult, attemptId } = route.params;

  const { data: attempt, isLoading } = useGetAttemptByIdQuery(attemptId || '', {
    skip: !attemptId,
  });

  const result: SharedQuizResultData | null = useMemo(() => {
    if (passedResult) return passedResult;
    if (!attempt) return null;

    return {
      examName: (attempt as any).exam?.name || 'Mock exam',
      versionName: (attempt as any).examVersion?.examVersion || '',
      title: (attempt as any).exam?.name || 'Mock exam',
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      unansweredCount: attempt.unansweredCount,
      totalQuestions: attempt.totalQuestions,
      percentage: Math.round(attempt.percentage || 0),
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      durationSeconds: 0,
      questions: (attempt.questions || []).map((q) => {
        const entries = Object.entries(q.options || {}).filter(([, v]) => v);
        return {
          question: q.questionText,
          options: entries.map(([, v]) => v),
          selectedIndex: entries.findIndex(([key]) => key === q.selectedOption),
          correctIndex: entries.findIndex(([key]) => key === q.correctAnswer),
          isCorrect: !!q.isCorrect,
        };
      }),
    };
  }, [passedResult, attempt]);

  if (isLoading && !result) {
    return (
      <Screen>
        <AppBar title="Result" onBack={navigation.goBack} />
        <Loader label="Loading your result…" />
      </Screen>
    );
  }

  if (!result) {
    return (
      <Screen>
        <AppBar title="Result" onBack={navigation.goBack} />
        <Card>
          <EmptyState
            title="Result unavailable"
            message="We could not load this attempt. It may have been removed."
            actionLabel="Back to exams"
            onAction={() =>
              navigation.navigate('Tabs', { screen: 'Exams' })
            }
          />
        </Card>
      </Screen>
    );
  }

  const verdict = verdictFor(result.percentage);
  const review = result.questions || [];

  return (
    <Screen>
      <AppBar
        title="Exam result"
        subtitle={result.title || result.examName}
        onBack={navigation.goBack}
        right={
          <Badge label={verdict.label.toUpperCase()} tone={verdict.tone} />
        }
      />

      <Card
        style={{
          alignItems: 'center',
          paddingVertical: spacing.xl,
        }}
      >
        <ScoreRing
          percentage={result.percentage}
          correct={result.correctCount}
          total={result.totalQuestions}
          color={
            verdict.tone === 'success'
              ? colors.success
              : verdict.tone === 'danger'
                ? colors.danger
                : verdict.tone === 'warning'
                  ? colors.warning
                  : colors.info
          }
          track={colors.borderSoft}
          textColor={colors.text}
          subColor={colors.sub}
        />

        <Text
          style={{
            color: colors.sub,
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 19,
            marginTop: spacing.lg,
            paddingHorizontal: spacing.md,
          }}
        >
          {verdict.tone === 'success'
            ? 'Outstanding. Keep this momentum and review the few questions you missed.'
            : verdict.tone === 'danger'
              ? 'Focus on the fundamentals of your weak subjects, then retake this paper.'
              : 'Solid effort. Review the mistakes below and note the topics to revise.'}
        </Text>
      </Card>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginTop: spacing.md,
        }}
      >
        <StatTile
          label="Correct"
          value={result.correctCount}
          icon={CheckCircle2}
          tone={colors.success}
        />
        <StatTile
          label="Incorrect"
          value={result.incorrectCount}
          icon={XCircle}
          tone={colors.danger}
        />
        <StatTile
          label="Unanswered"
          value={result.unansweredCount}
          tone={colors.warning}
        />
        <StatTile
          label="Time taken"
          value={`${Math.max(1, Math.round(result.timeTaken / 60))}m`}
          icon={Clock3}
          tone={colors.info}
        />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={result.percentage} height={10} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button
            label="Back to exams"
            variant="secondary"
            small
            onPress={() => navigation.navigate('Tabs', { screen: 'Exams' })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Review notebook"
            small
            icon={RotateCcw}
            onPress={() => navigation.navigate('Notebook')}
          />
        </View>
      </View>

      {review.length > 0 ? (
        <>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '900',
              marginTop: spacing.xl,
              marginBottom: spacing.md,
            }}
          >
            Answer review
          </Text>

          <View style={{ gap: spacing.md }}>
            {review.map((q, qi) => {
              const answered = q.selectedIndex !== undefined && q.selectedIndex >= 0;
              return (
                <Card key={qi}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: spacing.sm,
                    }}
                  >
                    <Badge label={`Q${qi + 1}`} tone="info" />
                    <Badge
                      label={
                        q.isCorrect
                          ? 'Correct'
                          : answered
                            ? 'Incorrect'
                            : 'Unanswered'
                      }
                      tone={q.isCorrect ? 'success' : answered ? 'danger' : 'warning'}
                    />
                  </View>

                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 13,
                      lineHeight: 21,
                      fontWeight: '600',
                    }}
                  >
                    {q.question}
                  </Text>

                  <View style={{ gap: 5, marginTop: spacing.md }}>
                    {q.options.map((option, oi) => {
                      const isCorrect = oi === q.correctIndex;
                      const isSelected = oi === q.selectedIndex;
                      return (
                        <View
                          key={oi}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.sm,
                            paddingVertical: 8,
                            paddingHorizontal: spacing.sm,
                            borderRadius: radius,
                            borderWidth: 1,
                            borderColor: isCorrect
                              ? colors.success
                              : isSelected
                                ? colors.danger
                                : colors.borderSoft,
                            backgroundColor: isCorrect
                              ? colors.successSoft
                              : isSelected
                                ? colors.dangerSoft
                                : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              color: isCorrect
                                ? colors.success
                                : isSelected
                                  ? colors.danger
                                  : colors.muted,
                              fontSize: 11,
                              fontWeight: '900',
                              width: 16,
                            }}
                          >
                            {String.fromCharCode(65 + oi)}
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 12,
                              lineHeight: 18,
                              flex: 1,
                            }}
                          >
                            {option}
                          </Text>
                          {isCorrect ? (
                            <CheckCircle2 size={14} color={colors.success} />
                          ) : isSelected ? (
                            <XCircle size={14} color={colors.danger} />
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                </Card>
              );
            })}
          </View>
        </>
      ) : null}

      <Pressable
        onPress={() => navigation.navigate('Tabs', { screen: 'Dashboard' })}
        style={{ alignItems: 'center', marginTop: spacing.xl }}
      >
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>
          Back to dashboard
        </Text>
      </Pressable>
    </Screen>
  );
}
