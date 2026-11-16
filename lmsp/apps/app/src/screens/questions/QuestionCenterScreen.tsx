import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, ListChecks, Search } from 'lucide-react-native';
import {
  useGetExamsQuery,
  useGetMeQuery,
  useGetQuestionsByExamQuery,
  useGetSubjectsByExamQuery,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Card,
  EmptyState,
  Loader,
  Screen,
  SectionHeader,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function QuestionCenterScreen() {
  const navigation = useNavigation<Nav>();
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
    if (!Array.isArray(raw)) return [];
    return raw.map((e: any) => String(e?._id || e));
  }, [me]);

  const myExams = exams.filter((e) => selectedIds.includes(String(e._id)));
  const activeExamId = examId || myExams[0]?._id;

  const { data: subjects, isLoading: subjectsLoading } =
    useGetSubjectsByExamQuery(activeExamId || '', { skip: !activeExamId });
  const { data: questions } = useGetQuestionsByExamQuery(
    { examId: activeExamId || '' },
    { skip: !activeExamId }
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    const docs: any[] = Array.isArray(questions) ? questions : [];
    docs.forEach((doc: any) => {
      const list = Array.isArray(doc?.data) ? doc.data : [];
      list.forEach((q: any) => {
        const name =
          q?.subject?.name ||
          q?.subjectName ||
          (typeof q?.subject === 'string' ? q.subject : null);
        if (name) map[name] = (map[name] || 0) + 1;
      });
    });
    return map;
  }, [questions]);

  const activeExam = exams.find((e) => e._id === activeExamId);

  return (
    <Screen>
      <AppBar
        title="Question Center"
        subtitle="Browse the question bank exam by exam"
        onBack={navigation.goBack}
        right={
          <Pressable onPress={() => navigation.navigate('Search')} hitSlop={8}>
            <Search size={18} color={colors.sub} />
          </Pressable>
        }
      />

      {myExams.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListChecks}
            title="Select your exams first"
            message="Choose the exams you are preparing for in Settings to browse their questions."
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
            EXAMS
          </Text>
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

          <SectionHeader title="Subjects" />
          {subjectsLoading ? (
            <Loader label="Loading subjects…" />
          ) : !subjects || subjects.length === 0 ? (
            <Card>
              <EmptyState
                title="No subjects found"
                message="Subject data has not been added for this exam yet."
              />
            </Card>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <Card
                onPress={() =>
                  activeExamId &&
                  navigation.navigate('QuestionList', {
                    examId: activeExamId,
                    examName: activeExam?.name,
                  })
                }
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Badge label="All" tone="accent" />
                  <Text
                    style={{ color: colors.text, fontWeight: '800', fontSize: 13, flex: 1 }}
                  >
                    All subjects — mixed practice
                  </Text>
                  <ChevronRight size={16} color={colors.muted} />
                </View>
              </Card>

              {subjects.map((subject: any) => (
                <Card
                  key={subject._id}
                  onPress={() =>
                    activeExamId &&
                    navigation.navigate('QuestionType', {
                      examId: activeExamId,
                      examName: activeExam?.name,
                      subjectId: subject._id,
                      subjectName: subject.name,
                    })
                  }
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontWeight: '800',
                          fontSize: 13,
                        }}
                      >
                        {subject.name}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
                        {subject.code ? `${subject.code} · ` : ''}
                        {counts[subject.name]
                          ? `${counts[subject.name]} questions available`
                          : 'Open to view questions'}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={colors.muted} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
