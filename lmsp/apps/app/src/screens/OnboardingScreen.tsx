import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  useAppDispatch,
  useGetExamsQuery,
  useGetMeQuery,
  useSelectExamMutation,
  useAddUserInfoMutation,
  loginSuccess,
  type ExamCategory,
} from '@my-monorepo/store';
import { ArrowRight, BookOpen, Briefcase, Check } from 'lucide-react-native';

import { Button, Card, ErrorState, Field, Loader, Screen } from '../ui';
import { useAppTheme, spacing } from '../theme';

type Exam = {
  _id: string;
  name: string;
  category?: ExamCategory;
  description?: string;
};

const CATEGORIES: { value: ExamCategory; label: string; blurb: string }[] = [
  {
    value: 'academic',
    label: 'Academic',
    blurb: 'School, college and board exam preparation',
  },
  {
    value: 'job_preparation',
    label: 'Job Preparation',
    blurb: 'BCS, bank, primary and other government jobs',
  },
];

export default function OnboardingScreen() {
  const { colors, radius } = useAppTheme();
  const dispatch = useAppDispatch();
  const { data: me, refetch } = useGetMeQuery();
  const { data: examsRaw, isLoading: examsLoading } = useGetExamsQuery();
  const [selectExam, { isLoading: isSaving }] = useSelectExamMutation();
  const [addUserInfo, { isLoading: isSavingInfo }] = useAddUserInfoMutation();

  const exams: Exam[] = useMemo(() => {
    const raw: any = examsRaw;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.exams)) return raw.exams;
    return [];
  }, [examsRaw]);

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ExamCategory | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [studentClass, setStudentClass] = useState(
    (me as any)?.studentClass || ''
  );
  const [institute, setInstitute] = useState((me as any)?.institute || '');
  const [error, setError] = useState<string | null>(null);

  const visibleExams = useMemo(() => {
    if (!category) return exams;
    const filtered = exams.filter((e) => e.category === category);
    return filtered.length > 0 ? filtered : exams;
  }, [exams, category]);

  const toggleExam = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const finish = async () => {
    setError(null);
    if (selected.length === 0) {
      setError('Select at least one exam to personalise your dashboard.');
      return;
    }

    try {
      await selectExam({
        userId: (me as any)?._id,
        examId: selected,
      }).unwrap();

      if ((me as any)?._id && (studentClass || institute)) {
        await addUserInfo({
          id: (me as any)._id,
          data: {
            studentClass: studentClass || undefined,
            class: studentClass || undefined,
            institute: institute || undefined,
          },
        }).catch(() => undefined);
      }

      const refreshed = await refetch().unwrap();
      if (refreshed) dispatch(loginSuccess(refreshed));
    } catch (err: any) {
      setError(
        err?.data?.message ||
          'Could not save your selection. Please try again.'
      );
    }
  };

  return (
    <Screen>
      <Text
        style={{
          color: colors.muted,
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: '800',
        }}
      >
        STEP {step + 1} OF 3
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: 26,
          fontWeight: '900',
          marginTop: 6,
        }}
      >
        {step === 0
          ? 'What are you preparing for?'
          : step === 1
            ? 'Choose your exams'
            : 'A little about you'}
      </Text>
      <Text
        style={{
          color: colors.sub,
          fontSize: 13,
          lineHeight: 20,
          marginTop: 6,
          marginBottom: spacing.xl,
        }}
      >
        {step === 0
          ? 'We use this to load the right courses, question papers and mock exams. You can change it later in Settings.'
          : step === 1
            ? 'Pick every exam you are targeting. Your dashboard adapts to this list.'
            : 'Optional details help us label your profile. You can skip this.'}
      </Text>

      {error ? <ErrorState message={error} /> : null}

      {step === 0 ? (
        <View style={{ gap: spacing.md }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat.value;
            const Icon = cat.value === 'academic' ? BookOpen : Briefcase;
            return (
              <Card
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={{
                  borderColor: active ? colors.accent : colors.borderSoft,
                  borderWidth: active ? 2 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radius,
                      backgroundColor: active ? colors.accentSoft : colors.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color={active ? colors.accent : colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>
                      {cat.label}
                    </Text>
                    <Text style={{ color: colors.sub, fontSize: 11, marginTop: 2 }}>
                      {cat.blurb}
                    </Text>
                  </View>
                  {active ? <Check size={18} color={colors.accent} /> : null}
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}

      {step === 1 ? (
        examsLoading ? (
          <Loader label="Loading exams…" />
        ) : visibleExams.length === 0 ? (
          <Text style={{ color: colors.sub, fontSize: 13 }}>
            No exams are available yet. Please try again later.
          </Text>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {visibleExams.map((exam) => {
              const active = selected.includes(exam._id);
              return (
                <Pressable
                  key={exam._id}
                  onPress={() => toggleExam(exam._id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    padding: spacing.md,
                    borderRadius: radius,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? colors.accent : colors.borderSoft,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: active ? colors.accent : colors.borderSoft,
                      backgroundColor: active ? colors.accent : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active ? (
                      <Text style={{ color: colors.onAccent, fontWeight: '900', fontSize: 12 }}>
                        ✓
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
                      {exam.name}
                    </Text>
                    {exam.description ? (
                      <Text
                        style={{ color: colors.sub, fontSize: 11, marginTop: 2 }}
                        numberOfLines={2}
                      >
                        {exam.description}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )
      ) : null}

      {step === 2 ? (
        <View>
          <Field
            label="Class / level"
            value={studentClass}
            onChangeText={setStudentClass}
            placeholder="e.g. HSC 2nd year, Graduate"
          />
          <Field
            label="Institution"
            value={institute}
            onChangeText={setInstitute}
            placeholder="School, college or university"
          />
        </View>
      ) : null}

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <Button
          label={
            step === 2
              ? 'Start learning'
              : step === 0
                ? 'Continue'
                : `Continue (${selected.length} selected)`
          }
          icon={ArrowRight}
          loading={isSaving || isSavingInfo}
          disabled={step === 0 ? !category : step === 1 ? selected.length === 0 : false}
          onPress={() => {
            if (step < 2) setStep(step + 1);
            else finish();
          }}
        />
        {step > 0 ? (
          <Button label="Back" variant="ghost" onPress={() => setStep(step - 1)} />
        ) : null}
      </View>
    </Screen>
  );
}
