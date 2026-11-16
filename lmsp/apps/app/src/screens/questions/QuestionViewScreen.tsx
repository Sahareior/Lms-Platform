import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Eye, EyeOff, Sparkles } from 'lucide-react-native';
import {
  useAiQuestionExplainerMutation,
  useGetQuestionsByExamQuery,
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
  Screen,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionView'>;

export default function QuestionViewScreen({ navigation, route }: Props) {
  const { examId, examName, subjectId, subjectName, questionType } = route.params;
  const { colors, radius } = useAppTheme();

  const { data, isLoading, refetch } = useGetQuestionsByExamQuery({
    examId,
    subjectId,
    questionType: questionType as any,
  });

  const [explain, { isLoading: isExplaining }] = useAiQuestionExplainerMutation();
  const [showAnswers, setShowAnswers] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo(() => {
    const docs: any[] = Array.isArray(data) ? data : [];
    if (docs.length > 0 && (docs[0]?.question_text || docs[0]?.questionText)) {
      return flattenQuestionDocs([{ data: docs }]);
    }
    return flattenQuestionDocs(docs);
  }, [data]);

  const generateExplanation = async (index: number) => {
    const question = questions[index];
    if (!question) return;
    setError(null);
    setGenerating(index);

    try {
      const res: any = await explain({
        id: question.questionNumber ?? index + 1,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
      }).unwrap();

      setExplanations((prev) => ({
        ...prev,
        [index]:
          res?.explanation ||
          'No explanation was returned for this question.',
      }));
    } catch {
      setError('The AI explanation service is unavailable right now.');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Question paper"
        subtitle={`${subjectName || 'Subject'}${examName ? ` · ${examName}` : ''}`}
        onBack={navigation.goBack}
        right={
          <Pressable onPress={() => setShowAnswers((v) => !v)} hitSlop={8}>
            {showAnswers ? (
              <EyeOff size={19} color={colors.sub} />
            ) : (
              <Eye size={19} color={colors.sub} />
            )}
          </Pressable>
        }
      />

      {error ? <ErrorState message={error} /> : null}

      {isLoading ? (
        <Loader label="Opening the paper…" />
      ) : questions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Eye}
            title="No questions to display"
            message="No published questions match this source."
            actionLabel="Back"
            onAction={navigation.goBack}
          />
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <Badge label={`${questions.length} questions`} tone="info" />
            {questionType ? (
              <Badge label={String(questionType)} tone="neutral" />
            ) : null}
            <Badge
              label={showAnswers ? 'Answers shown' : 'Answers hidden'}
              tone={showAnswers ? 'warning' : 'success'}
            />
          </View>

          <View style={{ gap: spacing.md }}>
            {questions.map((question, index) => (
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
                  {question.questionNumber ? (
                    <Badge label={`#${question.questionNumber}`} tone="neutral" />
                  ) : null}
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

                <View style={{ gap: 5, marginTop: spacing.sm }}>
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === question.correctAnswer;
                    return (
                      <View
                        key={`${option}-${optionIndex}`}
                        style={{
                          flexDirection: 'row',
                          gap: spacing.sm,
                          paddingVertical: 7,
                          paddingHorizontal: spacing.sm,
                          borderRadius: radius,
                          borderWidth: 1,
                          borderColor:
                            showAnswers && isCorrect
                              ? colors.success
                              : colors.borderSoft,
                          backgroundColor:
                            showAnswers && isCorrect
                              ? colors.successSoft
                              : colors.surfaceAlt,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              showAnswers && isCorrect
                                ? colors.success
                                : colors.muted,
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
                      </View>
                    );
                  })}
                </View>

                {explanations[index] ? (
                  <View
                    style={{
                      marginTop: spacing.md,
                      backgroundColor: colors.accentSoft,
                      borderRadius: radius,
                      padding: spacing.md,
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                    >
                      <Sparkles size={13} color={colors.accent} />
                      <Text
                        style={{
                          color: colors.accent,
                          fontSize: 11,
                          fontWeight: '900',
                        }}
                      >
                        AI explanation
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 12,
                        lineHeight: 19,
                        marginTop: 4,
                      }}
                    >
                      {explanations[index]}
                    </Text>
                  </View>
                ) : (
                  <View style={{ marginTop: spacing.sm }}>
                    <Button
                      label={generating === index ? 'Explaining…' : 'Explain with AI'}
                      variant="ghost"
                      small
                      icon={Sparkles}
                      loading={isExplaining && generating === index}
                      onPress={() => generateExplanation(index)}
                    />
                  </View>
                )}
              </Card>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
