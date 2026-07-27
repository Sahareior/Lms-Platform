import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────
interface StatItem {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

interface CourseItem {
  title: string;
  chapter: string;
  progress: number;
}

interface DashboardProps {
  userName?: string;
  greeting?: string;
  stats?: StatItem[];
  examTabs?: string[];
  activeTab?: string;
  courses?: CourseItem[];
  mockExamTitle?: string;
  mockExamDescription?: string;
  aiSuggestions?: string[];
}

// ─── Default Data ─────────────────────────────────────────
const defaultStats: StatItem[] = [
  { title: 'Courses Enrolled', value: 8, icon: '📚', color: '#3b82f6' },
  { title: 'Quizzes Completed', value: 142, icon: '✅', color: '#22c55e' },
  { title: 'Mock Exams Taken', value: 23, icon: '📝', color: '#eab308' },
  { title: 'Current Rank', value: '#847', icon: '🏆', color: '#10b981' },
];

const defaultCourses: CourseItem[] = [
  { title: 'Bangladesh Affairs', chapter: 'Liberation War', progress: 68 },
  { title: 'General Mathematics', chapter: 'Algebra Basics', progress: 45 },
  { title: 'English Grammar', chapter: 'Tense & Voice', progress: 82 },
  { title: 'General Knowledge', chapter: 'International Org.', progress: 31 },
];

// ─── Component ────────────────────────────────────────────
export default function Dashboard({
  userName = 'Rahim',
  greeting = "Let's crush your BCS preparation today.",
  stats = defaultStats,
  examTabs = ['BCS', 'Bank Job', 'Primary Teacher', 'NTRCA', 'Other Govt Job'],
  activeTab = 'BCS',
  courses = defaultCourses,
  mockExamTitle = 'BCS 47th Full Mock',
  mockExamDescription = 'General Knowledge + Math + English',
  aiSuggestions = [
    'Bangladesh Constitution — Article 70',
    'Ratio & Proportion Problems',
    'Bangla Grammar — Sandhi',
    'English Prepositions & Usage',
  ],
}: DashboardProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back, {userName}!</Text>
          <Text style={styles.greetingText}>{greeting}</Text>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search topics, questions..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Exam Type Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsRow}
        contentContainerStyle={styles.tabsContent}
      >
        {examTabs.map((tab, i) => (
          <TouchableOpacity key={i} style={styles.tab}>
            <Text
              style={[
                styles.tabText,
                tab === activeTab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {tab === activeTab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((item, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.statIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statTitle}>{item.title}</Text>
          </View>
        ))}
      </View>

      {/* Content Grid */}
      <View style={styles.contentGrid}>
        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coursesGrid}>
            {courses.map((course, index) => (
              <View key={index} style={styles.courseCard}>
                <View style={styles.courseThumbnail} />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseChapter}>{course.chapter}</Text>

                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercent}>{course.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${course.progress}%` as any },
                      ]}
                    />
                  </View>

                  <TouchableOpacity style={styles.resumeBtn}>
                    <Text style={styles.resumeBtnText}>Resume Learning</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Right Side */}
        <View style={styles.rightSidebar}>
          {/* Mock Exam Card */}
          <View style={styles.mockExamCard}>
            <Text style={styles.mockExamBadge}>TODAY'S MOCK EXAM</Text>
            <Text style={styles.mockExamTitle}>{mockExamTitle}</Text>
            <Text style={styles.mockExamDesc}>{mockExamDescription}</Text>

            <View style={styles.timerRow}>
              {['02', '45', '00'].map((t, i) => (
                <View key={i} style={styles.timerBlock}>
                  <Text style={styles.timerNumber}>{t}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.startExamBtn}>
              <Text style={styles.startExamBtnText}>Start Exam Now</Text>
            </TouchableOpacity>
          </View>

          {/* AI Recommended */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>🧠</Text>
              <Text style={styles.aiTitle}>AI Recommended</Text>
            </View>
            {aiSuggestions.map((item, index) => (
              <View key={index} style={styles.aiSuggestion}>
                <Text style={styles.aiSuggestionText}>{item}</Text>
                <Text style={styles.aiSuggestionSub}>
                  Recommended for improvement
                </Text>
              </View>
            ))}
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
    backgroundColor: '#f4f4f2',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  greetingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
  },
  tabsRow: {
    marginBottom: 24,
  },
  tabsContent: {
    gap: 24,
  },
  tab: {
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#1e293b',
  },
  activeTabIndicator: {
    height: 2,
    backgroundColor: '#22c55e',
    marginTop: 4,
    borderRadius: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  contentGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  coursesSection: {
    flex: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  courseCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courseThumbnail: {
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  courseChapter: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressPercent: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  resumeBtn: {
    backgroundColor: '#dcfce7',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  resumeBtnText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 13,
  },
  rightSidebar: {
    flex: 1,
    gap: 20,
  },
  mockExamCard: {
    backgroundColor: '#182a5c',
    borderRadius: 24,
    padding: 24,
  },
  mockExamBadge: {
    color: '#4ade80',
    fontWeight: '800',
    fontSize: 11,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  mockExamTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  mockExamDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 20,
  },
  timerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timerBlock: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    width: 72,
  },
  timerNumber: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  startExamBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  startExamBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  aiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  aiIcon: {
    fontSize: 20,
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
  },
  aiSuggestion: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  aiSuggestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  aiSuggestionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
