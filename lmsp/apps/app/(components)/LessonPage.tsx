import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────
interface Lesson {
  title: string;
  duration: string;
  completed?: boolean;
  isCurrent?: boolean;
  locked?: boolean;
}

interface Section {
  title: string;
  expanded?: boolean;
  lessons: Lesson[];
}

interface ProgressStat {
  icon: string;
  value: string;
  label: string;
  color: string;
}

interface LessonPageProps {
  courseTitle?: string;
  instructor?: string;
  sections?: Section[];
  progressPercent?: number;
  progressStats?: ProgressStat[];
}

// ─── Default Data ─────────────────────────────────────────
const defaultSections: Section[] = [
  {
    title: 'Section 1: ভাষা আন্দোলন (ভাষা)',
    expanded: true,
    lessons: [
      { title: 'ভূমিকা এবং পরিচিতি', duration: '8:30', completed: true },
      { title: 'আন্দোলনের প্রাথমিক পর্ব', duration: '22:00', completed: true },
      { title: '২১ ফেব্রুয়ারির ঘটনা', duration: '19:15', completed: true },
      { title: 'ভাষা আন্দোলনের ফলাফল ও প্রভাব', duration: '18:00', isCurrent: true },
      { title: 'সাংস্কৃতিক প্রভাব ও দলিল', duration: '24:00', locked: true },
    ],
  },
  {
    title: 'Section 2: বাংলা ভাষার বিকাশ',
    expanded: false,
    lessons: [
      { title: 'বাংলা ভাষার উৎপত্তি', duration: '25:00', locked: true },
    ],
  },
];

const defaultProgressStats: ProgressStat[] = [
  { icon: '✅', value: '3', label: 'Lessons Done', color: '#22c55e' },
  { icon: '⏱️', value: '2h 16m', label: 'Time Spent', color: '#3b82f6' },
  { icon: '📊', value: '82%', label: 'Quiz Score', color: '#eab308' },
  { icon: '🔥', value: '7 days', label: 'Streak', color: '#ef4444' },
];

