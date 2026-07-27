import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  mcqs?: {
    question: string;
    options: { label: string; text: string; correct?: boolean }[];
  }[];
  tip?: string;
}

interface SuggestionChip {
  icon: string;
  label: string;
}

interface AIChatInterfaceProps {
  aiName?: string;
  status?: string;
  contextLabel?: string;
  messages?: ChatMessage[];
  suggestionChips?: SuggestionChip[];
  placeholder?: string;
}

// ─── Default Data ─────────────────────────────────────────
const defaultMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'user',
    content: 'কোন খবরের কাগজে বঙ্গবন্ধু শেখ মুজিবুর রহমানের ভাষণ ও কারাগারের ডায়েরি প্রকাশিত হয়?',
    timestamp: '10:24 AM',
  },
  {
    id: '2',
    type: 'ai',
    content:
      'কোন খবরের কাগজে বঙ্গবন্ধু শেখ মুজিবুর রহমানের ভাষণ ও কারাগারের ডায়েরি প্রকাশিত হয়? এ সম্পর্কে নিচে বিস্তারিত আলোচনা করা হলো:\n\n• যে পত্রিকায় বঙ্গবন্ধুর কারাগারের ডায়েরি প্রকাশিত হয় — দৈনিক ইত্তেফাক\n• বঙ্গবন্ধুর ঐতিহাসিক ৭ মার্চের ভাষণ — দৈনিক জনকণ্ঠ\n• বঙ্গবন্ধুর অপ্রকাশিত ভাষণ ও দলিল — দৈনিক সংবাদ\n• বঙ্গবন্ধুর "আমার দেখা নয়া চীন" — দৈনিক ইত্তেফাক',
    timestamp: '10:24 AM',
    mcqs: [
      {
        question: 'Q1: দৈনিক ইত্তেফাক পত্রিকায় বঙ্গবন্ধুর কোন লেখা প্রকাশিত হয়?',
        options: [
          { label: 'A', text: 'আমার দেখা নয়া চীন' },
          { label: 'B', text: 'কারাগারের ডায়েরি', correct: true },
          { label: 'C', text: 'অসমাপ্ত আত্মজীবনী' },
          { label: 'D', text: '৭ মার্চের ভাষণ' },
        ],
      },
      {
        question: 'Q2: ৭ মার্চের ঐতিহাসিক ভাষণ কোন পত্রিকায় সম্পূর্ণ প্রকাশিত হয়?',
        options: [
          { label: 'A', text: 'দৈনিক সংবাদ' },
          { label: 'B', text: 'দৈনিক ইত্তেফাক' },
          { label: 'C', text: 'দৈনিক জনকণ্ঠ', correct: true },
          { label: 'D', text: 'দৈনিক বাংলা' },
        ],
      },
    ],
    tip: 'BCS 43rd-44th, 45th — এই ধরনের প্রশ্ন BCS প্রিলিমিনারি পরীক্ষায় বারবার আসে।',
  },
  {
    id: '3',
    type: 'user',
    content: 'এই বিষয়ে আরও কিছু বিস্তারিত প্রশ্ন ও উত্তর দিতে পারবেন?',
    timestamp: '10:27 AM',
  },
];

const defaultChips: SuggestionChip[] = [
  { icon: '💡', label: 'Explain this topic simply' },
  { icon: '📄', label: 'Give me 10 MCQs' },
  { icon: '▶️', label: 'Most repeated questions' },
  { icon: '📅', label: 'Make a study plan' },
  { icon: '✅', label: 'What is my weak area?' },
];

