import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookOpen, FileText, Newspaper, Users } from 'lucide-react-native';

import type { RootStackParamList } from '../../navigation/types';
import { AppBar, Card, Screen } from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StudySection'>;

export default function StudySectionScreen({ navigation }: Props) {
  const { colors, radius } = useAppTheme();

  const sections = [
    {
      icon: BookOpen,
      title: 'Creative question reading',
      description:
        'Board and college creative questions with stimulus, parts and model answers — read or self-test.',
      tone: colors.accent,
      onPress: () => navigation.navigate('Reading'),
    },
    {
      icon: FileText,
      title: 'Study PDFs',
      description:
        'Academic and job-preparation notes, organised by category and ready to download.',
      tone: colors.info,
      onPress: () => navigation.navigate('PdfList'),
    },
    {
      icon: Newspaper,
      title: 'Blog & notes',
      description:
        'Short reads, exam tips and topic summaries written for quick revision.',
      tone: colors.success,
      onPress: () => navigation.navigate('BlogList'),
    },
    {
      icon: Users,
      title: 'Study groups',
      description:
        'Join official groups on Facebook, Telegram, WhatsApp and YouTube.',
      tone: colors.accent,
      onPress: () => navigation.navigate('StudyGroups'),
    },
  ];

  return (
    <Screen>
      <AppBar
        title="Study Section"
        subtitle="Everything you need between practice sessions"
        onBack={navigation.goBack}
      />

      <View style={{ gap: spacing.md }}>
        {sections.map((section) => (
          <Card key={section.title} onPress={section.onPress}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radius,
                  backgroundColor: `${section.tone}1a`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <section.icon size={22} color={section.tone} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: colors.text, fontSize: 15, fontWeight: '900' }}
                >
                  {section.title}
                </Text>
                <Text
                  style={{
                    color: colors.sub,
                    fontSize: 11,
                    lineHeight: 17,
                    marginTop: 4,
                  }}
                >
                  {section.description}
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
        <Text style={{ color: colors.sub, fontSize: 11, lineHeight: 18 }}>
          Looking for something specific? Use the search page to find exams,
          courses and lessons across the platform.
        </Text>
      </View>
    </Screen>
  );
}
