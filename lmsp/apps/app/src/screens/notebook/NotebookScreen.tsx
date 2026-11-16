import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronDown, ChevronUp, Star } from 'lucide-react-native';
import { useGetNotebookQuestionsQuery } from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Card,
  EmptyState,
  Loader,
  Screen,
  Segmented,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notebook'>;
type Tab = 'wrong' | 'right' | 'favorites';

export default function NotebookScreen({ navigation }: Props) {
  const { colors, radius } = useAppTheme();
  const [tab, setTab] = useState<Tab>('wrong');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetNotebookQuestionsQuery({
    limit: 200,
  });

  const items =
    tab === 'wrong'
      ? data?.wrong ?? []
      : tab === 'right'
        ? data?.right ?? []
        : data?.favorites ?? [];

  const stats = data?.stats;

  return (
    <Screen refreshing={isLoading} onRefresh={refetch}>
      <AppBar
        title="Notebook"
        subtitle="Your answered questions, mistakes and saved items"
        onBack={navigation.goBack}
      />

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <StatPill
          label="Wrong"
          value={stats?.wrongCount ?? 0}
          tone={colors.danger}
        />
        <StatPill
          label="Right"
          value={stats?.rightCount ?? 0}
          tone={colors.success}
        />
        <StatPill
          label="Saved"
          value={stats?.favoriteCount ?? 0}
          tone={colors.warning}
        />
      </View>

      <Segmented
        options={[
          { value: 'wrong', label: `Mistakes (${stats?.wrongCount ?? 0})` },
          { value: 'right', label: `Correct (${stats?.rightCount ?? 0})` },
          { value: 'favorites', label: `Saved (${stats?.favoriteCount ?? 0})` },
        ]}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setExpanded(null);
        }}
      />

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {isLoading ? (
          <Loader label="Loading your notebook…" />
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={Star}
              title={
                tab === 'wrong'
                  ? 'No mistakes recorded'
                  : tab === 'right'
                    ? 'No correct answers yet'
                    : 'Nothing saved yet'
              }
              message={
                tab === 'wrong'
                  ? 'Wrong answers from exams and practice sets are collected here automatically.'
                  : tab === 'right'
                    ? 'Answer questions in the question center or a mock exam to build this list.'
                    : 'Star a question in the question center to keep it here for later.'
              }
              actionLabel="Practise questions"
              onAction={() => navigation.navigate('QuestionCenter')}
            />
          </Card>
        ) : (
          items.map((item, index) => {
            const key = `${tab}-${item.questionId}-${index}`;
            const open = expanded === key;
            return (
              <Card key={key}>
                <Pressable
                  onPress={() => setExpanded(open ? null : key)}
                  style={{ flexDirection: 'row', gap: spacing.sm }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 4,
                        marginBottom: 6,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Badge
                        label={`Q${index + 1}`}
                        tone={tab === 'wrong' ? 'danger' : tab === 'right' ? 'success' : 'warning'}
                      />
                      {item.subjectName ? (
                        <Badge label={item.subjectName} tone="neutral" />
                      ) : null}
                      {item.examName ? (
                        <Badge label={item.examName} tone="info" />
                      ) : null}
                    </View>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 13,
                        lineHeight: 20,
                        fontWeight: '600',
                      }}
                    >
                      {item.questionText}
                    </Text>
                  </View>
                  {open ? (
                    <ChevronUp size={16} color={colors.muted} />
                  ) : (
                    <ChevronDown size={16} color={colors.muted} />
                  )}
                </Pressable>

                {open ? (
                  <View style={{ marginTop: spacing.md, gap: 6 }}>
                    {Object.entries(item.options || {}).map(([key_, text]) => {
                      const isCorrect = key_ === item.correctAnswer;
                      const isProvided = key_ === item.providedAnswer;
                      return (
                        <View
                          key={key_}
                          style={{
                            flexDirection: 'row',
                            gap: spacing.sm,
                            padding: spacing.sm,
                            borderRadius: radius,
                            borderWidth: 1,
                            borderColor: isCorrect
                              ? colors.success
                              : isProvided
                                ? colors.danger
                                : colors.borderSoft,
                            backgroundColor: isCorrect
                              ? colors.successSoft
                              : isProvided
                                ? colors.dangerSoft
                                : 'transparent',
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
                            {key_}
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 12,
                              lineHeight: 18,
                              flex: 1,
                            }}
                          >
                            {String(text)}
                          </Text>
                        </View>
                      );
                    })}

                    {item.explanation ? (
                      <View
                        style={{
                          backgroundColor: colors.surfaceAlt,
                          borderRadius: radius,
                          padding: spacing.md,
                          marginTop: spacing.xs,
                        }}
                      >
                        <Text
                          style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}
                        >
                          Explanation
                        </Text>
                        <Text
                          style={{
                            color: colors.sub,
                            fontSize: 11,
                            lineHeight: 18,
                            marginTop: 4,
                          }}
                        >
                          {item.explanation}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  const { colors, radius } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: spacing.md,
      }}
    >
      <Text style={{ color: tone, fontSize: 18, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: colors.sub, fontSize: 10, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}
