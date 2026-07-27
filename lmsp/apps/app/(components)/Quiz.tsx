import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────
interface Option {
  label: string;
  text: string;
  subtext?: string;
  isCorrect?: boolean;
  isSelected?: boolean;
}

interface Question {
  id: number;
  subject: string;
  topic: string;
  questionText: string;
  questionEnglish?: string;
  options: Option[];
  explanation?: string;
}

interface SectionProgress {
  label: string;
  progress: number; // 0-100
}

interface QuizProps {
  totalQuestions?: number;
  questions?: Question[];
  sectionProgress?: SectionProgress[];
  currentQuestionIndex?: number;
}

// ─── Default Data ─────────────────────────────────────────
const defaultQuestions: Question[] = [
  {
    id: 14,
    subject: 'General Math',
    topic: 'Profit & Loss',
    questionText:
      'একটি পণ্য ১০% লাভে বিক্রি করা হয়, যা থেকে ৫০ টাকা লাভ হয়। পণ্যটি যদি ১৫% লাভে বিক্রি করা হয়, তবে নতুন লাভ কত টাকা হবে?',
    questionEnglish:
      'A product is sold at 10% profit, earning Tk. 50. If sold at 15% profit, how much profit would be made?',
    options: [
      { label: 'A', text: '৪০০ টাকা', subtext: 'Tk. 400' },
      { label: 'B', text: '৪৫০ টাকা', subtext: 'Tk. 450', isCorrect: true, isSelected: true },
      { label: 'C', text: '৫০০ টাকা', subtext: 'Tk. 500' },
      { label: 'D', text: '৫৫০ টাকা', subtext: 'Tk. 550' },
    ],
    explanation:
      'Cost price = ৫০০ টাকা। At 10% profit: ৫০ টাকা লাভ। At 15%, profit would be ৭৫ টাকা। Profit difference = ২৫ টাকা। Correct Answer: Tk. ৪৫০',
  },
];

const defaultSectionProgress: SectionProgress[] = [
  { label: 'Math', progress: 100 },
  { label: 'English', progress: 70 },
  { label: 'General Knowledge', progress: 40 },
  { label: 'Bangladesh Affairs', progress: 60 },
  { label: 'ICT', progress: 0 },
];

// ─── Helpers ─────────────────────────────────────────────
const answeredIds = [1, 2, 3, 4, 6, 7, 8, 11, 12, 14];
const flaggedIds = [16, 17, 20];
const currentId = 14;