// ─── Component ────────────────────────────────────────────
export default function AIChatInterface({
  aiName = 'AI Assistant',
  status = 'Online',
  contextLabel = 'BCS 45th Preliminary • Topic: Bangla Literature',
  messages = defaultMessages,
  suggestionChips = defaultChips,
  placeholder = 'Ask anything about your exam...',
}: AIChatInterfaceProps) {
  const [inputText, setInputText] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{aiName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{status}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Trained on Bangladesh job exam syllabus
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Text style={styles.headerActionText}>📥</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Text style={styles.headerActionText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Context Bar */}
      <View style={styles.contextBar}>
        <View style={styles.contextDot} />
        <Text style={styles.contextLabel}>Exam context: </Text>
        <Text style={styles.contextValue} numberOfLines={1}>
          {contextLabel}
        </Text>
        <TouchableOpacity style={styles.contextChange}>
          <Text style={styles.contextChangeText}>Change ›</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateLabel}>Today, June 14</Text>

        {messages.map((msg) => (
          <View key={msg.id}>
            {msg.type === 'user' ? (
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>{msg.content}</Text>
                <Text style={styles.userBubbleTime}>{msg.timestamp}</Text>
              </View>
            ) : (
              <View style={styles.aiBubbleWrap}>
                <View style={styles.aiBubble}>
                  <View style={styles.aiBubbleHeader}>
                    <View style={styles.aiSmallAvatar}>
                      <Text style={styles.aiSmallAvatarText}>A</Text>
                    </View>
                    <Text style={styles.aiBubbleName}>AI Assistant</Text>
                  </View>
                  <Text style={styles.aiBubbleText}>{msg.content}</Text>

                  {/* MCQs */}
                  {msg.mcqs?.map((mcq, mcqIdx) => (
                    <View key={mcqIdx} style={styles.mcqSection}>
                      <Text style={styles.mcqQuestion}>{mcq.question}</Text>
                      <View style={styles.mcqOptions}>
                        {mcq.options.map((opt, optIdx) => (
                          <View
                            key={optIdx}
                            style={[
                              styles.mcqOption,
                              opt.correct && styles.mcqOptionCorrect,
                            ]}
                          >
                            <Text
                              style={[
                                styles.mcqOptionLabel,
                                opt.correct && styles.mcqOptionLabelCorrect,
                              ]}
                            >
                              {opt.label}. {opt.text}
                            </Text>
                            {opt.correct && (
                              <Text style={styles.mcqCheck}>✓</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}

                  {/* Tips */}
                  {msg.tip && (
                    <View style={styles.tipBox}>
                      <Text style={styles.tipIcon}>💡</Text>
                      <Text style={styles.tipText}>
                        <Text style={styles.tipBold}>Exam Pattern: </Text>
                        {msg.tip}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.aiBubbleTime}>{msg.timestamp}</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Typing Indicator */}
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.typingDot,
                  i === 1 && styles.typingDotDelay1,
                  i === 2 && styles.typingDotDelay2,
                ]}
              />
            ))}
          </View>
          <Text style={styles.typingText}>
            AI is preparing a detailed answer...
          </Text>
        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionRow}
          contentContainerStyle={styles.suggestionContent}
        >
          {suggestionChips.map((chip, i) => (
            <TouchableOpacity key={i} style={styles.suggestionChip}>
              <Text style={styles.chipIcon}>{chip.icon}</Text>
              <Text style={styles.chipLabel}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            style={styles.textInput}
            multiline
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.moreBtn}>
              <Text style={styles.moreBtnText}>⋯</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendBtn}>
              <Text style={styles.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          All responses are based on the official Bangladesh job exam syllabus.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0e1625',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 10,
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  badgeText: {
    fontSize: 8,
    color: '#15803d',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    padding: 6,
  },
  headerActionText: {
    fontSize: 16,
  },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e1625',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contextDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  contextLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  contextValue: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
  contextChange: {
    paddingLeft: 8,
  },
  contextChangeText: {
    fontSize: 11,
    color: '#4ade80',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 20,
  },
  dateLabel: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  // User bubble
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    backgroundColor: '#1b2433',
    padding: 14,
    borderRadius: 14,
    borderTopRightRadius: 4,
  },
  userBubbleText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  userBubbleTime: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 6,
  },
  // AI bubble
  aiBubbleWrap: {
    alignItems: 'flex-start',
  },
  aiBubble: {
    maxWidth: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  aiBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiSmallAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0e1625',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSmallAvatarText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
  },
  aiBubbleName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  aiBubbleText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  aiBubbleTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 8,
  },
  // MCQs
  mcqSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  mcqQuestion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  mcqOptions: {
    gap: 6,
  },
  mcqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mcqOptionCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  mcqOptionLabel: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  mcqOptionLabelCorrect: {
    color: '#15803d',
    fontWeight: '700',
  },
  mcqCheck: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '700',
  },
  // Tip
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#fefce8',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  tipIcon: {
    fontSize: 12,
    marginTop: 1,
  },
  tipText: {
    fontSize: 10,
    color: '#854d0e',
    flex: 1,
    lineHeight: 14,
  },
  tipBold: {
    fontWeight: '800',
  },
  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignSelf: 'flex-start',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.3,
  },
  typingText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Input area
  inputArea: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  suggestionRow: {
    marginBottom: 10,
  },
  suggestionContent: {
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  chipIcon: {
    fontSize: 11,
  },
  chipLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingLeft: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 12,
    maxHeight: 80,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 6,
  },
  moreBtn: {
    padding: 6,
  },
  moreBtnText: {
    fontSize: 18,
    color: '#9ca3af',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 8,
  },
});
