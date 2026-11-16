import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Send,
} from 'lucide-react-native';
import {
  useAppSelector,
  useBatchSaveAnswersMutation,
  useCompleteAttemptMutation,
  useDeleteTempExamSubmissionMutation,
  useGetExamVersionsByExamQuery,
  useGetExamsQuery,
  useGetQuestionsByExamQuery,
  useGetScheduleExamQuestionsQuery,
  useGetScheduleExamsByExamQuery,
  useGetTempExamSubmissionQuery,
  useGetUserPerformanceQuery,
  useRecordMistakesMutation,
  useSaveAnswerMutation,
  useSaveTempExamSubmissionMutation,
  useStartAttemptMutation,
  flattenQuestionDocs,
  buildResult,
  formatTime,
  type SharedQuestionItem as QuestionItem,
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
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ExamPlayer'>;

export default function ExamPlayerScreen({ navigation, route }: Props) {
  const { examId, scheduleId, versionId, title } = route.params;
  const { colors, isDark, radius } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const { data: exams } = useGetExamsQuery();
  const { data: versions } = useGetExamVersionsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: schedules } = useGetScheduleExamsByExamQuery(examId, {
    skip: !examId,
  });
  const { data: scheduleQuestions, isLoading: scheduleLoading } =
    useGetScheduleExamQuestionsQuery(scheduleId || '', { skip: !scheduleId });
  const { data: standardQuestions, isLoading: standardLoading } =
    useGetQuestionsByExamQuery(
      { examId, versionId: versionId || undefined },
      { skip: !examId || Boolean(scheduleId) }
    );

  const { data: userPerformance } = useGetUserPerformanceQuery(
    { userId, type: 'mockExam' },
    { skip: !userId }
  );

  const [startAttempt] = useStartAttemptMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [batchSaveAnswers] = useBatchSaveAnswersMutation();
  const [completeAttempt] = useCompleteAttemptMutation();
  const [saveTemp] = useSaveTempExamSubmissionMutation();
  const [deleteTemp] = useDeleteTempExamSubmissionMutation();
  const [recordMistakes] = useRecordMistakesMutation();

  const { data: tempSubmission } = useGetTempExamSubmissionQuery(
    {
      userId,
      examId,
      versionId: versionId || undefined,
      scheduleExamId: scheduleId || undefined,
    },
    { skip: !userId || !examId }
  );

  const currentExam: any = exams?.find((e: any) => e._id === examId);
  const currentVersion: any = versions?.find((v: any) => v._id === versionId);
  const schedule: any =
    schedules?.find((s: any) => s._id === scheduleId) ??
    (schedules?.length === 1 ? schedules[0] : undefined);

  const durationSeconds = (schedule?.duration ?? 120) * 60;

  const questionDocs = useMemo(() => {
    const raw: any = scheduleId ? scheduleQuestions : standardQuestions;
    if (!raw) return [];
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.questions)
          ? raw.questions
          : [];

    if (
      list.length > 0 &&
      (list[0]?.question_text || list[0]?.questionText)
    ) {
      return [{ data: list }];
    }
    return list;
  }, [scheduleId, scheduleQuestions, standardQuestions]);

  const performance =
    (userPerformance as any)?.mockExam ??
    (userPerformance as any)?.questionPreatise;

  const questions: QuestionItem[] = useMemo(
    () => flattenQuestionDocs(questionDocs, performance),
    [questionDocs, performance]
  );

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  const attemptIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const questionStartRef = useRef<Record<number, number>>({});
  const startTimeRef = useRef(Date.now());

  const loading = scheduleId ? scheduleLoading : standardLoading;

  // ── Restore in-progress answers ─────────────────────────────
  useEffect(() => {
    if (restored || !tempSubmission) return;
    setRestored(true);
    if (tempSubmission.attemptId && !attemptIdRef.current) {
      attemptIdRef.current = tempSubmission.attemptId;
    }
    const saved = tempSubmission.selectedAnswers;
    if (saved && Object.keys(saved).length > 0) {
      const parsed: Record<number, number> = {};
      Object.entries(saved).forEach(([key, value]) => {
        const qIndex = Number(key);
        if (!Number.isNaN(qIndex)) parsed[qIndex] = Number(value);
      });
      setAnswers(parsed);
    }
  }, [tempSubmission, restored]);

  // ── Timer bootstrap ────────────────────────────────────────
  useEffect(() => {
    if (timeLeft !== null || loading) return;
    const persisted = tempSubmission?.timeLeft;
    setTimeLeft(
      typeof persisted === 'number' && persisted > 0
        ? persisted
        : durationSeconds
    );
  }, [timeLeft, loading, tempSubmission, durationSeconds]);

  useEffect(() => {
    if (submittedRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Start the server-side attempt ──────────────────────────
  useEffect(() => {
    if (startedRef.current) return;
    if (!userId || !examId || questions.length === 0) return;
    startedRef.current = true;
    startTimeRef.current = Date.now();

    (async () => {
      try {
        const attempt = await startAttempt({
          userId,
          examId,
          examVersionId: versionId || undefined,
          scheduleExamId: scheduleId || undefined,
          type: 'practice',
          source: 'mock_exam',
          totalQuestions: questions.length,
        }).unwrap();
        attemptIdRef.current = attempt._id;
      } catch (err: any) {
        if (err?.status === 409) {
          Alert.alert(
            'Exam already completed',
            'You have already completed this exam. Open the result from your attempt history.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          setError(
            'Progress could not be saved to the server. Your result will be scored locally.'
          );
        }
      }
    })();
  }, [userId, examId, versionId, scheduleId, questions.length, startAttempt, navigation]);

  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || submitting) return;

      const unanswered = questions.length - Object.keys(answers).length;
      if (!auto && unanswered > 0) {
        Alert.alert(
          'Submit exam?',
          `You have ${unanswered} unanswered ${
            unanswered === 1 ? 'question' : 'questions'
          }. Submit anyway?`,
          [
            { text: 'Keep working', style: 'cancel' },
            { text: 'Submit', style: 'destructive', onPress: () => submit(true) },
          ]
        );
        return;
      }

      submittedRef.current = true;
      setSubmitting(true);

      const timeTaken = Math.max(1, durationSeconds - (timeLeft ?? durationSeconds));
      const result = buildResult({
        allQuestions: questions,
        selectedAnswers: answers,
        examName: currentExam?.name || 'Mock exam',
        versionName: currentVersion?.examVersion || '',
        title: schedule?.title || title || currentExam?.name || 'Mock exam',
        timeTaken,
        durationSeconds,
      });

      try {
        const attemptId = attemptIdRef.current;

        if (attemptId) {
          await batchSaveAnswers({
            attemptId,
            answers: questions.map((q, idx) => ({
              questionNumber: q.questionNumber || idx + 1,
              selectedOption:
                answers[idx] !== undefined
                  ? (q.optionKeys?.[answers[idx]] ?? q.options[answers[idx]] ?? '')
                  : null,
              timeTaken: questionStartRef.current[idx]
                ? Math.max(
                    1,
                    Math.round((Date.now() - questionStartRef.current[idx]) / 1000)
                  )
                : 1,
            })),
          })
            .unwrap()
            .catch(() => undefined);

          await completeAttempt({ attemptId }).unwrap().catch(() => undefined);
        }

        const mistakes = questions
          .map((q, idx) => {
            const selected = answers[idx];
            if (selected === undefined || !q.id) return null;
            if (selected === q.correctAnswer) return null;
            return {
              questionId: String(q.id),
              questionText: q.question || '',
              options: Object.fromEntries(
                (q.optionKeys ?? []).map((key, optionIdx) => [
                  key,
                  q.options[optionIdx] ?? '',
                ])
              ),
              correctAnswer: q.optionKeys?.[q.correctAnswer ?? -1] ?? null,
              lastWrongAnswer: q.optionKeys?.[selected] ?? null,
              exam: examId,
              examName: currentExam?.name || '',
            };
          })
          .filter(Boolean);

        if (mistakes.length > 0) {
          recordMistakes({ questions: mistakes as any }).catch(() => undefined);
        }

        if (userId && examId) {
          deleteTemp({
            userId,
            examId,
            versionId: versionId || undefined,
            scheduleExamId: scheduleId || undefined,
          })
            .unwrap()
            .catch(() => undefined);
        }
      } catch {
        // Local score is authoritative for the result screen.
      }

      setSubmitting(false);
      navigation.replace('Result', { result });
    },
    [
      questions,
      answers,
      submitting,
      durationSeconds,
      timeLeft,
      currentExam,
      currentVersion,
      schedule,
      title,
      examId,
      versionId,
      scheduleId,
      userId,
      batchSaveAnswers,
      completeAttempt,
      recordMistakes,
      deleteTemp,
      navigation,
    ]
  );

  // ── Auto-submit on timeout ─────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0) submit(true);
  }, [timeLeft, questions.length, submit]);

  // ── Confirm before leaving ─────────────────────────────────
  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (submittedRef.current) return;
      event.preventDefault();
      Alert.alert(
        'Leave the exam?',
        'Your answers are saved, but the attempt will be submitted with what you have answered so far.',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Submit & leave',
            style: 'destructive',
            onPress: () => submit(true),
          },
        ]
      );
    });
  }, [navigation, submit]);

  const selectOption = (optionIndex: number) => {
    const item = questions[index];
    if (!item || submittedRef.current) return;

    if (!questionStartRef.current[index]) {
      questionStartRef.current[index] = Date.now();
    }

    const next = { ...answers, [index]: optionIndex };
    setAnswers(next);

    const optionKey =
      item.optionKeys?.[optionIndex] ?? item.options[optionIndex] ?? '';
    const attemptId = attemptIdRef.current;

    if (attemptId) {
      saveAnswer({
        attemptId,
        questionNumber: item.questionNumber || index + 1,
        selectedOption: optionKey,
        timeTaken: Math.max(
          1,
          Math.round((Date.now() - questionStartRef.current[index]) / 1000)
        ),
      }).catch(() => undefined);
    }

    if (userId && examId) {
      saveTemp({
        userId,
        examId,
        examVersionId: versionId || undefined,
        scheduleExamId: scheduleId || undefined,
        attemptId: attemptId || undefined,
        selectedAnswers: next,
        timeLeft: timeLeft ?? undefined,
      }).catch(() => undefined);
    }
  };

  if (loading) {
    return (
      <Screen>
        <AppBar title={title || 'Exam'} onBack={navigation.goBack} />
        <Loader label="Preparing your paper…" />
      </Screen>
    );
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <AppBar title={title || 'Exam'} onBack={navigation.goBack} />
        <Card>
          <EmptyState
            title="No questions available"
            message="This paper has no published questions yet. Please try another exam or version."
            actionLabel="Back to exams"
            onAction={navigation.goBack}
          />
        </Card>
      </Screen>
    );
  }

  const item = questions[index];
  const answeredCount = Object.keys(answers).length;
  const selected = answers[index];

  return (
    <Screen scroll={false}>
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <AppBar
          title={schedule?.title || currentExam?.name || title || 'Mock exam'}
          subtitle={`${answeredCount} of ${questions.length} answered`}
          onBack={navigation.goBack}
          right={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor:
                  (timeLeft ?? 0) < 300 ? colors.dangerSoft : colors.surfaceAlt,
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: 8,
              }}
            >
              <Clock3
                size={13}
                color={(timeLeft ?? 0) < 300 ? colors.danger : colors.text}
              />
              <Text
                style={{
                  color: (timeLeft ?? 0) < 300 ? colors.danger : colors.text,
                  fontSize: 12,
                  fontWeight: '900',
                }}
              >
                {formatTime(timeLeft ?? durationSeconds)}
              </Text>
            </View>
          }
        />

        <ProgressBar
          value={(answeredCount / questions.length) * 100}
          height={6}
        />

        {error ? (
          <View style={{ marginTop: spacing.sm }}>
            <ErrorState message={error} />
          </View>
        ) : null}

        {/* Question navigator */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingVertical: spacing.sm }}
        >
          {questions.map((q, i) => {
            const isAnswered = answers[i] !== undefined;
            const isCurrent = i === index;
            return (
              <Pressable
                key={`${q.questionNumber}-${i}`}
                onPress={() => setIndex(i)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isCurrent ? 2 : 1,
                  borderColor: isCurrent
                    ? colors.accent
                    : isAnswered
                      ? colors.primary
                      : colors.borderSoft,
                  backgroundColor: isAnswered
                    ? colors.primary
                    : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: isAnswered ? colors.onAccent : colors.sub,
                    fontSize: 10,
                    fontWeight: '800',
                  }}
                >
                  {i + 1}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: spacing.md,
              flexWrap: 'wrap',
            }}
          >
            <Badge label={`Q${index + 1}`} tone="info" />
            {item.questionNumber ? (
              <Badge label={`Paper #${item.questionNumber}`} tone="neutral" />
            ) : null}
            {item.stats ? (
              <Badge
                label={`${item.stats.successRate}% success`}
                tone={item.stats.successRate >= 60 ? 'success' : 'warning'}
              />
            ) : null}
          </View>

          {item.scenarioText ? (
            <Text
              style={{
                color: colors.sub,
                fontSize: 12,
                fontStyle: 'italic',
                lineHeight: 19,
                marginBottom: spacing.sm,
              }}
            >
              {item.scenarioText}
            </Text>
          ) : null}

          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              fontWeight: '700',
              lineHeight: 24,
              marginBottom: spacing.lg,
            }}
          >
            {item.question}
          </Text>

          <View style={{ gap: spacing.sm }}>
            {item.options.map((option, optionIndex) => {
              const active = selected === optionIndex;
              return (
                <Pressable
                  key={`${option}-${optionIndex}`}
                  onPress={() => selectOption(optionIndex)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    padding: spacing.md,
                    borderRadius: radius,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? colors.accent : colors.borderSoft,
                    backgroundColor: active ? colors.accentSoft : colors.surfaceAlt,
                  }}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: active ? colors.accent : colors.surface,
                      borderWidth: 1,
                      borderColor: active ? colors.accent : colors.borderSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: active ? colors.onAccent : colors.sub,
                        fontSize: 11,
                        fontWeight: '900',
                      }}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 13,
                      lineHeight: 20,
                      flex: 1,
                    }}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.md,
          }}
        >
          <View style={{ flex: 1 }}>
            <Button
              label="Previous"
              variant="secondary"
              small
              icon={ChevronLeft}
              disabled={index === 0}
              onPress={() => setIndex(Math.max(0, index - 1))}
            />
          </View>
          {index < questions.length - 1 ? (
            <View style={{ flex: 1 }}>
              <Button
                label="Next"
                small
                icon={ChevronRight}
                onPress={() => setIndex(index + 1)}
              />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Button
                label="Submit"
                small
                icon={Send}
                loading={submitting}
                onPress={() => submit(false)}
              />
            </View>
          )}
        </View>

        <View style={{ marginTop: spacing.sm }}>
          <Button
            label="Submit exam"
            variant={index < questions.length - 1 ? 'ghost' : 'secondary'}
            small
            icon={Flag}
            loading={submitting}
            onPress={() => submit(false)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