const getNavStyle = (num: number) => {
  if (num === currentId) return { backgroundColor: '#ffffff', borderColor: '#22c55e', borderWidth: 2 };
  if (flaggedIds.includes(num)) return { backgroundColor: '#fef3c7', borderColor: '#fde68a', borderWidth: 1 };
  if (answeredIds.includes(num)) return { backgroundColor: '#1a2332', borderColor: '#1a2332', borderWidth: 1 };
  return { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', borderWidth: 1 };
};

const getNavTextStyle = (num: number): { color: string; fontWeight?: TextStyle['fontWeight'] } => {
  if (num === currentId) return { color: '#16a34a', fontWeight: '800' };
  if (flaggedIds.includes(num)) return { color: '#a16207', fontWeight: '700' };
  if (answeredIds.includes(num)) return { color: '#ffffff', fontWeight: '600' };
  return { color: '#6b7280', fontWeight: '500' };
};

// ─── Component ────────────────────────────────────────────
export default function Quiz({
  totalQuestions = 40,
  questions = defaultQuestions,
  sectionProgress = defaultSectionProgress,
}: QuizProps) {
  const question = questions[0];
  const answeredCount = answeredIds.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Section Progress */}
      <View style={styles.progressBarRow}>
        <View style={styles.progressLabelRow}>
          <View style={styles.progressDot} />
          <Text style={styles.progressLabelText}>Section Progress:</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sectionProgress.map((section, i) => (
            <View key={i} style={styles.sectionProgressItem}>
              <View style={styles.sectionProgressBar}>
                <View
                  style={[
                    styles.sectionProgressFill,
                    { width: `${section.progress}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.sectionProgressLabel}>{section.label}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.scoreLabel}>Score: 9/13</Text>
      </View>

      {/* Main Content Row */}
      <View style={styles.mainRow}>
        {/* Left: Question Navigator */}
        <View style={styles.navigatorColumn}>
          <View style={styles.navigatorCard}>
            <Text style={styles.navigatorTitle}>Question Navigator</Text>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#1a2332' }]} />
                <Text style={styles.legendText}>Answered {answeredCount}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#d1d5db', borderWidth: 1, borderColor: '#9ca3af' }]} />
                <Text style={styles.legendText}>Unanswered {totalQuestions - answeredCount - flaggedIds.length}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#facc15' }]} />
                <Text style={styles.legendText}>Flagged {flaggedIds.length}</Text>
              </View>
            </View>

            <View style={styles.navigatorGrid}>
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                (num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.navItem, getNavStyle(num)]}
                  >
                    <Text style={[styles.navItemText, getNavTextStyle(num)]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <TouchableOpacity style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>🚩 Submit Exam</Text>
            </TouchableOpacity>
            <Text style={styles.submitInfo}>
              {answeredCount} answered • {totalQuestions - answeredCount} remaining
            </Text>
          </View>
        </View>

        {/* Right: Question */}
        <View style={styles.questionColumn}>
          <View style={styles.questionCard}>
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <View style={styles.questionMeta}>
                <View style={styles.qBadge}>
                  <Text style={styles.qBadgeText}>Q{question.id}</Text>
                </View>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectBadgeText}>{question.subject}</Text>
                </View>
                <View style={styles.topicBadge}>
                  <Text style={styles.topicBadgeText}>{question.topic}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.flagBtn}>
                <Text style={styles.flagBtnText}>🚩 Mark</Text>
              </TouchableOpacity>
            </View>

            {/* Question Text */}
            <Text style={styles.questionText}>{question.questionText}</Text>
            {question.questionEnglish && (
              <Text style={styles.questionEnglish}>{question.questionEnglish}</Text>
            )}

            {/* Options */}
            <View style={styles.optionsGrid}>
              {question.options.map((opt) => (
                <View
                  key={opt.label}
                  style={[
                    styles.optionItem,
                    opt.isCorrect && styles.optionCorrect,
                    opt.isSelected && !opt.isCorrect && styles.optionIncorrect,
                  ]}
                >
                  <View style={styles.optionRow}>
                    <View
                      style={[
                        styles.optionLabel,
                        opt.isCorrect && styles.optionLabelCorrect,
                        opt.isSelected && !opt.isCorrect && styles.optionLabelIncorrect,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLabelText,
                          (opt.isCorrect || (opt.isSelected && !opt.isCorrect)) &&
                            styles.optionLabelTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    <View style={styles.optionTextWrap}>
                      <Text
                        style={[
                          styles.optionText,
                          opt.isCorrect && styles.optionTextCorrect,
                          opt.isSelected && !opt.isCorrect && styles.optionTextIncorrect,
                        ]}
                      >
                        {opt.text}
                      </Text>
                      {opt.subtext && (
                        <Text style={styles.optionSubtext}>{opt.subtext}</Text>
                      )}
                    </View>
                  </View>
                  {opt.isCorrect && (
                    <View style={styles.checkIcon}>
                      <Text style={styles.checkIconText}>✓</Text>
                    </View>
                  )}
                  {opt.isSelected && !opt.isCorrect && (
                    <View style={styles.crossIcon}>
                      <Text style={styles.crossIconText}>✗</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Explanation */}
            {question.explanation && (
              <View style={styles.explanationBox}>
                <View style={styles.explanationHeader}>
                  <View style={styles.explanationDot} />
                  <Text style={styles.explanationTitle}>Explanation</Text>
                  <Text style={styles.explanationResult}>
                    Wrong — Correct: B
                  </Text>
                </View>
                <Text style={styles.explanationText}>
                  {question.explanation}
                </Text>
                <TouchableOpacity style={styles.videoLink}>
                  <Text style={styles.videoLinkText}>▶ Watch video explanation</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.prevBtn}>
                <Text style={styles.actionBtnText}>‹ Previous</Text>
              </TouchableOpacity>
              <View style={styles.actionRight}>
                <TouchableOpacity style={styles.flagActionBtn}>
                  <Text style={styles.flagActionText}>🚩 Flag</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipBtn}>
                  <Text style={styles.actionBtnText}>Skip ›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextBtnLarge}>
                  <Text style={styles.nextBtnLargeText}>
                    Next Question ›
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Tip */}
          <View style={styles.tipBanner}>
            <Text style={styles.tipBannerIcon}>💡</Text>
            <Text style={styles.tipBannerBold}>Quick Tip: </Text>
            <Text style={styles.tipBannerText}>
              Profit & Loss formula: Profit% = (Profit / Cost Price) × 100.
              Remember: always find cost price first!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  progressBarRow: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  progressLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4b5563',
  },
  sectionProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 16,
  },
  sectionProgressBar: {
    width: 60,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sectionProgressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  sectionProgressLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#9ca3af',
    alignSelf: 'flex-end',
  },
  mainRow: {
    flexDirection: 'row',
    gap: 16,
  },
  // Navigator
  navigatorColumn: {
    width: 200,
  },
  navigatorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navigatorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 10,
  },
  legendRow: {
    gap: 6,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
  },
  navigatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  navItem: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemText: {
    fontSize: 10,
  },
  submitBtn: {
    backgroundColor: '#1a2332',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  submitInfo: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 6,
  },
  // Question
  questionColumn: {
    flex: 1,
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qBadge: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qBadgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  subjectBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  topicBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topicBadgeText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
  },
  flagBtn: {
    padding: 6,
  },
  flagBtnText: {
    fontSize: 12,
    color: '#6b7280',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 6,
  },
  questionEnglish: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  optionsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  optionIncorrect: {
    backgroundColor: '#fef2f2',
    borderColor: '#f87171',
    borderWidth: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelCorrect: {
    backgroundColor: '#22c55e',
  },
  optionLabelIncorrect: {
    backgroundColor: '#f87171',
  },
  optionLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b7280',
  },
  optionLabelTextActive: {
    color: '#ffffff',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#15803d',
  },
  optionTextIncorrect: {
    color: '#991b1b',
    textDecorationLine: 'line-through',
  },
  optionSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
  },
  crossIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f87171',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIconText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
  },
  // Explanation
  explanationBox: {
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  explanationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
  explanationResult: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
    marginLeft: 'auto',
  },
  explanationText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },
  videoLink: {
    marginTop: 8,
  },
  videoLinkText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  // Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  prevBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  actionRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  flagActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fefce8',
    borderRadius: 10,
  },
  flagActionText: {
    fontSize: 12,
    color: '#a16207',
    fontWeight: '600',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
  },
  nextBtnLarge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#1a2332',
    borderRadius: 10,
  },
  nextBtnLargeText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '800',
  },
  // Tip
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  tipBannerIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  tipBannerBold: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '800',
  },
  tipBannerText: {
    fontSize: 12,
    color: '#1e3a8a',
    flex: 1,
    lineHeight: 18,
  },
});
