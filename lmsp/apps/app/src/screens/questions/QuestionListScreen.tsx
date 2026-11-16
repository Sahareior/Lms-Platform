import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  ListChecks,
  Target,
} from 'lucide-react-native';
import {
  useGetFavoriteQuestionIdsQuery,
  useGetQuestionsByExamQuery,
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
  Loader,
  Screen,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionList'>;

export default function QuestionListScreen({ navigation, route }: Props) {
  const { examId, subjectId, subjectName, examName, questionType } = route.params;
  const { colors, radius } = useAppTheme();

  const [visible, setVisible] = useState<Record<number, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, refetch } = useGetQuestionsByExamQuery({
    examId,
    subjectId,
    questionType: questionType as any,
  });
  const { data: favoriteIds } = useGetFavoriteQuestionIdsQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const questions = useMemo(() => {
    const docs: any[] = Array.isArray(data) ? data : [];
    if (docs.length > 0 && (docs[0]?.question_text || docs[0]?.questionText)) {
      return flattenQuestionDocs([{ data: docs }]);
    }
    return flattenQuestionDocs(docs);
  }, [data]);

  const favoriteSet = new Set(favoriteIds?.questionIds ?? []);

  const onToggleFavorite = async (question: any) => {
    if (!question.id) return;
    await toggleFavorite({
      questionId: String(question.id),
      exam: examId,
      subject: subjectId,
      questionSnapshot: {
        questionText: question.question,
        options: Object.fromEntries(
          (question.optionKeys ?? []).map((key: string, index: number) => [
            key,
            question.options[index],
          ])
        ),
        correctAnswer: question.optionKeys?.[question.correctAnswer ?? -1] ?? null,
        examName,
        subjectName,
      } as any,
    }).catch(() => undefined);
  };

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title={subjectName || examName || 'Questions'}
        subtitle={`${questions.length} questions${
          examName && subjectName ? ` · ${examName}` : ''
        }`}
        onBack={navigation.goBack}
        right={
          <Pressable onPress={() => setShowAll((v) => !v)} hitSlop={8}>
            {showAll ? (
              <EyeOff size={18} color={colors.sub} />
            ) : (
              <Eye size={18} color={colors.sub} />
            )}
          </Pressable>
        }
      />

      {isLoading ? (
        <Loader label="Loading questions…" />
      ) : questions.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListChecks}
            title="No questions found"
            message="No published questions match this exam and subject yet."
          />
        </Card>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Button
                label="Practice"
                small
                variant="accent"
                icon={Target}
                onPress={() =>
                  navigation.navigate('QuestionPractice', {
                    examId,
                    examName,
                    subjectId,
                    subjectName,
                    questionType,
                  })
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Paper view"
                small
                variant="secondary"
                icon={FileText}
                onPress={() =>
                  navigation.navigate('QuestionView', {
                    examId,
                    examName,
                    subjectId,
                    subjectName,
                    questionType,
                  })
                }
              />
            </View>
          </View>

          <View style={{ gap: spacing.md }}>
          {questions.map((question, index) => {
            const isOpen = showAll || visible[index];
            const isFavorite = question.id
              ? favoriteSet.has(String(question.id))
              : false;

            return (
              <Card key={`${question.id || index}`}>
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
                  {question.questionNumber ? (
                    <Badge label={`#${question.questionNumber}`} tone="neutral" />
                  ) : null}
                  {question.stats ? (
                    <Badge
                      label={`${question.stats.successRate}% success`}
                      tone={question.stats.successRate >= 60 ? 'success' : 'warning'}
                    />
                  ) : null}
                  <Pressable
                    onPress={() => onToggleFavorite(question)}
                    style={{ marginLeft: 'auto' }}
                    hitSlop={8}
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
                    const isCorrect = optionIndex === question.correctAnswer;
                    return (
                      <View
                        key={`${option}-${optionIndex}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.sm,
                          paddingVertical: 7,
                          paddingHorizontal: spacing.sm,
                          borderRadius: radius,
                          backgroundColor:
                            isOpen && isCorrect
                              ? colors.successSoft
                              : colors.surfaceAlt,
                          borderWidth: 1,
                          borderColor:
                            isOpen && isCorrect
                              ? colors.success
                              : colors.borderSoft,
                        }}
                      >
                        <Text
                          style={{
                            color: isOpen && isCorrect ? colors.success : colors.muted,
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
                        {isOpen && isCorrect ? (
                          <CheckCircle2 size={13} color={colors.success} />
                        ) : null}
                      </View>
                    );
                  })}
                </View>

                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    label={isOpen ? 'Hide answer' : 'Show answer'}
                    variant="ghost"
                    small
                    onPress={() =>
                      setVisible((prev) => ({ ...prev, [index]: !prev[index] }))
                    }
                  />
                </View>
              </Card>
            );
          })}
          </View>
        </>
      )}
    </Screen>
  );
}
