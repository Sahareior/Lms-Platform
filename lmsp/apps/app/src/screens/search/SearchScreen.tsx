import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookOpen, FileText, Search as SearchIcon } from 'lucide-react-native';
import { useSearchAllQuery } from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Card,
  EmptyState,
  Field,
  Loader,
  Screen,
  SectionHeader,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 400);
    return () => clearTimeout(timer);
  }, [text]);

  const { data, isFetching, isError } = useSearchAllQuery(query, {
    skip: query.length < 2,
  });

  const exams = data?.exams ?? [];
  const courses = data?.courses ?? [];
  const lessons = data?.lessons ?? [];
  const hasResults = exams.length + courses.length + lessons.length > 0;

  return (
    <Screen>
      <AppBar
        title="Search"
        subtitle="Exams, courses and lessons across Geneseon"
        onBack={navigation.goBack}
      />

      <Field
        value={text}
        onChangeText={setText}
        placeholder="Search exams, courses, lessons…"
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={() => setQuery(text.trim())}
        right={<SearchIcon size={17} color={colors.muted} />}
      />

      {query.length < 2 ? (
        <Card>
          <EmptyState
            icon={SearchIcon}
            title="Start typing"
            message="Enter at least two characters to search the whole platform."
          />
        </Card>
      ) : isFetching ? (
        <Loader label={`Searching for "${query}"…`} />
      ) : isError ? (
        <Card>
          <EmptyState
            icon={SearchIcon}
            title="Search failed"
            message="Check your connection and try again."
          />
        </Card>
      ) : !hasResults ? (
        <Card>
          <EmptyState
            icon={SearchIcon}
            title="No matches"
            message={`Nothing found for "${query}". Try a shorter or different keyword.`}
          />
        </Card>
      ) : (
        <>
          {exams.length > 0 ? (
            <>
              <SectionHeader title="Exams" />
              <View style={{ gap: spacing.sm }}>
                {exams.map((exam) => (
                  <Card
                    key={exam._id}
                    onPress={() =>
                      navigation.navigate('Tabs', { screen: 'Exams' })
                    }
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                    >
                      <Badge label="Exam" tone="info" />
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 13,
                          fontWeight: '800',
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {exam.name}
                      </Text>
                    </View>
                    {exam.description ? (
                      <Text
                        style={{ color: colors.sub, fontSize: 11, marginTop: 4 }}
                        numberOfLines={2}
                      >
                        {exam.description}
                      </Text>
                    ) : null}
                  </Card>
                ))}
              </View>
            </>
          ) : null}

          {courses.length > 0 ? (
            <>
              <SectionHeader title="Courses" />
              <View style={{ gap: spacing.sm }}>
                {courses.map((course) => (
                  <Card
                    key={course._id}
                    onPress={() =>
                      navigation.navigate('CourseDetail', {
                        courseId: course._id,
                        title: course.title,
                      })
                    }
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                    >
                      <BookOpen size={15} color={colors.accent} />
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 13,
                          fontWeight: '800',
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {course.title}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            </>
          ) : null}

          {lessons.length > 0 ? (
            <>
              <SectionHeader title="Lessons" />
              <View style={{ gap: spacing.sm }}>
                {lessons.map((lesson) => (
                  <Card
                    key={lesson._id}
                    onPress={() =>
                      lesson.course &&
                      navigation.navigate('CourseDetail', {
                        courseId: String(
                          typeof lesson.course === 'string'
                            ? lesson.course
                            : (lesson.course as any)._id
                        ),
                        title: lesson.title,
                      })
                    }
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                    >
                      <FileText size={15} color={colors.info} />
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 13,
                          fontWeight: '700',
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {lesson.title}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
