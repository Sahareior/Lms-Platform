import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookOpen, FileCheck, GraduationCap } from 'lucide-react-native';

import type { RootStackParamList } from '../../navigation/types';
import { AppBar, Badge, Card, Screen } from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionType'>;

const TYPES = [
  {
    value: 'board' as const,
    label: 'Board Questions',
    labelBn: 'বোর্ড প্রশ্ন',
    description:
      'Official board examination questions from all Bangladesh education boards.',
    icon: GraduationCap,
    badge: 'Official',
    tone: '#9B51E0',
  },
  {
    value: 'testpaper' as const,
    label: 'College Testpapers',
    labelBn: 'কলেজ টেস্ট পেপার',
    description:
      'Testpapers from top colleges across the country — great for final preparation.',
    icon: BookOpen,
    badge: 'College',
    tone: '#2F80ED',
  },
  {
    value: 'mockexam' as const,
    label: 'Mock Exams',
    labelBn: 'মক পরীক্ষা',
    description:
      'Practice under real exam conditions with curated mock question sets.',
    icon: FileCheck,
    badge: 'Practice',
    tone: '#00A97F',
  },
];

export default function QuestionTypeScreen({ navigation, route }: Props) {
  const { examId, examName, subjectId, subjectName } = route.params;
  const { colors, radius, isDark } = useAppTheme();

  return (
    <Screen>
      <AppBar
        title="Question Source"
        subtitle={`${subjectName || 'Subject'}${examName ? ` · ${examName}` : ''}`}
        onBack={navigation.goBack}
      />

      <Text
        style={{
          color: colors.sub,
          fontSize: 12,
          lineHeight: 19,
          marginBottom: spacing.lg,
        }}
      >
        Choose where the questions come from. You can pick another source at any
        time.
      </Text>

      <View style={{ gap: spacing.md }}>
        {TYPES.map((type) => (
          <Card
            key={type.value}
            onPress={() =>
              navigation.navigate('QuestionList', {
                examId,
                examName,
                subjectId,
                subjectName,
                questionType: type.value,
              })
            }
          >
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: radius,
                  backgroundColor: isDark ? `${type.tone}22` : `${type.tone}1a`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <type.icon size={22} color={type.tone} />
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 15, fontWeight: '900' }}
                  >
                    {type.label}
                  </Text>
                  <Badge label={type.badge} tone="info" />
                </View>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
                  {type.labelBn}
                </Text>
                <Text
                  style={{
                    color: colors.sub,
                    fontSize: 11,
                    lineHeight: 17,
                    marginTop: 4,
                  }}
                >
                  {type.description}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View
        style={{
          marginTop: spacing.xl,
          padding: spacing.md,
          borderRadius: radius,
          backgroundColor: colors.surfaceAlt,
        }}
      >
        <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16 }}>
          After choosing a source you can read the questions, open the paper view,
          or start a self-graded practice session that earns XP.
        </Text>
      </View>
    </Screen>
  );
}
