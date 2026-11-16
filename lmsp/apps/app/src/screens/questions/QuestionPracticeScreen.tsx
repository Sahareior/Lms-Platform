import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CheckCircle2,
  Flag,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react-native';
import {
  useAppSelector,
  useAwardPracticeXpMutation,
  useGetFavoriteQuestionIdsQuery,
  useGetQuestionsByExamQuery,
  useRecordMistakesMutation,
  useRecordQuestionStatsMutation,
  useToggleFavoriteMutation,
  flattenQuestionDocs,
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
  StatTile,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionPractice'>;

export default function QuestionPracticeScreen({ navigation, route }: Props) {
  const { examId, examName, subjectId, subjectName, questionType } = route.params;
  const { colors, radius } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const { data, isLoading, refetch } = useGetQuestionsByExamQuery({
    examId,
    subjectId,
    questionType: questionType as any,
  });

  const { data: favoriteIds } = useGetFavoriteQuestionIdsQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const [recordStat] = useRecordQuestionStatsMutation();
  const [recordMistakes] = useRecordMistakesMutation();
  const [awardXp, { isLoading: awarding }] = useAwardPracticeXpMutation();

  const questions = useMemo(() => {
    const docs: any[] = Array.isArray(data) ? data : [];
    if (docs.length > 0 && (docs[0]?.question_text || docs[0]?.questionText)) {
      return flattenQuestionDocs([{ data: docs }]);
    }
    return flattenQuestionDocs(docs);
  }, [data]);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xp, setXp] = useState<any>(null);
  const postedRef = useRef<Set<number>>(new Set());

  const favorites = new Set(favoriteIds?.questionIds ?? []);
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(
    (question, index) =>
      answers[index] !== undefined &&
      question.correctAnswer !== undefined &&
      answers[index] === question.correctAnswer
  ).length;

  const select = (index: number, optionIndex: number) => {
    if (submitted || answers[index] !== undefined) return;
    const question = questions[index];
    if (!question) return;

    const next = { ...answers, [index]: optionIndex };
    setAnswers(next);

    if (question.id) {
      recordStat({
        questionId: String(question.id),
        isCorrect: optionIndex === question.correctAnswer,
        selectedOption: question.optionKeys?.[optionIndex] ?? String(optionIndex),
      }).catch(() => undefined);
    }

    postedRef.current.add(index);
  };

  const onToggleFavorite = async (index: number) => {
    const question = questions[index];
    if (!question.id) return;
    await toggleFavorite({
      questionId: String(question.id),
      exam: examId,
      subject: subjectId,
      questionSnapshot: {
        questionText: question.question,
        options: Object.fromEntries(
          (question.optionKeys ?? []).map((key: string, i: number) => [
            key,
            question.options[i],
          ])
        ),
        correctAnswer: question.optionKeys?.[question.correctAnswer ?? -1] ?? null,
        examName,
        subjectName,
      } as any,
    }).catch(() => undefined);
  };

  const submit = async () => {
    if (submitted) return;

    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      Alert.alert(
        'Submit practice?',
        `${unanswered} ${unanswered === 1 ? 'question is' : 'questions are'} unanswered. Submit anyway?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'Submit', style: 'destructive', onPress: () => submitConfirmed() },
        ]
      );
      return;
    }

    submitConfirmed();
  };

  const submitConfirmed = async () => {
    setSubmitted(true);
    setError(null);

    const mistakes = questions
      .map((question, index) => {
        const selected = answers[index];
        if (selected === undefined || !question.id) return null;
        if (selected === question.correctAnswer) return null;
        return {
          questionId: String(question.id),
          questionText: question.question || '',
          options: Object.fromEntries(
            (question.optionKeys ?? []).map((key: string, i: number) => [
              key,
              question.options[i] ?? '',
            ])
          ),
          correctAnswer:
            question.optionKeys?.[question.correctAnswer ?? -1] ?? null,
          lastWrongAnswer: question.optionKeys?.[selected] ?? null,
          exam: examId,
          examName,
          subject: subjectId,
          subjectName,
        };
      })
      .filter(Boolean);

    if (mistakes.length > 0) {
      recordMistakes({ questions: mistakes as any }).catch(() => undefined);
    }

    if (!userId) return;

    try {
      const result = await awardXp({
        correctCount,
        totalCount: questions.length,
        source: 'question_center',
      }).unwrap();
      setXp(result);
    } catch {
      setError('Practice saved, but XP could not be awarded right now.');
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setXp(null);
    setError(null);
    postedRef.current = new Set();
  };

  const progress = questions.length
    ? (answeredCount / questions.length) * 100
    : 0;

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Practice"
        subtitle={`${subjectName || examName || 'Questions'} · self-graded`}
        onBack={navigation.goBack}
      />

      {isLoading ? (
        <Loader label="Loading questions…" />
      ) : questions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No questions available"
            message="No published questions match this source. Try another question type."
            actionLabel="Back"
            onAction={navigation.goBack}
          />
        </Card>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <StatTile
              label="Answered"
              value={`${answeredCount}/${questions.length}`}
              tone={colors.info}
            />
            <StatTile
              label={submitted ? 'Correct' : 'Selected'}
              value={submitted ? correctCount : answeredCount}
              tone={colors.success}
            />
          </View>

          <ProgressBar value={progress} height={7} />

          {error ? (
            <View style={{ marginTop: spacing.sm }}>
              <ErrorState message={error} />
            </View>
          ) : null}

          {xp ? (
            <Card
              style={{
                marginTop: spacing.md,
                backgroundColor: colors.successSoft,
                borderColor: colors.success,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <Sparkles size={18} color={colors.success} />
                <Text
                  style={{
                    color: colors.success,
                    fontWeight: '900',
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  +{xp.xpAwarded ?? 0} XP earned
                </Text>
                <Badge label={`Level ${xp.level ?? 1}`} tone="success" />
              </View>
              <Text style={{ color: colors.sub, fontSize: 11, marginTop: 4 }}>
                {correctCount} of {questions.length} correct · {xp.currentStreak ?? 0}{' '}
                day streak
              </Text>
              {xp.levelUp ? (
                <Text
                  style={{
                    color: colors.success,
                    fontSize: 11,
                    fontWeight: '800',
                    marginTop: 4,
                  }}
                >
                  Level up! You are now level {xp.level}.
                </Text>
              ) : null}
            </Card>
          ) : null}

          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {questions.map((question, index) => {
              const selected = answers[index];
              const revealed = submitted && selected !== undefined;
              const isCorrect =
                selected !== undefined && selected === question.correctAnswer;
              const isFavorite = question.id
                ? favorites.has(String(question.id))
                : false;

              return (
                <Card key={question.id || index}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: spacing.sm,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Badge label={`Q${index + 1}`} tone="info" />
                    {question.stats ? (
                      <Badge
                        label={`${question.stats.successRate}% success`}
                        tone={
                          question.stats.successRate >= 60 ? 'success' : 'warning'
                        }
                      />
                    ) : null}
                    {selected !== undefined ? (
                      <Badge
                        label={isCorrect ? 'Correct' : 'Incorrect'}
                        tone={isCorrect ? 'success' : 'danger'}
                      />
                    ) : null}
                    <Pressable
                      onPress={() => onToggleFavorite(index)}
                      hitSlop={8}
                      style={{ marginLeft: 'auto' }}
                    >
                      <Text
                        style={{
                          color: isFavorite ? colors.warning : colors.muted,
                          fontSize: 16,
                        }}
                      >
                        {isFavorite ? '★' : '☆'}
                      </Text>
                    </Pressable>
                  </View>

                  {question.scenarioText ? (
                    <Text
                      style={{
                        color: colors.sub,
                        fontSize: 11,
                        fontStyle: 'italic',
                        lineHeight: 18,
                        marginBottom: 6,
                      }}
                    >
                      {question.scenarioText}
                    </Text>
                  ) : null}

                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 13,
                      lineHeight: 21,
                      fontWeight: '600',
                    }}
                  >
                    {question.question}
                  </Text>

                  <View style={{ gap: 5, marginTop: spacing.md }}>
                    {question.options.map((option, optionIndex) => {
                      const isPicked = selected === optionIndex;
                      const isAnswer = optionIndex === question.correctAnswer;
                      const showAnswer = submitted || selected !== undefined;

                      return (
                        <Pressable
                          key={`${option}-${optionIndex}`}
                          onPress={() => select(index, optionIndex)}
                          disabled={selected !== undefined || submitted}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.sm,
                            padding: spacing.sm,
                            borderRadius: radius,
                            borderWidth: isPicked || (showAnswer && isAnswer) ? 2 : 1,
                            borderColor: showAnswer
                              ? isAnswer
                                ? colors.success
                                : isPicked
                                  ? colors.danger
                                  : colors.borderSoft
                              : colors.borderSoft,
                            backgroundColor: showAnswer
                              ? isAnswer
                                ? colors.successSoft
                                : isPicked
                                  ? colors.dangerSoft
                                  : colors.surfaceAlt
                              : colors.surfaceAlt,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.muted,
                              fontSize: 10,
                              fontWeight: '900',
                              width: 14,
                            }}
                          >
                            {String.fromCharCode(65 + optionIndex)}
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
                          {showAnswer && isAnswer ? (
                            <CheckCircle2 size={14} color={colors.success} />
                          ) : showAnswer && isPicked ? (
                            <XCircle size={14} color={colors.danger} />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>

                  {revealed && question.stats ? (
                    <Text style={{ color: colors.muted, fontSize: 10, marginTop: 6 }}>
                      Asked {question.stats.attempts} times ·{' '}
                      {question.stats.successes} correct
                    </Text>
                  ) : null}
                </Card>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <View style={{ flex: 1 }}>
              <Button
                label={submitted ? 'Practice again' : 'Submit practice'}
                icon={submitted ? Target : Flag}
                loading={awarding}
                onPress={submitted ? reset : submit}
              />
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}
