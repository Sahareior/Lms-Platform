import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// ─── Types ───────────────────────────────────────────────
interface StatItem {
  number: string;
  label: string;
  icon: string;
  color: string;
}

interface FrequencyTopic {
  name: string;
  count: number;
}

interface SubjectDistItem {
  label: string;
  count: number;
  color: string;
}

interface AITopic {
  id: number;
  title: string;
  sub: string;
  freq: string;
  time: string;
  level: 'High' | 'Medium' | 'Low';
}

interface QuestionPatternsProps {
  stats?: StatItem[];
  frequencyTopics?: FrequencyTopic[];
  subjectDistribution?: SubjectDistItem[];
  aiTopics?: AITopic[];
}

// ─── Default Data ─────────────────────────────────────────
const defaultStats: StatItem[] = [
  { number: '8,200+', label: 'Total Questions Analyzed', icon: '📊', color: '#eff6ff' },
  { number: '312', label: 'Unique Topics Identified', icon: '📈', color: '#eef2ff' },
  { number: '+23%', label: 'Avg. Accuracy Gain', icon: '🎯', color: '#f0fdf4' },
  { number: '45', label: 'Exams Covered', icon: '📝', color: '#fff7ed' },
  { number: '91%', label: 'Top Predicted Accuracy', icon: '✅', color: '#faf5ff' },
];

const defaultFrequencyTopics: FrequencyTopic[] = [
  { name: 'বাংলাদেশ (চট্টগ্রাম)', count: 47 },
  { name: 'Profit & Loss — Math', count: 42 },
  { name: 'Bangladesh Constitution', count: 38 },
  { name: 'English Prepositions', count: 35 },
  { name: 'Liberation War 1971', count: 33 },
];

const defaultSubjectDistribution: SubjectDistItem[] = [
  { label: 'Bangla', count: 44, color: '#22c55e' },
  { label: 'English', count: 36, color: '#ec4899' },
  { label: 'Math', count: 30, color: '#3b82f6' },
  { label: 'General Knowledge', count: 30, color: '#eab308' },
  { label: 'BD Affairs', count: 28, color: '#ef4444' },
];

const defaultAITopics: AITopic[] = [
  { id: 1, title: 'বাংলা সাহিত্যের ইতিহাস ও ধারা', sub: 'Bangla Literature', freq: '47 Times', time: '8:45h', level: 'High' },
  { id: 2, title: 'Profit, Loss & Percentage — Word Problems', sub: 'Mathematics', freq: '42 Times', time: '8:45h', level: 'High' },
  { id: 3, title: 'Bangladesh Constitution — Fundamental Rights', sub: 'Bangladesh Affairs', freq: '38 Times', time: '8:45h', level: 'High' },
  { id: 4, title: 'English — Correction & Prepositions', sub: 'English', freq: '35 Times', time: '8:45h', level: 'Medium' },
  { id: 5, title: 'Liberation War — Timeline & Key Events', sub: 'Bangladesh Affairs', freq: '33 Times', time: '8:45h', level: 'Medium' },
  { id: 6, title: 'Computer Networks & Internet Basics', sub: 'Science & ICT', freq: '21 Times', time: '8:45h', level: 'Low' },
];

// ─── Helpers ─────────────────────────────────────────────
const donutSegments = [
  { percent: 44, color: '#22c55e', offset: 0 },
  { percent: 18, color: '#ec4899', offset: 44 },
  { percent: 15, color: '#3b82f6', offset: 62 },
  { percent: 15, color: '#eab308', offset: 77 },
  { percent: 8, color: '#ef4444', offset: 92 },
];

