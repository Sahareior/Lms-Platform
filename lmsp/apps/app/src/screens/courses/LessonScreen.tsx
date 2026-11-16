import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Send,
  Sparkles,
} from 'lucide-react-native';
import {
  useAppSelector,
  useCompleteLessonMutation,
  useGetCourseLessonsWithProgressQuery,
  useGetLessonNoteQuery,
  useSaveLessonNoteMutation,
  useSendChatMessageMutation,
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
  Segmented,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;
type Tab = 'content' | 'notes' | 'ai';

interface ChatTurn {
  role: 'user' | 'ai';
  text: string;
}

export default function LessonScreen({ navigation, route }: Props) {
  const { courseId, courseTitle, lessonId } = route.params;
  const { colors, isDark, radius } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);
  const userId = user?._id || '';

  const { data, isLoading } = useGetCourseLessonsWithProgressQuery(
    { courseId, userId: userId || undefined },
    { skip: !courseId }
  );
  const lessons: any[] = useMemo(() => (data as any)?.lessons ?? [], [data]);

  const initialIndex = Math.max(
    0,
    lessons.findIndex((l) => String(l._id || l.id) === String(lessonId))
  );
  const [index, setIndex] = useState(initialIndex);
  const [tab, setTab] = useState<Tab>('content');

  useEffect(() => {
    if (!lessonId) return;
    const found = lessons.findIndex(
      (l) => String(l._id || l.id) === String(lessonId)
    );
    if (found >= 0) setIndex(found);
  }, [lessonId, lessons]);

  const lesson: any = lessons[index];
  const activeLessonId = lesson?._id || lesson?.id;

  const { data: noteData } = useGetLessonNoteQuery(
    { lessonId: activeLessonId || '', userId },
    { skip: !activeLessonId || !userId }
  );
  const [saveNote, { isLoading: isSavingNote }] = useSaveLessonNoteMutation();
  const [completeLesson, { isLoading: isCompleting }] =
    useCompleteLessonMutation();
  const [sendMessage, { isLoading: isAsking }] = useSendChatMessageMutation();

  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [question, setQuestion] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const chatRef = useRef<ScrollView>(null);

  useEffect(() => {
    setNote(noteData?.note?.content ?? '');
    setNoteSaved(false);
  }, [noteData?.note?.content, activeLessonId]);

  useEffect(() => {
    setChat([]);
    setQuestion('');
    setAiError(null);
    setTab('content');
  }, [activeLessonId]);

  if (isLoading) {
    return (
      <Screen>
        <AppBar title="Lesson" onBack={navigation.goBack} />
        <Loader label="Loading lesson…" />
      </Screen>
    );
  }

  if (!lesson) {
    return (
      <Screen>
        <AppBar
          title={courseTitle || 'Course'}
          onBack={navigation.goBack}
        />
        <Card>
          <EmptyState
            title="Lesson not found"
            message="This lesson may have been removed or the course has no lessons yet."
            actionLabel="Back to course"
            onAction={navigation.goBack}
          />
        </Card>
      </Screen>
    );
  }

  const handleSaveNote = async () => {
    if (!userId || !activeLessonId) return;
    try {
      await saveNote({
        lessonId: activeLessonId,
        userId,
        content: note,
      }).unwrap();
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch {
      // keep the text so nothing is lost
    }
  };

  const handleComplete = async () => {
    if (!userId || !activeLessonId) return;
    try {
      await completeLesson({ userId, courseId, lessonId: activeLessonId }).unwrap();
      if (index < lessons.length - 1) setIndex(index + 1);
      else navigation.goBack();
    } catch {
      // ignore – the offline patch already updates the list optimistically
    }
  };

  const askAi = async () => {
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;

    setAiError(null);
    setQuestion('');
    setChat((prev) => [...prev, { role: 'user', text: trimmed }]);

    try {
      const res = await sendMessage({
        question: `Lesson: ${lesson.title}\n\n${trimmed}`,
        mode: 'lesson',
        topic: lesson.title,
      }).unwrap();
      setChat((prev) => [
        ...prev,
        { role: 'ai', text: res?.answer || 'No answer returned.' },
      ]);
    } catch {
      setAiError('The AI tutor is unavailable right now. Please try again.');
    } finally {
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const videoUrl = lesson.videoUrl || lesson.video_url || lesson.url;
  const body =
    lesson.content ||
    lesson.description ||
    lesson.text ||
    lesson.summary ||
    '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={20}
    >
      <Screen padded={false}>
        <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
          <AppBar
            title={lesson.title || 'Lesson'}
            subtitle={`${courseTitle || 'Course'} · Lesson ${index + 1} of ${lessons.length}`}
            onBack={navigation.goBack}
            right={
              lesson.isCompleted ? (
                <CheckCircle2 size={20} color={colors.success} />
              ) : undefined
            }
          />

          <Segmented
            options={[
              { value: 'content', label: 'Content' },
              { value: 'notes', label: 'Notes' },
              { value: 'ai', label: 'Ask AI' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>

        <View style={{ padding: spacing.lg, paddingTop: spacing.sm }}>
          {tab === 'content' ? (
            <Card>
              <View
                style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}
              >
                <Badge
                  label={lesson.isCompleted ? 'Completed' : 'In progress'}
                  tone={lesson.isCompleted ? 'success' : 'warning'}
                />
                {lesson.duration ? (
                  <Badge label={`${lesson.duration} min`} tone="neutral" />
                ) : null}
              </View>

              {videoUrl ? (
                <Pressable
                  onPress={() => Linking.openURL(String(videoUrl))}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: spacing.md,
                  }}
                >
                  <ExternalLink size={14} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '800' }}>
                    Open lesson video
                  </Text>
                </Pressable>
              ) : null}

              <Text
                style={{
                  color: colors.text,
                  fontSize: 13,
                  lineHeight: 22,
                }}
              >
                {body || 'Lesson text has not been published for this lesson yet.'}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  gap: spacing.sm,
                  marginTop: spacing.lg,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Button
                    label="Previous"
                    variant="secondary"
                    small
                    icon={ArrowLeft}
                    disabled={index === 0}
                    onPress={() => setIndex(Math.max(0, index - 1))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Next lesson"
                    variant="secondary"
                    small
                    icon={ArrowRight}
                    disabled={index >= lessons.length - 1}
                    onPress={() =>
                      setIndex(Math.min(lessons.length - 1, index + 1))
                    }
                  />
                </View>
              </View>

              {!lesson.isCompleted ? (
                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    label="Mark lesson complete"
                    icon={CheckCircle2}
                    loading={isCompleting}
                    onPress={handleComplete}
                  />
                </View>
              ) : null}
            </Card>
          ) : null}

          {tab === 'notes' ? (
            <Card>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>
                  My notes
                </Text>
                {noteSaved ? (
                  <Badge label="Saved" tone="success" />
                ) : null}
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Write your own summary, mnemonics and reminders…"
                placeholderTextColor={colors.muted}
                style={{
                  minHeight: 180,
                  borderWidth: 1,
                  borderColor: colors.borderSoft,
                  borderRadius: radius,
                  padding: spacing.md,
                  color: colors.text,
                  fontSize: 13,
                  lineHeight: 21,
                  textAlignVertical: 'top',
                  backgroundColor: colors.surfaceAlt,
                }}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Save note"
                    small
                    loading={isSavingNote}
                    disabled={!userId}
                    onPress={handleSaveNote}
                  />
                </View>
              </View>
              {!userId ? (
                <Text style={{ color: colors.muted, fontSize: 10, marginTop: 6 }}>
                  Sign in to save notes.
                </Text>
              ) : null}
            </Card>
          ) : null}

          {tab === 'ai' ? (
            <Card>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: spacing.md,
                }}
              >
                <Sparkles size={16} color={colors.accent} />
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>
                  Ask AI about this lesson
                </Text>
              </View>

              {aiError ? <ErrorState message={aiError} /> : null}

              {chat.length === 0 ? (
                <Text style={{ color: colors.sub, fontSize: 12, lineHeight: 19 }}>
                  Ask for a simpler explanation, a real-life example, or a quick
                  quiz on "{lesson.title}".
                </Text>
              ) : (
                <ScrollView
                  ref={chatRef}
                  style={{ maxHeight: 320 }}
                  nestedScrollEnabled
                >
                  {chat.map((turn, i) => (
                    <View
                      key={i}
                      style={{
                        alignSelf: turn.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor:
                          turn.role === 'user' ? colors.primary : colors.surfaceAlt,
                        borderRadius: radius,
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                        maxWidth: '92%',
                      }}
                    >
                      <Text
                        style={{
                          color:
                            turn.role === 'user'
                              ? isDark
                                ? '#ffffff'
                                : colors.onAccent
                              : colors.text,
                          fontSize: 12,
                          lineHeight: 19,
                        }}
                      >
                        {turn.text}
                      </Text>
                    </View>
                  ))}
                  {isAsking ? (
                    <ActivityIndicator color={colors.accent} style={{ marginVertical: 8 }} />
                  ) : null}
                </ScrollView>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginTop: spacing.md,
                }}
              >
                <TextInput
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="Ask a question…"
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.borderSoft,
                    borderRadius: radius,
                    paddingHorizontal: spacing.md,
                    paddingVertical: 10,
                    color: colors.text,
                    fontSize: 13,
                  }}
                  onSubmitEditing={askAi}
                  returnKeyType="send"
                />
                <Pressable
                  onPress={askAi}
                  disabled={isAsking}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isAsking ? 0.6 : 1,
                  }}
                >
                  <Send size={16} color={isDark ? '#fff' : colors.onAccent} />
                </Pressable>
              </View>
            </Card>
          ) : null}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
