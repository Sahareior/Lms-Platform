import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TextStyle,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────
interface QuestionOption {
  label: string;
  text: string;
  subtext: string;
  isSelected?: boolean;
  isCorrect?: boolean;
}

interface ExamQuestion {
  id: number;
  subject: string;
  topic: string;
  marks: number;
  questionBN: string;
  questionEN: string;
  options: QuestionOption[];
}

interface MockExamInterfaceProps {
  examTitle?: string;
  examInfo?: string;
  totalQuestions?: number;
  currentQuestion?: number;
  questions?: ExamQuestion[];
  negativeMarking?: string;
  categorySections?: { label: string; count: number; isActive?: boolean }[];
}

// ─── Default Data ─────────────────────────────────────────
const defaultCategorySections = [
  { label: 'Bangla 35', count: 35 },
  { label: 'English 35', count: 35 },
  { label: 'General Knowledge 35', count: 35 },
  { label: 'Bangladesh Affairs 30', count: 30, isActive: true },
  { label: 'Science & Tech 20', count: 20 },
  { label: 'Mental Ability 20', count: 20 },
  { label: 'Mathematics 25', count: 25 },
];

const defaultQuestion: ExamQuestion = {
  id: 45,
  subject: 'Bangladesh Affairs',
  topic: 'Constitution',
  marks: 1,
  questionBN: 'বাংলাদেশের সংবিধান কবে কার্যকর হয়েছিল?',
  questionEN: 'When did the Constitution of Bangladesh come into effect?',
  options: [
    {
      label: 'A',
      text: 'বাংলাদেশের সংবিধান কার্যকর হয় ১৬ ডিসেম্বর ১৯৭২ সালে',
      subtext: 'The Constitution of Bangladesh came into effect on 16 December 1972',
    },
    {
      label: 'B',
      text: 'বাংলাদেশের সংবিধান কার্যকর হয় ৪ নভেম্বর ১৯৭২ সালে',
      subtext: 'The Constitution of Bangladesh came into effect on 4 November 1972',
      isSelected: true,
      isCorrect: true,
    },
    {
      label: 'C',
      text: 'বাংলাদেশের সংবিধান কার্যকর হয় ২৬ মার্চ ১৯৭২ সালে',
      subtext: 'The Constitution of Bangladesh came into effect on 26 March 1972',
    },
    {
      label: 'D',
      text: 'বাংলাদেশের সংবিধান কার্যকর হয় ১৭ এপ্রিল ১৯৭২ সালে',
      subtext: 'The Constitution of Bangladesh came into effect on 17 April 1972',
    },
  ],
};

const getNavStyle = (id: number, currentId: number) => {
  if (id === currentId) return { backgroundColor: '#ffffff', borderColor: '#22c55e', borderWidth: 2 };
  if (id < currentId && id !== 34 && id !== 42) return { backgroundColor: '#1a2332', borderColor: '#1a2332' };
  if (id === 34 || id === 42) return { backgroundColor: '#fef3c7', borderColor: '#fde68a', borderWidth: 1 };
  return { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1 };
};

const getNavTextStyle = (id: number, currentId: number): { color: string; fontWeight?: TextStyle['fontWeight'] } => {
  if (id === currentId) return { color: '#16a34a', fontWeight: '800' };
  if (id < currentId && id !== 34 && id !== 42) return { color: '#ffffff', fontWeight: '600' };
  if (id === 34 || id === 42) return { color: '#a16207', fontWeight: '700' };
  return { color: '#6b7280', fontWeight: '500' };
};