// ─── Component ────────────────────────────────────────────
export default function LessonPage({
  courseTitle = 'ভাষা আন্দোলন ও বাঙালি জাতীয়তাবাদ',
  instructor = 'Prof. Abdur Rahman',
  sections = defaultSections,
  progressPercent = 38,
  progressStats = defaultProgressStats,
}: LessonPageProps) {
  const [activeTab, setActiveTab] = useState('Notes');
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const tabs = ['Overview', 'Notes', 'Ask AI', 'Resources'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Video Player Placeholder */}
      <View style={styles.videoPlayer}>
        <View style={styles.videoOverlay}>
          <TouchableOpacity style={styles.playBtn}>
            <Text style={styles.playIcon}>▶</Text>
          </TouchableOpacity>
          <Text style={styles.videoTitle}>{courseTitle}</Text>
          <Text style={styles.videoInstructor}>{instructor}</Text>
        </View>
      </View>

      {/* Lesson Nav & Tabs */}
      <View style={styles.tabSection}>
        <View style={styles.lessonNav}>
          <TouchableOpacity>
            <Text style={styles.navBtn}>‹ Previous Lesson</Text>
          </TouchableOpacity>
          <View style={styles.lessonIndicator}>
            <Text style={styles.lessonNum}>Lesson 4</Text>
            <View style={styles.dotRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === 3 && styles.dotActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.lessonOf}>of 10</Text>
          </View>
          <TouchableOpacity style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>Next Lesson ›</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content Row */}
      <View style={styles.mainRow}>
        {/* Left Column: Content */}
        <View style={styles.leftColumn}>
          {/* Notes Tab Content */}
          {activeTab === 'Notes' && (
            <View style={styles.notesSection}>
              <View style={styles.notesHeader}>
                <Text style={styles.notesTitle}>My Notes - Lesson 4</Text>
                <TouchableOpacity style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>✓ Saved</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.notesEditor}>
                <View style={styles.editorToolbar}>
                  {['B', 'I', 'U', '|', '≡', '☰', '|', '🖼', '🔗', '🎤'].map(
                    (tool, i) => (
                      <TouchableOpacity key={i} style={styles.toolBtn}>
                        <Text style={styles.toolBtnText}>{tool}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
                <View style={styles.notesContent}>
                  <Text style={styles.noteItem}>
                    • ভাষা আন্দোলন ১৯৫২ সালে সংঘটিত হয়।
                  </Text>
                  <Text style={styles.noteItem}>
                    • ২১ ফেব্রুয়ারি আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে স্বীকৃত।
                  </Text>
                  <Text style={styles.noteItem}>
                    • মুক্তিযুদ্ধের পূর্বে ভাষা আন্দোলন বাংলার মানুষের জাতীয়তাবাদী
                    চেতনাকে শক্তিশালী করে।
                  </Text>
                  <Text style={styles.noteItem}>
                    • রাষ্ট্রভাষা বাংলার দাবিতে ছাত্র-জনতার আন্দোলন গুরুত্বপূর্ণ
                    ভূমিকা পালন করে।
                  </Text>
                  <Text style={styles.noteTimestamp}>
                    Last saved 3 minutes ago
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Ask AI Tab Content */}
          {activeTab === 'Ask AI' && (
            <View style={styles.askAiSection}>
              <View style={styles.askAiHeader}>
                <View style={styles.aiLabel}>
                  <Text style={styles.aiLabelText}>A</Text>
                </View>
                <Text style={styles.askAiTitle}>Ask AI</Text>
                <Text style={styles.askAiContext}>
                  Based on Lesson 4 content
                </Text>
              </View>

              <View style={styles.chatMessages}>
                <View style={styles.aiChatBubble}>
                  <View style={styles.aiChatRow}>
                    <View style={styles.aiChatDot}>
                      <Text style={styles.aiChatDotText}>A</Text>
                    </View>
                    <View style={styles.aiChatContent}>
                      <Text style={styles.aiChatText}>
                        ভাষা আন্দোলন (১৯৫২) ছিল পূর্ব পাকিস্তানে (বর্তমান
                        বাংলাদেশ) সংঘটিত একটি ঐতিহাসিক রাজনৈতিক ও সাংস্কৃতিক
                        আন্দোলন।
                      </Text>
                      <Text style={styles.chatTime}>10:27 AM</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.userChatBubble}>
                  <View style={styles.userChatContent}>
                    <Text style={styles.userChatText}>
                      ভাষা আন্দোলন কীভাবে আমাদের স্বাধীনতার পথকে আরও সুদৃঢ়
                      করেছিল?
                    </Text>
                    <Text style={styles.chatTimeRight}>10:29 AM</Text>
                  </View>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>R</Text>
                  </View>
                </View>
              </View>

              <View style={styles.chatInput}>
                <TextInput
                  placeholder="Ask anything about this lesson..."
                  placeholderTextColor="#9ca3af"
                  style={styles.chatTextInput}
                />
                <TouchableOpacity style={styles.chatSendBtn}>
                  <Text style={styles.chatSendText}>↑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Overview / Resources tabs would go here */}
          {activeTab !== 'Notes' && activeTab !== 'Ask AI' && (
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTabText}>
                {activeTab} content would appear here.
              </Text>
            </View>
          )}
        </View>

        {/* Right Column: Course Curriculum */}
        <View style={styles.rightColumn}>
          {/* Course Curriculum */}
          <View style={styles.curriculumCard}>
            <View style={styles.curriculumHeader}>
              <Text style={styles.curriculumTitle}>Course Curriculum</Text>
              <Text style={styles.curriculumPercent}>
                {progressPercent}% complete
              </Text>
            </View>
            <View style={styles.curriculumProgressBar}>
              <View
                style={[
                  styles.curriculumProgressFill,
                  { width: `${progressPercent}%` as any },
                ]}
              />
            </View>

            {sections.map((section, idx) => (
              <View key={idx} style={styles.sectionBlock}>
                <TouchableOpacity
                  onPress={() => toggleSection(idx)}
                  style={styles.sectionHeader}
                >
                  <Text style={styles.sectionToggle}>
                    {expandedSections.includes(idx) ? '▼' : '▶'}
                  </Text>
                  <Text style={styles.sectionTitle} numberOfLines={2}>
                    {section.title}
                  </Text>
                  <Text style={styles.sectionMeta}>
                    {section.lessons.length} lessons
                  </Text>
                </TouchableOpacity>

                {expandedSections.includes(idx) && (
                  <View style={styles.lessonList}>
                    {section.lessons.map((lesson, lIdx) => (
                      <View
                        key={lIdx}
                        style={[
                          styles.lessonItem,
                          lesson.isCurrent && styles.lessonItemCurrent,
                        ]}
                      >
                        {lesson.completed ? (
                          <Text style={styles.lessonStatusComplete}>✓</Text>
                        ) : lesson.locked ? (
                          <Text style={styles.lessonStatusLocked}>○</Text>
                        ) : (
                          <Text style={styles.lessonStatusPlaying}>▶</Text>
                        )}
                        <Text
                          style={[
                            styles.lessonTitle,
                            lesson.isCurrent && styles.lessonTitleCurrent,
                            lesson.locked && styles.lessonTitleLocked,
                          ]}
                          numberOfLines={1}
                        >
                          {lesson.title}
                        </Text>
                        <Text
                          style={[
                            styles.lessonDuration,
                            lesson.isCurrent && styles.lessonTitleCurrent,
                          ]}
                        >
                          {lesson.isCurrent
                            ? 'Now Playing'
                            : lesson.duration}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Progress Stats */}
          <View style={styles.progressCard}>
            <Text style={styles.progressCardTitle}>Your Progress</Text>
            <View style={styles.progressStatsGrid}>
              {progressStats.map((stat, idx) => (
                <View key={idx} style={styles.progressStatItem}>
                  <View style={styles.progressStatIconWrap}>
                    <Text style={styles.progressStatIcon}>{stat.icon}</Text>
                    <Text style={styles.progressStatValue}>{stat.value}</Text>
                  </View>
                  <Text style={styles.progressStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.practiceBtn}>
              <Text style={styles.practiceBtnText}>
                ✏️ Take Practice Quiz for This Lesson
              </Text>
            </TouchableOpacity>
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
    paddingBottom: 40,
  },
  videoPlayer: {
    height: 260,
    backgroundColor: '#111b29',
    justifyContent: 'flex-end',
  },
  videoOverlay: {
    padding: 20,
    alignItems: 'center',
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  playIcon: {
    fontSize: 24,
    color: '#ffffff',
    marginLeft: 3,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  videoInstructor: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  tabSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  lessonIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  dotActive: {
    backgroundColor: '#6b7280',
  },
  lessonOf: {
    fontSize: 10,
    color: '#9ca3af',
  },
  nextBtn: {
    backgroundColor: '#0a1a2b',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nextBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  tab: {
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1e293b',
    fontWeight: '700',
  },
  mainRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  leftColumn: {
    flex: 2,
  },
  notesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  notesEditor: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fafafa',
  },
  toolBtn: {
    padding: 2,
  },
  toolBtnText: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesContent: {
    padding: 12,
    minHeight: 100,
  },
  noteItem: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 22,
  },
  noteTimestamp: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 8,
  },
  // Ask AI
  askAiSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  askAiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  aiLabel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabelText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '800',
  },
  askAiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  askAiContext: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 'auto',
  },
  chatMessages: {
    gap: 14,
    paddingVertical: 14,
  },
  // AI chat bubble
  aiChatBubble: {},
  aiChatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  aiChatDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiChatDotText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '800',
  },
  aiChatContent: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 4,
  },
  aiChatText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  chatTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 6,
  },
  // User chat bubble
  userChatBubble: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  userChatContent: {
    backgroundColor: '#0e1b2e',
    padding: 12,
    borderRadius: 12,
    borderTopRightRadius: 4,
    maxWidth: '80%',
  },
  userChatText: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 20,
  },
  chatTimeRight: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 6,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '700',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  chatTextInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#374151',
  },
  chatSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chatSendText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyTab: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyTabText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  // Right column
  rightColumn: {
    flex: 1,
    gap: 16,
  },
  curriculumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  curriculumTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  curriculumPercent: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  curriculumProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  curriculumProgressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  sectionBlock: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionToggle: {
    fontSize: 10,
    color: '#6b7280',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionMeta: {
    fontSize: 10,
    color: '#9ca3af',
  },
  lessonList: {
    marginTop: 8,
    gap: 8,
    paddingLeft: 10,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    borderRadius: 8,
  },
  lessonItemCurrent: {
    backgroundColor: '#f0fdf4',
  },
  lessonStatusComplete: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '700',
  },
  lessonStatusLocked: {
    fontSize: 14,
    color: '#d1d5db',
  },
  lessonStatusPlaying: {
    fontSize: 12,
    color: '#22c55e',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 11,
    color: '#6b7280',
  },
  lessonTitleCurrent: {
    color: '#15803d',
    fontWeight: '700',
  },
  lessonTitleLocked: {
    color: '#d1d5db',
  },
  lessonDuration: {
    fontSize: 10,
    color: '#9ca3af',
  },
  // Progress
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  progressCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  progressStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  progressStatItem: {
    width: '47%',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 10,
  },
  progressStatIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  progressStatIcon: {
    fontSize: 14,
  },
  progressStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  progressStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  practiceBtn: {
    backgroundColor: '#dcfce7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  practiceBtnText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '700',
  },
});
