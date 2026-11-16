import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart3, Library } from 'lucide-react-native';
import {
  useGetAnalyzedQuestionsQuery,
  useGetExamsQuery,
  useGetMeQuery,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Card,
  EmptyState,
  Loader,
  ProgressBar,
  Screen,
  SectionHeader,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionPatterns'>;

interface PatternDoc {
  subjects?: Record<string, number>;
  topics?: Record<string, number>;
  categorized_questions?: { topic?: string; subject?: string }[];
}

export default function QuestionPatternsScreen({ navigation }: Props) {
  const { colors, radius } = useAppTheme();
  const { data: me } = useGetMeQuery();
  const { data: examsRaw } = useGetExamsQuery();
  const [examId, setExamId] = useState<string | null>(null);

  const exams: any[] = useMemo(() => {
    const raw: any = examsRaw;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  }, [examsRaw]);

  const selectedIds: string[] = useMemo(() => {
    const raw = (me as any)?.selectedExams;
    return Array.isArray(raw) ? raw.map((e: any) => String(e?._id || e)) : [];
  }, [me]);

  const myExams = exams.filter((e) => selectedIds.includes(String(e._id)));
  const activeExamId = examId || myExams[0]?._id;

  const { data, isLoading, refetch } = useGetAnalyzedQuestionsQuery(
    activeExamId ? { examId: activeExamId } : undefined,
    { skip: !activeExamId }
  );

  const analysis = useMemo(() => {
    const docs: PatternDoc[] = Array.isArray(data)
      ? (data as PatternDoc[])
      : data
        ? ([data] as PatternDoc[])
        : [];

    const subjects: Record<string, number> = {};
    const topics: Record<string, number> = {};

    docs.forEach((doc) => {
      Object.entries(doc?.subjects || {}).forEach(([key, value]) => {
        subjects[key] = (subjects[key] || 0) + (Number(value) || 0);
      });
      Object.entries(doc?.topics || {}).forEach(([key, value]) => {
        topics[key] = (topics[key] || 0) + (Number(value) || 0);
      });
      (doc?.categorized_questions || []).forEach((question) => {
        if (question?.topic) {
          topics[question.topic] = (topics[question.topic] || 0) + 1;
        }
      });
    });

    const subjectList = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
    const topicList = Object.entries(topics).sort((a, b) => b[1] - a[1]);
    const total = subjectList.reduce((sum, [, value]) => sum + value, 0);

    return {
      total,
      subjects: subjectList.slice(0, 10),
      topics: topicList.slice(0, 12),
    };
  }, [data]);

  const maxSubject = Math.max(1, ...analysis.subjects.map(([, v]) => v));
  const maxTopic = Math.max(1, ...analysis.topics.map(([, v]) => v));
  const activeExam = exams.find((e) => e._id === activeExamId);

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Question Patterns"
        subtitle="See which subjects and topics repeat most"
        onBack={navigation.goBack}
      />

      {myExams.length === 0 ? (
        <Card>
          <EmptyState
            icon={Library}
            title="No exams selected"
            message="Select exams in Settings to analyse their question patterns."
            actionLabel="Open Settings"
            onAction={() => navigation.navigate('Settings')}
          />
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {myExams.map((exam) => {
              const active = exam._id === activeExamId;
              return (
                <Pressable
                  key={exam._id}
                  onPress={() => setExamId(exam._id)}
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

          {isLoading ? (
            <View style={{ marginTop: spacing.lg }}>
              <Loader label="Analysing question papers…" />
            </View>
          ) : analysis.subjects.length === 0 && analysis.topics.length === 0 ? (
            <View style={{ marginTop: spacing.md }}>
              <Card>
                <EmptyState
                  icon={BarChart3}
                  title="No analysis available"
                  message="Question pattern analysis has not been generated for this exam yet."
                />
              </Card>
            </View>
          ) : (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  gap: spacing.sm,
                  marginTop: spacing.md,
                }}
              >
                <Card style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>
                    {analysis.total}
                  </Text>
                  <Text style={{ color: colors.sub, fontSize: 10 }}>
                    analysed questions
                  </Text>
                </Card>
                <Card style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>
                    {analysis.topics.length}
                  </Text>
                  <Text style={{ color: colors.sub, fontSize: 10 }}>
                    recurring topics
                  </Text>
                </Card>
              </View>

              <SectionHeader title="Subjects by frequency" />
              <Card>
                {analysis.subjects.map(([subject, count], index) => (
                  <View
                    key={subject}
                    style={{
                      marginBottom:
                        index === analysis.subjects.length - 1 ? 0 : spacing.md,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          fontWeight: '700',
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {subject}
                      </Text>
                      <Badge label={`${count}`} tone="info" />
                    </View>
                    <ProgressBar value={(count / maxSubject) * 100} height={6} />
                  </View>
                ))}
              </Card>

              {analysis.topics.length > 0 ? (
                <>
                  <SectionHeader title="Most repeated topics" />
                  <View style={{ gap: spacing.sm }}>
                    {analysis.topics.map(([topic, count], index) => (
                      <Card key={`${topic}-${index}`} padded={false}>
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
                              color: colors.muted,
                              fontSize: 11,
                              fontWeight: '900',
                              width: 20,
                            }}
                          >
                            {index + 1}
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 12,
                              flex: 1,
                              lineHeight: 18,
                            }}
                          >
                            {topic}
                          </Text>
                          <Badge
                            label={`${count}x`}
                            tone={count >= maxTopic * 0.6 ? 'success' : 'neutral'}
                          />
                        </View>
                        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
                          <ProgressBar value={(count / maxTopic) * 100} height={4} />
                        </View>
                      </Card>
                    ))}
                  </View>
                </>
              ) : null}

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 10,
                  marginTop: spacing.md,
                  textAlign: 'center',
                }}
              >
                Based on {activeExam?.name || 'the selected exam'} question papers
              </Text>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