// ─── Component ────────────────────────────────────────────
export default function MockExamInterface({
  examTitle = 'BCS Preliminary Mock Exam #4',
  examInfo = 'Full Syllabus • 200 Questions • 120 Minutes',
  totalQuestions = 200,
  currentQuestion = 45,
  questions = [defaultQuestion],
  negativeMarking = '-0.5 per wrong answer',
  categorySections = defaultCategorySections,
}: MockExamInterfaceProps) {
  const question = questions[0];
  const answeredCount = 44;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoIcon}>▶</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{examTitle}</Text>
            <Text style={styles.headerInfo}>{examInfo}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.timerSection}>
            <Text style={styles.timerIcon}>⏱️</Text>
            <Text style={styles.timerText}>01:28:43</Text>
          </View>
          <View style={styles.progressNum}>
            <Text style={styles.progressNumText}>{currentQuestion} / {totalQuestions}</Text>
            <Text style={styles.progressNumLabel}>Answered</Text>
          </View>
          <TouchableOpacity style={styles.pauseBtn}>
            <Text style={styles.pauseBtnText}>⏸ Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitExamBtn}>
            <Text style={styles.submitExamBtnText}>🚩 Submit Exam</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}
      >
        {categorySections.map((cat, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.categoryItem,
              cat.isActive && styles.categoryItemActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                cat.isActive && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.negativeMarking}>⚠️ {negativeMarking}</Text>
      </ScrollView>

      {/* Main Grid */}
      <View style={styles.mainGrid}>
        {/* Left: Navigator */}
        <View style={styles.navColumn}>
          <View style={styles.navCard}>
            <Text style={styles.navTitle}>Question Navigator</Text>

            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#1a2332' }]} />
                <Text style={styles.legendLbl}>Answered</Text>
                <Text style={styles.legendVal}>{answeredCount}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#22c55e' }]} />
                <Text style={styles.legendLbl}>Current</Text>
                <Text style={styles.legendVal}>1</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db' }]} />
                <Text style={styles.legendLbl}>Not visited</Text>
                <Text style={styles.legendVal}>152</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#facc15' }]} />
                <Text style={styles.legendLbl}>Marked</Text>
                <Text style={styles.legendVal}>3</Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{answeredCount}/{totalQuestions}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(answeredCount / totalQuestions) * 100}%` as any },
                ]}
              />
            </View>

            <View style={styles.navGrid}>
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                (num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.navDot, getNavStyle(num, currentQuestion)]}
                  >
                    <Text
                      style={[
                        styles.navDotText,
                        getNavTextStyle(num, currentQuestion),
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>

        {/* Right: Question */}
        <ScrollView
          style={styles.questionColumn}
          contentContainerStyle={styles.questionContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionCard}>
            {/* Question Header */}
            <View style={styles.qHeader}>
              <View style={styles.qMeta}>
                <View style={styles.qNumBadge}>
                  <Text style={styles.qNumText}>{currentQuestion}</Text>
                </View>
                <View>
                  <Text style={styles.qNumLabel}>
                    Question {currentQuestion} of {totalQuestions}
                  </Text>
                  <View style={styles.qTags}>
                    <View style={styles.qTagSubject}>
                      <Text style={styles.qTagSubjectText}>{question.subject}</Text>
                    </View>
                    <View style={styles.qTagTopic}>
                      <Text style={styles.qTagTopicText}>{question.topic}</Text>
                    </View>
                    <Text style={styles.qMarks}>{question.marks} Mark</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.markedBtn}>
                <Text style={styles.markedBtnText}>🚩 Marked for Review</Text>
              </TouchableOpacity>
            </View>

            {/* Question Text */}
            <Text style={styles.qText}>{question.questionBN}</Text>
            <Text style={styles.qEnglish}>{question.questionEN}</Text>

            {/* Options */}
            <View style={styles.optionsList}>
              {question.options.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.optionCard,
                    opt.isSelected && styles.optionCardSelected,
                    opt.isCorrect && opt.isSelected && styles.optionCardCorrect,
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.optionCircle,
                      opt.isSelected && styles.optionCircleSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionCircleText,
                        opt.isSelected && styles.optionCircleTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text
                      style={[
                        styles.optionMainText,
                        opt.isSelected && styles.optionMainTextSelected,
                      ]}
                    >
                      {opt.text}
                    </Text>
                    <Text
                      style={[
                        styles.optionSubtext,
                        opt.isSelected && styles.optionSubtextSelected,
                      ]}
                    >
                      {opt.subtext}
                    </Text>
                  </View>
                  {opt.isSelected && (
                    <View style={styles.optionCheck}>
                      <Text style={styles.optionCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Exam Mode Notice */}
            <View style={styles.examNotice}>
              <Text style={styles.examNoticeIcon}>🔒</Text>
              <Text style={styles.examNoticeText}>
                Exam mode — answers and explanations will be shown after submission.
              </Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.prevBtn}>
                <Text style={styles.prevBtnText}>‹ Previous</Text>
              </TouchableOpacity>

              <View style={styles.centerActions}>
                <TouchableOpacity style={styles.markReviewBtn}>
                  <Text style={styles.markReviewText}>🚩 Mark for Review</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>✗ Clear</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.jumpSection}>
                <Text style={styles.jumpLabel}>Jump to:</Text>
                <View style={styles.jumpInputWrap}>
                  <TextInput
                    style={styles.jumpInput}
                    defaultValue="45"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.jumpBtn}>
                    <Text style={styles.jumpBtnText}>Go</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.saveNextBtn}>
                <Text style={styles.saveNextBtnText}>Save & Next ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Footer Shortcuts */}
      <View style={styles.footer}>
        <View style={styles.shortcutItem}>
          <Text style={styles.shortcutKeys}>‹ ›</Text>
          <Text style={styles.shortcutLabel}>Prev / Next</Text>
        </View>
        <View style={styles.shortcutDivider} />
        <View style={styles.shortcutItem}>
          <Text style={styles.shortcutKeys}>A B C D</Text>
          <Text style={styles.shortcutLabel}>Select</Text>
        </View>
        <View style={styles.shortcutDivider} />
        <View style={styles.shortcutItem}>
          <Text style={styles.shortcutKeys}>N</Text>
          <Text style={styles.shortcutLabel}>Mark review</Text>
        </View>
        <View style={styles.shortcutDivider} />
        <View style={styles.shortcutItem}>
          <Text style={styles.shortcutKeys}>ESC</Text>
          <Text style={styles.shortcutLabel}>Pause</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    backgroundColor: '#1a2332',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerInfo: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ef4444',
  },
  progressNum: {
    alignItems: 'center',
  },
  progressNumText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  progressNumLabel: {
    fontSize: 9,
    color: '#9ca3af',
  },
  pauseBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pauseBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  submitExamBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitExamBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  categoryBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  categoryContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  categoryItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryItemActive: {
    backgroundColor: '#eff6ff',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  categoryText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
  negativeMarking: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
  },
  mainGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  navColumn: {
    width: 240,
  },
  navCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 10,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLbl: {
    fontSize: 9,
    color: '#6b7280',
    flex: 1,
  },
  legendVal: {
    fontSize: 9,
    color: '#374151',
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 9,
    color: '#374151',
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  navDot: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navDotText: {
    fontSize: 7,
  },
  questionColumn: {
    flex: 1,
  },
  questionContent: {
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 20,
  },
  qMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  qNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  qNumLabel: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  qTagSubject: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qTagSubjectText: {
    fontSize: 9,
    color: '#15803d',
    fontWeight: '700',
  },
  qTagTopic: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qTagTopicText: {
    fontSize: 9,
    color: '#2563eb',
    fontWeight: '700',
  },
  qMarks: {
    fontSize: 9,
    color: '#9ca3af',
  },
  markedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#facc15',
    borderRadius: 8,
  },
  markedBtnText: {
    fontSize: 11,
    color: '#a16207',
    fontWeight: '700',
  },
  qText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 26,
    marginBottom: 6,
  },
  qEnglish: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 24,
  },
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: '#1a2332',
    borderColor: '#1a2332',
  },
  optionCardCorrect: {
    backgroundColor: '#1a2332',
    borderColor: '#1a2332',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCircleSelected: {
    backgroundColor: '#22c55e',
  },
  optionCircleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b7280',
  },
  optionCircleTextSelected: {
    color: '#ffffff',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionMainText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  optionMainTextSelected: {
    color: '#ffffff',
  },
  optionSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  optionSubtextSelected: {
    color: '#d1d5db',
  },
  optionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCheckText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
  },
  examNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  examNoticeIcon: {
    fontSize: 14,
  },
  examNoticeText: {
    fontSize: 10,
    color: '#6b7280',
    flex: 1,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexWrap: 'wrap',
    gap: 10,
  },
  prevBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    opacity: 0.5,
  },
  prevBtnText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  centerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  markReviewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#facc15',
    backgroundColor: '#fefce8',
    borderRadius: 10,
  },
  markReviewText: {
    fontSize: 12,
    color: '#a16207',
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
  },
  clearBtnText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
  },
  jumpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jumpLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  jumpInputWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  jumpInput: {
    width: 40,
    height: 32,
    textAlign: 'center',
    fontSize: 13,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  jumpBtn: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  jumpBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  saveNextBtn: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveNextBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shortcutKeys: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '800',
  },
  shortcutLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  shortcutDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#e5e7eb',
  },
});
