import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useCQSetQuestions,
  useGetCreativeQuestionSetsQuery,
  toBengaliNumber,
  getSourceCategory,
  getCleanBoardName,
  getCQChapters,
  getCQPartDefaults,
  EDUCATION_BOARDS,
  CQ_YEARS,
} from '@my-monorepo/store';

import type { RootStackParamList } from '../../navigation/types';
import {
  AppBar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Loader,
  Screen,
  Segmented,
} from '../../ui';
import { useAppTheme, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reading'>;

type StudyMode = 'read' | 'practice';
type FontSize = 'sm' | 'base' | 'lg';
type SourceCategory = 'all' | 'board' | 'college' | 'cadet';

const PREFS_KEY = 'lms_cq_prefs';
const BOOKMARKS_KEY = 'lms_cq_bookmarks';
const READ_KEY = 'lms_cq_read_ids';
const PAGE_STEP = 20;

const FONT_SIZES = {
  sm: { question: 13, answer: 12, stimulus: 12, line: 21 },
  base: { question: 15, answer: 14, stimulus: 13, line: 24 },
  lg: { question: 18, answer: 16, stimulus: 15, line: 28 },
} as const;

function CQImages({ images }: { images?: { url: string; caption?: string }[] }) {
  const { colors } = useAppTheme();
  if (!images || images.length === 0) return null;

  return (
    <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
      {images.map((image, index) => (
        <View key={`${image.url}-${index}`}>
          <Image
            source={{ uri: image.url }}
            resizeMode="contain"
            style={{
              width: '100%',
              height: 190,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              backgroundColor: colors.surfaceAlt,
            }}
          />
          {image.caption ? (
            <Text
              style={{
                color: colors.muted,
                fontSize: 10,
                textAlign: 'center',
                marginTop: 3,
              }}
            >
              {image.caption}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default function ReadingScreen({ navigation }: Props) {
  const { colors, radius } = useAppTheme();

  const { data: sets, isLoading: setsLoading, isError: setsError } =
    useGetCreativeQuestionSetsQuery(undefined);

  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const activeSet = useMemo(() => {
    const list = sets ?? [];
    if (list.length === 0) return undefined;
    return list.find((s) => s._id === selectedSetId) ?? list[0];
  }, [sets, selectedSetId]);

  const {
    questions,
    isLoading: questionsLoading,
    isError: questionsError,
    refetch,
  } = useCQSetQuestions(activeSet?._id);

  const [search, setSearch] = useState('');
  const [sourceCategory, setSourceCategory] = useState<SourceCategory>('all');
  const [board, setBoard] = useState<string>(EDUCATION_BOARDS[0]);
  const [year, setYear] = useState<string>(CQ_YEARS[0]);
  const [chapterId, setChapterId] = useState('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [studyMode, setStudyMode] = useState<StudyMode>('read');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // ── Restore reader prefs / progress ─────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [prefsRaw, bookmarksRaw, readRaw] = await Promise.all([
          AsyncStorage.getItem(PREFS_KEY),
          AsyncStorage.getItem(BOOKMARKS_KEY),
          AsyncStorage.getItem(READ_KEY),
        ]);
        if (prefsRaw) {
          const prefs = JSON.parse(prefsRaw);
          if (prefs.fontSize === 'sm' || prefs.fontSize === 'lg') {
            setFontSize(prefs.fontSize);
          }
          if (prefs.studyMode === 'practice') setStudyMode('practice');
        }
        if (bookmarksRaw) setBookmarks(new Set(JSON.parse(bookmarksRaw)));
        if (readRaw) setReadIds(new Set(JSON.parse(readRaw)));
      } catch {
        // ignore corrupted local state
      } finally {
        setPrefsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ fontSize, studyMode })).catch(
      () => undefined
    );
  }, [fontSize, studyMode, prefsLoaded]);

  const chapters = useMemo(() => getCQChapters(questions), [questions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return questions.filter((question) => {
      if (bookmarkedOnly && !bookmarks.has(question.id)) return false;

      if (sourceCategory !== 'all' && getSourceCategory(question) !== sourceCategory) {
        return false;
      }

      if (board !== EDUCATION_BOARDS[0]) {
        const target = board.toLowerCase();
        const sourceBoard = (question.source?.board || '').toLowerCase();
        const raw = (question.source?.raw || '').toLowerCase();
        if (!sourceBoard.includes(target) && !raw.includes(target)) return false;
      }

      if (year !== CQ_YEARS[0]) {
        const sourceYear = question.source?.year || '';
        const raw = question.source?.raw || '';
        if (!sourceYear.includes(year) && !raw.includes(year)) return false;
      }

      if (chapterId !== 'all') {
        const id = question.chapterId || String(question.chapterNumber ?? '');
        if (id !== chapterId) return false;
      }

      if (term) {
        const matches =
          question.stimulus?.toLowerCase().includes(term) ||
          question.source?.board?.toLowerCase().includes(term) ||
          question.source?.raw?.toLowerCase().includes(term) ||
          (question.parts || []).some(
            (part) =>
              part.text?.toLowerCase().includes(term) ||
              part.answer?.toLowerCase().includes(term)
          );
        if (!matches) return false;
      }

      return true;
    });
  }, [
    questions,
    bookmarkedOnly,
    bookmarks,
    sourceCategory,
    board,
    year,
    chapterId,
    search,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_STEP);
  }, [search, sourceCategory, board, year, chapterId, bookmarkedOnly, activeSet?._id]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...next])).catch(
        () => undefined
      );
      return next;
    });
  };

  const toggleRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(READ_KEY, JSON.stringify([...next])).catch(
        () => undefined
      );
      return next;
    });
  };

  const toggleAnswer = (key: string) =>
    setOpenAnswers((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetFilters = () => {
    setSearch('');
    setSourceCategory('all');
    setBoard(EDUCATION_BOARDS[0]);
    setYear(CQ_YEARS[0]);
    setChapterId('all');
    setBookmarkedOnly(false);
  };

  const sizes = FONT_SIZES[fontSize];
  const total = sets?.find((s) => s._id === activeSet?._id)?.questionCount ?? filtered.length;

  if (setsLoading) {
    return (
      <Screen>
        <AppBar title="Reading" onBack={navigation.goBack} />
        <Loader label="Loading question sets…" />
      </Screen>
    );
  }

  if (setsError || !activeSet) {
    return (
      <Screen>
        <AppBar title="Reading" onBack={navigation.goBack} />
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No creative question sets"
            message="Practice sets have not been published yet, or the service is unreachable."
            actionLabel="Back to study section"
            onAction={navigation.goBack}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen refreshing={questionsLoading} onRefresh={refetch}>
      <AppBar
        title="Reading"
        subtitle={`${total} creative questions · read or self-test`}
        onBack={navigation.goBack}
      />

      {/* Question set picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}
      >
        {(sets ?? []).map((set) => {
          const active = set._id === activeSet._id;
          return (
            <Pressable
              key={set._id}
              onPress={() => setSelectedSetId(set._id)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: 8,
                borderRadius: radius,
                borderWidth: 1,
                borderColor: active ? colors.border : colors.borderSoft,
                backgroundColor: active ? colors.primary : colors.surface,
                maxWidth: 220,
              }}
            >
              <Text
                style={{
                  color: active ? colors.onAccent : colors.text,
                  fontSize: 12,
                  fontWeight: '800',
                }}
                numberOfLines={1}
              >
                {set.title ||
                  (typeof set.subject === 'object'
                    ? (set.subject as any)?.name
                    : 'Question set')}
              </Text>
              <Text
                style={{
                  color: active ? colors.onAccent : colors.muted,
                  fontSize: 9,
                  marginTop: 2,
                }}
              >
                {set.questionCount} questions
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {questionsError ? (
        <ErrorState message="Could not load this question set." onRetry={refetch} />
      ) : null}

      <Field
        value={search}
        onChangeText={setSearch}
        placeholder="Search stimulus, board or answer…"
        autoCapitalize="none"
        right={<Search size={16} color={colors.muted} />}
      />

      {/* Mode + font size */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Segmented
            options={[
              { value: 'read', label: 'Read' },
              { value: 'practice', label: 'Practice' },
            ]}
            value={studyMode}
            onChange={setStudyMode}
          />
        </View>
        {(['sm', 'base', 'lg'] as FontSize[]).map((size) => (
          <Pressable
            key={size}
            onPress={() => setFontSize(size)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: fontSize === size ? colors.accent : colors.borderSoft,
              backgroundColor:
                fontSize === size ? colors.accentSoft : colors.surface,
            }}
          >
            <Text
              style={{
                color: fontSize === size ? colors.accent : colors.sub,
                fontSize: size === 'sm' ? 10 : size === 'base' ? 12 : 14,
                fontWeight: '900',
              }}
            >
              A
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Filters */}
      <Pressable
        onPress={() => setShowFilters((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 8,
          marginBottom: spacing.xs,
        }}
      >
        <Text style={{ color: colors.sub, fontSize: 11, fontWeight: '800' }}>
          Filters · {filtered.length} of {questions.length} questions
        </Text>
        {showFilters ? (
          <ChevronUp size={15} color={colors.muted} />
        ) : (
          <ChevronDown size={15} color={colors.muted} />
        )}
      </Pressable>

      {showFilters ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Segmented
            options={[
              { value: 'all', label: 'All' },
              { value: 'board', label: 'Board' },
              { value: 'college', label: 'College' },
              { value: 'cadet', label: 'Cadet' },
            ]}
            value={sourceCategory}
            onChange={setSourceCategory}
          />

          <Text style={labelStyle(colors.sub)}>Board</Text>
          <ChipRow
            options={[...EDUCATION_BOARDS]}
            value={board}
            onChange={setBoard}
          />

          <Text style={labelStyle(colors.sub)}>Year</Text>
          <ChipRow options={[...CQ_YEARS]} value={year} onChange={setYear} />

          <Text style={labelStyle(colors.sub)}>Chapter</Text>
          <ChipRow
            options={['all', ...chapters.map((c) => c.id)]}
            labels={{
              all: 'All chapters',
              ...Object.fromEntries(
                chapters.map((c) => [
                  c.id,
                  `${toBengaliNumber(c.number)}. ${c.name} (${c.count})`,
                ])
              ),
            }}
            value={chapterId}
            onChange={setChapterId}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginTop: spacing.md,
            }}
          >
            <Pressable
              onPress={() => setBookmarkedOnly((v) => !v)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: spacing.md,
                paddingVertical: 7,
                borderRadius: radius,
                borderWidth: 1,
                borderColor: bookmarkedOnly ? colors.warning : colors.borderSoft,
                backgroundColor: bookmarkedOnly
                  ? colors.warningSoft
                  : colors.surface,
              }}
            >
              <Bookmark
                size={13}
                color={bookmarkedOnly ? colors.warning : colors.sub}
              />
              <Text
                style={{
                  color: bookmarkedOnly ? colors.warning : colors.sub,
                  fontSize: 11,
                  fontWeight: '800',
                }}
              >
                Bookmarked
              </Text>
            </Pressable>

            <Pressable
              onPress={resetFilters}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: spacing.md,
                paddingVertical: 7,
                borderRadius: radius,
                borderWidth: 1,
                borderColor: colors.borderSoft,
              }}
            >
              <RotateCcw size={13} color={colors.sub} />
              <Text style={{ color: colors.sub, fontSize: 11, fontWeight: '800' }}>
                Reset
              </Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      {questionsLoading && questions.length === 0 ? (
        <Loader label="Loading questions…" />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No matching questions"
            message="Try a different board, year, chapter or search term."
            actionLabel="Reset filters"
            onAction={resetFilters}
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {filtered.slice(0, visibleCount).map((question, index) => {
            const isBookmarked = bookmarks.has(question.id);
            const isRead = readIds.has(question.id);
            const parts = getCQPartDefaults(question);
            const category = getSourceCategory(question);

            return (
              <Card key={question.id} padded={false}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderSoft,
                  }}
                >
                  <Badge
                    label={`প্রশ্ন ${toBengaliNumber(question.number || index + 1)}`}
                    tone="info"
                  />
                  <Badge
                    label={`${getCleanBoardName(question)}${
                      question.source?.year
                        ? ` · ${toBengaliNumber(question.source.year)}`
                        : ''
                    }`}
                    tone={category === 'cadet' ? 'warning' : 'neutral'}
                  />

                  <View style={{ flexDirection: 'row', gap: 4, marginLeft: 'auto' }}>
                    <Pressable
                      onPress={() => toggleBookmark(question.id)}
                      hitSlop={8}
                      style={{ padding: 4 }}
                    >
                      <Bookmark
                        size={16}
                        color={isBookmarked ? colors.warning : colors.muted}
                        fill={isBookmarked ? colors.warning : 'transparent'}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => toggleRead(question.id)}
                      hitSlop={8}
                      style={{ padding: 4 }}
                    >
                      <CheckCircle2
                        size={16}
                        color={isRead ? colors.success : colors.muted}
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={{ padding: spacing.md }}>
                  {question.stimulus ? (
                    <View
                      style={{
                        backgroundColor: colors.surfaceAlt,
                        borderRadius: radius,
                        padding: spacing.md,
                        borderLeftWidth: 3,
                        borderLeftColor: colors.accent,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.accent,
                          fontSize: 9,
                          fontWeight: '900',
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          marginBottom: 4,
                        }}
                      >
                        উদ্দীপক
                      </Text>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: sizes.stimulus,
                          lineHeight: sizes.line,
                        }}
                      >
                        {question.stimulus}
                      </Text>
                      <CQImages images={question.stimulusImages} />

                      {(question.stimulusBlocks || []).map((block, i) => (
                        <Text
                          key={i}
                          style={{
                            color: colors.sub,
                            fontSize: 11,
                            lineHeight: 17,
                            marginTop: spacing.sm,
                            backgroundColor: colors.surface,
                            borderRadius: 6,
                            padding: spacing.sm,
                          }}
                        >
                          {block.value}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  <View style={{ gap: spacing.md, marginTop: spacing.md }}>
                    {parts.map((part) => {
                      const answerKey = `${question.id}-${part.label}`;
                      const isOpen = openAnswers[answerKey] ?? studyMode === 'read';

                      return (
                        <View
                          key={part.label}
                          style={{
                            borderTopWidth: 1,
                            borderTopColor: colors.borderSoft,
                            paddingTop: spacing.sm,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              marginBottom: 4,
                              flexWrap: 'wrap',
                            }}
                          >
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                backgroundColor: colors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  color: colors.onAccent,
                                  fontSize: 11,
                                  fontWeight: '900',
                                }}
                              >
                                {part.label}
                              </Text>
                            </View>
                            <Badge label={String(part.cognitiveType)} />
                            <Text style={{ color: colors.muted, fontSize: 10 }}>
                              [নম্বর: {toBengaliNumber(part.marks)}]
                            </Text>
                          </View>

                          <Text
                            style={{
                              color: colors.text,
                              fontSize: sizes.question,
                              lineHeight: sizes.line,
                              fontWeight: '600',
                              marginBottom: 4,
                            }}
                          >
                            {part.text}
                          </Text>

                          <CQImages images={part.questionImages} />

                          <Pressable
                            onPress={() => toggleAnswer(answerKey)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              alignSelf: 'flex-start',
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isOpen ? colors.accent : colors.borderSoft,
                              backgroundColor: isOpen
                                ? colors.accentSoft
                                : colors.surfaceAlt,
                              marginTop: spacing.sm,
                            }}
                          >
                            <Text
                              style={{
                                color: isOpen ? colors.accent : colors.sub,
                                fontSize: 11,
                                fontWeight: '800',
                              }}
                            >
                              {isOpen ? 'লুকান' : 'উত্তর দেখুন'}
                            </Text>
                            {isOpen ? (
                              <ChevronUp size={12} color={colors.accent} />
                            ) : (
                              <ChevronDown size={12} color={colors.sub} />
                            )}
                          </Pressable>

                          {isOpen ? (
                            <View
                              style={{
                                backgroundColor: colors.surfaceAlt,
                                borderRadius: radius,
                                padding: spacing.md,
                                marginTop: spacing.sm,
                              }}
                            >
                              {part.answer ? (
                                <Text
                                  style={{
                                    color: colors.text,
                                    fontSize: sizes.answer,
                                    lineHeight: sizes.line,
                                  }}
                                >
                                  {part.answer}
                                </Text>
                              ) : (
                                <Text
                                  style={{
                                    color: colors.muted,
                                    fontSize: 11,
                                    fontStyle: 'italic',
                                  }}
                                >
                                  এই অংশের জন্য সরাসরি উত্তর সংরক্ষিত নেই।
                                </Text>
                              )}
                              {(part.modelAnswers || []).map((answer, i) => (
                                <Text
                                  key={i}
                                  style={{
                                    color: colors.sub,
                                    fontSize: sizes.answer - 1,
                                    lineHeight: sizes.line,
                                    marginTop: spacing.sm,
                                  }}
                                >
                                  • {answer}
                                </Text>
                              ))}
                              <CQImages images={part.answerImages} />
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>

                  <Pressable
                    onPress={() => toggleRead(question.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      alignSelf: 'flex-start',
                      marginTop: spacing.md,
                    }}
                  >
                    <CheckCircle2
                      size={14}
                      color={isRead ? colors.success : colors.muted}
                    />
                    <Text
                      style={{
                        color: isRead ? colors.success : colors.muted,
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {isRead ? 'পড়া হয়েছে' : 'পড়া হিসেবে চিহ্নিত করুন'}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            );
          })}

          {visibleCount < filtered.length ? (
            <Pressable
              onPress={() => setVisibleCount(visibleCount + PAGE_STEP)}
              style={{
                alignItems: 'center',
                paddingVertical: spacing.md,
                borderRadius: radius,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '900' }}>
                Load more ({filtered.length - visibleCount} remaining)
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

function ChipRow({
  options,
  labels,
  value,
  onChange,
}: {
  options: string[];
  labels?: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
}) {
  const { colors, radius } = useAppTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: radius,
              borderWidth: 1,
              borderColor: active ? colors.accent : colors.borderSoft,
              backgroundColor: active ? colors.accentSoft : 'transparent',
            }}
          >
            <Text
              style={{
                color: active ? colors.accent : colors.sub,
                fontSize: 10,
                fontWeight: '700',
              }}
              numberOfLines={1}
            >
              {labels?.[option] ?? option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const labelStyle = (color: string) => ({
  color,
  fontSize: 9,
  fontWeight: '900' as const,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
  marginTop: 10,
  marginBottom: 2,
});