// ─── Component ────────────────────────────────────────────
export default function QuestionPatterns({
  stats = defaultStats,
  frequencyTopics = defaultFrequencyTopics,
  subjectDistribution = defaultSubjectDistribution,
  aiTopics = defaultAITopics,
}: QuestionPatternsProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Text style={styles.headerIcon}>💡</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Question Pattern Analysis</Text>
            <Text style={styles.headerSub}>
              Analyze past exam trends and discover high-probability topics
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.analyzeBadge}>
            <View style={styles.analyzeDot} />
            <Text style={styles.analyzeText}>10 years</Text>
            <View style={styles.analyzeDivider} />
            <Text style={styles.analyzeText}>45 exams</Text>
            <View style={styles.analyzeDivider} />
            <Text style={styles.analyzeText}>8,200+ questions</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={styles.downloadBtnText}>📄 Download PDF Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersCard}>
        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Exam Type</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity style={styles.chipActive}>
                <Text style={styles.chipActiveText}>BCS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>Bank Job</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>Primary Teacher</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Subject</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity style={styles.chipActiveGreen}>
                <Text style={styles.chipActiveGreenText}>Bangla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chipActiveGreen}>
                <Text style={styles.chipActiveGreenText}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chipActiveGreen}>
                <Text style={styles.chipActiveGreenText}>Math</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chipInactive}>
                <Text style={styles.chipInactiveText}>GK</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsRow}
      >
        {stats.map((stat, i) => (
          <View key={i} style={styles.statPill}>
            <View style={[styles.statPillIcon, { backgroundColor: stat.color }]}>
              <Text style={styles.statPillEmoji}>{stat.icon}</Text>
            </View>
            <View>
              <Text style={styles.statPillNumber}>{stat.number}</Text>
              <Text style={styles.statPillLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Charts Row */}
      <View style={styles.chartsRow}>
        {/* Most Repeated Topics */}
        <View style={styles.chartCard}>
          <View style={styles.chartCardHeader}>
            <Text style={styles.chartCardTitle}>Most Repeated Topics</Text>
            <Text style={styles.chartCardSub}>50 Topics (BCS Previous 40)</Text>
          </View>
          <View style={styles.frequencyList}>
            {frequencyTopics.map((topic, idx) => (
              <View key={idx} style={styles.freqItem}>
                <View style={styles.freqBarTrack}>
                  <View
                    style={[
                      styles.freqBarFill,
                      {
                        width: `${(topic.count / 47) * 100}%` as any,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.freqName} numberOfLines={1}>
                  {topic.name}
                </Text>
                <Text style={styles.freqCount}>{topic.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subject Distribution (Donut) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Subject-wise Distribution</Text>
          <Text style={styles.chartCardSub}>BCS Previous 40 (2015-2024)</Text>
          <View style={styles.donutContainer}>
            {/* Simple Donut representation using colored blocks */}
            <View style={styles.donutBlock}>
              {subjectDistribution.map((item, idx) => (
                <View key={idx} style={styles.donutSegmentRow}>
                  <View
                    style={[
                      styles.donutColorBlock,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={styles.donutLabel}>{item.label}</Text>
                  <Text style={styles.donutCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Topic Frequency Trend */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Topic Frequency Trend</Text>
          <Text style={styles.chartCardSub}>Year-wise question distribution</Text>
          <LineChart
            data={{
              labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
              datasets: [
                { data: [20, 40, 30, 60, 25, 50, 35, 45], color: () => '#22c55e', strokeWidth: 2 },
                { data: [40, 30, 50, 70, 40, 60, 30, 50], color: () => '#3b82f6', strokeWidth: 2 },
                { data: [60, 50, 35, 45, 65, 40, 55, 35], color: () => '#ec4899', strokeWidth: 2 },
              ],
              legend: ['Bangla', 'English', 'Math'],
            }}
            width={screenWidth / 2 - 40}
            height={160}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              labelColor: () => '#9ca3af',
              propsForBackgroundLines: { strokeDasharray: '3,3', stroke: '#f1f5f9' },
              propsForDots: { r: '3' },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.trendInsight}>
            <Text style={styles.trendInsightText}>
              ⚡ English Prepositions has appeared in every BCS exam since 2016 — Highest consistency.
            </Text>
          </View>
        </View>
      </View>

      {/* AI Predicted High-Probability Topics */}
      <View style={styles.aiSection}>
        <View style={styles.aiSectionHeader}>
          <View style={styles.aiIconWrap}>
            <Text style={styles.aiIconText}>AI</Text>
          </View>
          <Text style={styles.aiSectionTitle}>
            AI Predicted High-Probability Topics
          </Text>
          <Text style={styles.aiSectionSub}>
            For Next BCS Exam • Based on 2015-2024
          </Text>
        </View>

        <View style={styles.aiLevelLegend}>
          <View style={styles.levelItem}>
            <View style={[styles.levelDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.levelText}>High</Text>
          </View>
          <View style={styles.levelItem}>
            <View style={[styles.levelDot, { backgroundColor: '#eab308' }]} />
            <Text style={styles.levelText}>Medium</Text>
          </View>
          <View style={styles.levelItem}>
            <View style={[styles.levelDot, { backgroundColor: '#d1d5db' }]} />
            <Text style={styles.levelText}>Low</Text>
          </View>
        </View>

        <View style={styles.aiTopicsGrid}>
          {aiTopics.map((topic) => (
            <View key={topic.id} style={styles.aiTopicCard}>
              <View style={styles.aiTopicHeader}>
                <View style={styles.aiTopicNum}>
                  <Text style={styles.aiTopicNumText}>{topic.id}</Text>
                </View>
                <Text style={styles.aiTopicTitle} numberOfLines={2}>
                  {topic.title}
                </Text>
                <View
                  style={[
                    styles.levelBadge,
                    topic.level === 'High' && styles.levelHigh,
                    topic.level === 'Medium' && styles.levelMedium,
                    topic.level === 'Low' && styles.levelLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.levelBadgeText,
                      topic.level === 'High' && styles.levelHighText,
                      topic.level === 'Medium' && styles.levelMediumText,
                      topic.level === 'Low' && styles.levelLowText,
                    ]}
                  >
                    {topic.level}
                  </Text>
                </View>
              </View>
              <Text style={styles.aiTopicSub}>{topic.sub}</Text>
              <View style={styles.aiTopicFooter}>
                <Text style={styles.aiTopicFreq}>{topic.freq}</Text>
                <Text style={styles.aiTopicTime}>⏱️ {topic.time}</Text>
                <TouchableOpacity style={styles.aiTopicPracticeBtn}>
                  <Text style={styles.aiTopicPracticeText}>
                    Practice This Topic
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer Banner */}
      <View style={styles.footerBanner}>
        <View style={styles.footerBannerIcon}>
          <Text style={styles.footerBannerIconText}>📄</Text>
        </View>
        <View style={styles.footerBannerContent}>
          <Text style={styles.footerBannerTitle}>
            Download Full Pattern Analysis Report
          </Text>
          <Text style={styles.footerBannerSub}>
            PDF • 28 pages • BCS 2015-2024 • Includes chapter-wise breakdown & predictions.
          </Text>
        </View>
        <View style={styles.footerBannerActions}>
          <TouchableOpacity style={styles.previewBtn}>
            <Text style={styles.previewBtnText}>Preview Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadPdfBtn}>
            <Text style={styles.downloadPdfBtnText}>📥 Download PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSub: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  headerRight: {
    gap: 10,
  },
  analyzeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  analyzeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  analyzeText: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: '700',
  },
  analyzeDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#bbf7d0',
  },
  downloadBtn: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  downloadBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filtersRow: {
    gap: 14,
  },
  filterGroup: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipActiveText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  chipInactive: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipInactiveText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  chipActiveGreen: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipActiveGreenText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
  },
  statsRow: {
    marginBottom: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginRight: 10,
    minWidth: 160,
  },
  statPillIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPillEmoji: {
    fontSize: 14,
  },
  statPillNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  statPillLabel: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '600',
  },
  chartsRow: {
    gap: 14,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  chartCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  chartCardSub: {
    fontSize: 9,
    color: '#9ca3af',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
  },
  // Frequency list
  frequencyList: {
    gap: 8,
  },
  freqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freqBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  freqBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  freqName: {
    fontSize: 11,
    color: '#4b5563',
    flex: 1,
    marginLeft: 4,
  },
  freqCount: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '800',
    width: 24,
    textAlign: 'right',
  },
  // Donut
  donutContainer: {
    marginTop: 8,
  },
  donutBlock: {
    gap: 6,
  },
  donutSegmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donutColorBlock: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  donutLabel: {
    flex: 1,
    fontSize: 11,
    color: '#4b5563',
  },
  donutCount: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '800',
  },
  // Trend insight
  trendInsight: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  trendInsightText: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: '600',
  },
  // AI Section
  aiSection: {
    marginTop: 8,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  aiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  aiSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  aiSectionSub: {
    fontSize: 10,
    color: '#9ca3af',
  },
  aiLevelLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  aiTopicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  aiTopicCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  aiTopicHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  aiTopicNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTopicNumText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '800',
  },
  aiTopicTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelHigh: {
    backgroundColor: '#dcfce7',
  },
  levelMedium: {
    backgroundColor: '#fef9c3',
  },
  levelLow: {
    backgroundColor: '#f3f4f6',
  },
  levelBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  levelHighText: { color: '#15803d' },
  levelMediumText: { color: '#a16207' },
  levelLowText: { color: '#6b7280' },
  aiTopicSub: {
    fontSize: 9,
    color: '#9ca3af',
    marginBottom: 8,
  },
  aiTopicFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  aiTopicFreq: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '700',
  },
  aiTopicTime: {
    fontSize: 9,
    color: '#9ca3af',
  },
  aiTopicPracticeBtn: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  aiTopicPracticeText: {
    fontSize: 8,
    color: '#15803d',
    fontWeight: '800',
  },
  // Footer
  footerBanner: {
    backgroundColor: '#1a2332',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  footerBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBannerIconText: {
    fontSize: 20,
  },
  footerBannerContent: {
    flex: 1,
  },
  footerBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  footerBannerSub: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  footerBannerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  previewBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  previewBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  downloadPdfBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  downloadPdfBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '800',
  },
});
