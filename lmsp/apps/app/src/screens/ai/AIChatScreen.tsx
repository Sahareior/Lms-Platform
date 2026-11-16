import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Bot,
  RefreshCw,
  Send,
  Sparkles,
  User as UserIcon,
} from 'lucide-react-native';
import {
  useAppSelector,
  useLazyGetAiChatHistoryQuery,
  useSaveAiChatMessagesMutation,
  useSendChatMessageMutation,
} from '@my-monorepo/store';

import { AppBar, Badge, ErrorState, Screen } from '../../ui';
import { useAppTheme, spacing } from '../../theme';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const SUGGESTIONS = [
  'Explain the Waterfall model with a real-life example.',
  'Make a 7-day revision plan for Bangladesh Affairs.',
  'Give me 5 tricky English preposition questions.',
  'Summarise the 1952 Language Movement in 6 bullet points.',
];

export default function AIChatScreen() {
  const { colors, isDark, radius } = useAppTheme();
  const user = useAppSelector((s) => s.user.user);

  const [fetchHistory, { isFetching: historyLoading }] =
    useLazyGetAiChatHistoryQuery();
  const [sendMessage, { isLoading }] = useSendChatMessageMutation();
  const [saveMessages] = useSaveAiChatMessagesMutation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const loadHistory = useCallback(async () => {
    try {
      const history = await fetchHistory({ limit: 40 }).unwrap();
      setMessages(
        (history.messages || []).map((m) => ({
          id: m._id,
          sender: m.sender,
          text: m.text,
        }))
      );
    } catch {
      setError('Could not load your chat history. You can still ask a question.');
    } finally {
      setLoaded(true);
    }
  }, [fetchHistory]);

  useEffect(() => {
    if (loaded) return;
    loadHistory();
  }, [loaded, loadHistory]);

  const scrollDown = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);

  const send = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `local-u-${Date.now()}`,
      sender: 'user',
      text: question,
    };
    setMessages((prev) => [...prev, userMessage]);
    scrollDown();

    try {
      const res = await sendMessage({ question }).unwrap();
      const answer = res?.answer || 'I could not produce an answer this time.';

      const aiMessage: ChatMessage = {
        id: `local-a-${Date.now()}`,
        sender: 'ai',
        text: answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
      scrollDown();

      saveMessages({
        messages: [
          { sender: 'user', text: question },
          { sender: 'ai', text: answer },
        ],
      }).catch(() => undefined);
    } catch {
      setError('The AI tutor is unavailable right now. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={8}
    >
      <Screen scroll={false}>
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
            <AppBar
              title="AI Tutor"
              subtitle="Ask anything about your syllabus, lessons or past papers"
              right={
                <Pressable onPress={loadHistory} hitSlop={8}>
                  <RefreshCw size={18} color={colors.sub} />
                </Pressable>
              }
            />
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.lg,
              gap: spacing.md,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {historyLoading ? (
              <LoaderInline label="Loading your conversations…" />
            ) : null}

            {error ? <ErrorState message={error} /> : null}

            {!historyLoading && messages.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: spacing.xl,
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    backgroundColor: colors.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={26} color={colors.accent} />
                </View>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: '900',
                    marginTop: spacing.md,
                  }}
                >
                  How can I help you study?
                </Text>
                <Text
                  style={{
                    color: colors.sub,
                    fontSize: 12,
                    textAlign: 'center',
                    lineHeight: 18,
                    marginTop: 4,
                  }}
                >
                  {user?.name
                    ? `${user.name.split(' ')[0]}, `
                    : ''}
                  ask a concept question, request a practice set, or build a
                  revision plan.
                </Text>

                <View style={{ width: '100%', gap: spacing.sm, marginTop: spacing.lg }}>
                  {SUGGESTIONS.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => send(suggestion)}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: radius,
                        borderWidth: 1,
                        borderColor: colors.borderSoft,
                        padding: spacing.md,
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 12, lineHeight: 18 }}>
                        {suggestion}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {messages.map((message) => {
              const mine = message.sender === 'user';
              return (
                <View
                  key={message.id}
                  style={{
                    flexDirection: 'row',
                    gap: spacing.sm,
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                  }}
                >
                  {!mine ? (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: colors.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Bot size={15} color={colors.onAccent} />
                    </View>
                  ) : null}

                  <View
                    style={{
                      backgroundColor: mine ? colors.primary : colors.surface,
                      borderRadius: radius,
                      borderWidth: mine ? 0 : 1,
                      borderColor: colors.borderSoft,
                      padding: spacing.md,
                      flexShrink: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: mine
                          ? isDark
                            ? '#ffffff'
                            : colors.onAccent
                          : colors.text,
                        fontSize: 13,
                        lineHeight: 21,
                      }}
                    >
                      {message.text}
                    </Text>
                  </View>

                  {mine ? (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: colors.surfaceAlt,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                    >
                      <UserIcon size={14} color={colors.sub} />
                    </View>
                  ) : null}
                </View>
              );
            })}

            {isLoading ? (
              <View
                style={{
                  flexDirection: 'row',
                  gap: spacing.sm,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={15} color={colors.onAccent} />
                </View>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: radius,
                    borderWidth: 1,
                    borderColor: colors.borderSoft,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={{ color: colors.sub, fontSize: 11 }}>
                    Thinking…
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: spacing.sm,
              padding: spacing.md,
              paddingBottom: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: colors.borderSoft,
              backgroundColor: colors.surface,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message your AI tutor…"
              placeholderTextColor={colors.muted}
              multiline
              style={{
                flex: 1,
                maxHeight: 110,
                color: colors.text,
                fontSize: 13,
                lineHeight: 19,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                borderRadius: radius,
                paddingHorizontal: spacing.md,
                paddingVertical: 10,
                backgroundColor: colors.bg,
              }}
            />
            <Pressable
              onPress={() => send()}
              disabled={isLoading || !input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading || !input.trim() ? 0.5 : 1,
              }}
            >
              <Send size={17} color={isDark ? '#fff' : colors.onAccent} />
            </Pressable>
          </View>

          <View style={{ alignItems: 'center', paddingBottom: 6 }}>
            <Badge label="AI can make mistakes — verify with your textbook" />
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function LoaderInline({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
      <ActivityIndicator color={colors.accent} />
      <Text style={{ color: colors.sub, fontSize: 11, marginTop: 6 }}>
        {label}
      </Text>
    </View>
  );
}
