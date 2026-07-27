import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// ─── Types ───────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  trend: 'up' | 'down';
}

interface SubjectRow {
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
  trend: string;
  isWeak?: boolean;
  isCritical?: boolean;
}

interface PerfomenceProps {
  userName?: string;
  userTarget?: string;
  stats?: StatCard[];
  subjectData?: SubjectRow[];
}

// ─── Default Data ─────────────────────────────────────────
const defaultStats: StatCard[] = [
  { label: 'Overall Accuracy', value: '78.4 %', sub: '+4.2% vs last month', icon: '🎯', trend: 'up' },
  { label: 'Questions Attempted', value: '3,842', sub: '+288 this week', icon: '📚', trend: 'up' },
  { label: 'Avg Time / Question', value: '42 sec', sub: '-6 sec faster', icon: '⏱️', trend: 'up' },
  { label: 'National Rank', value: '#2,148', sub: '↑ 412 ranks', icon: '👥', trend: 'up' },
];

const defaultSubjectData: SubjectRow[] = [
  { subject: 'BD Affairs', attempted: 684, correct: 602, accuracy: 88, trend: '+6%' },
  { subject: 'Bangla', attempted: 812, correct: 666, accuracy: 82, trend: '+3%' },
  { subject: 'Computer', attempted: 428, correct: 338, accuracy: 79, trend: '+2%' },
  { subject: 'General Knowledge', attempted: 552, correct: 408, accuracy: 74, trend: '0%' },
  { subject: 'English', attempted: 496, correct: 317, accuracy: 64, trend: '-3%', isWeak: true },
  { subject: 'International Affairs', attempted: 342, correct: 209, accuracy: 61, trend: '-5%', isWeak: true },
  { subject: 'Math', attempted: 528, correct: 290, accuracy: 55, trend: '-8%', isCritical: true },
];

// ─── Chart Config ─────────────────────────────────────────
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity: number = 1) => `rgba(34, 197, 94, ${opacity})`,
  labelColor: (opacity: number = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: { borderRadius: 12 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#22c55e' },
  propsForBackgroundLines: { strokeDasharray: '3,3', stroke: '#f1f5f9' },
};

// ─── Component ────────────────────────────────────────────
export default function Perfomence({
  userName = 'Rahim Ahmed',
  userTarget = 'BCS 47th',
  stats = defaultStats,
  subjectData = defaultSubjectData,
}: PerfomenceProps) {
  // Radar chart data
  const radarLabels = ['Bangla', 'English', 'Math', 'GK', 'Comp/IT', 'Intl'];
  const radarValues = [82, 65, 55, 75, 78, 61];

  // Line chart data
  const lineLabels = ['Oct 25', 'Oct 27', 'Oct 29', 'Oct 31', 'Nov 02', 'Nov 04', 'Nov 06', 'Nov 08', 'Nov 10', 'Nov 12'];
  const lineData = [62, 68, 58, 72, 70, 75, 78, 80, 82, 85];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RA</Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.targetBadge}>
                <Text style={styles.targetBadgeText}>🎯 Target: {userTarget}</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>
              Performance Analytics • Last 30 days • Updated 12 min ago
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>📅 Last 30 days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportBtnText}>📥 Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <View key={idx} style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statIcon}>{stat.icon}</Text>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text
              style={[
                styles.statTrend,
                { color: stat.trend === 'up' ? '#16a34a' : '#ca8a04' },
              ]}
            >
              {stat.trend === 'up' ? '▲' : '▼'} {stat.sub}
            </Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterActive}>
          <Text style={styles.filterActiveText}>BCS Preliminary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterInactive}>
          <Text style={styles.filterInactiveText}>Bank Job</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterInactive}>
          <Text style={styles.filterInactiveText}>Primary Teacher</Text>
        </TouchableOpacity>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live data • Synced</Text>
        </View>
      </View>

      {/* Charts Row */}
      <View style={styles.chartsRow}>
        {/* Bar Chart - Subject Strength */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Subject Strength Map</Text>
          <Text style={styles.chartSubtitle}>Accuracy % across 7 subjects</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: radarLabels,
                datasets: [{ data: radarValues }],
              }}
              width={Math.min(screenWidth - 80, 340)}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                fillShadowGradient: '#22c55e',
                fillShadowGradientOpacity: 0.6,
              }}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix="%"
            />
          </View>
          <View style={styles.radarLegend}>
            <Text style={styles.radarLegendItem}>
              🟢 <Text style={styles.radarLegendBold}>Strongest:</Text> BD Affairs 88%
            </Text>
            <Text style={styles.radarLegendItem}>
              🔴 <Text style={styles.radarLegendBold}>Weakest:</Text> Math 55%
            </Text>
          </View>
        </View>

        {/* Line Chart */}
        <View style={styles.chartCard}>
          <View style={styles.lineChartHeader}>
            <View>
              <Text style={styles.chartTitle}>Accuracy Trend</Text>
              <Text style={styles.chartSubtitle}>Daily accuracy • last 30 days</Text>
            </View>
            <View style={styles.lineChartValue}>
              <Text style={styles.lineChartBigValue}>78.4%</Text>
              <Text style={styles.lineChartChange}>+ 4.2</Text>
            </View>
          </View>
          <LineChart
            data={{
              labels: lineLabels,
              datasets: [{ data: lineData, color: () => '#22c55e', strokeWidth: 2 }],
            }}
            width={screenWidth - 70}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines
            withDots
          />
        </View>
      </View>

      {/* Subject Performance Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Subject Performance Breakdown</Text>
          <Text style={styles.tableSubtitle}>
            Weak subjects highlighted in red
          </Text>
        </View>

        <View style={styles.table}>
          {/* Table Head */}
          <View style={styles.tableHeadRow}>
            <Text style={[styles.th, styles.thSubject]}>Subject</Text>
            <Text style={[styles.th, styles.thNum]}>Attempted</Text>
            <Text style={[styles.th, styles.thNum]}>Correct</Text>
            <Text style={[styles.th, styles.thAccuracy]}>Accuracy</Text>
            <Text style={[styles.th, styles.thTrend]}>Trend</Text>
            <Text style={[styles.th, styles.thAction]}>Action</Text>
          </View>

          {/* Table Body */}
          {subjectData.map((row, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                row.isCritical && styles.tableRowCritical,
                row.isWeak && styles.tableRowWeak,
              ]}
            >
              <View style={styles.tdSubject}>
                <Text style={styles.subjectName}>{row.subject}</Text>
                {row.isWeak && (
                  <View style={styles.weakBadge}>
                    <Text style={styles.weakBadgeText}>Weak</Text>
                  </View>
                )}
                {row.isCritical && (
                  <View style={styles.criticalBadge}>
                    <Text style={styles.criticalBadgeText}>Critical</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.td, styles.tdNum]}>{row.attempted}</Text>
              <Text style={[styles.td, styles.tdNum]}>{row.correct}</Text>
              <View style={styles.tdAccuracyBar}>
                <View style={styles.accuracyTrack}>
                  <View
                    style={[
                      styles.accuracyFill,
                      {
                        width: `${row.accuracy}%` as any,
                        backgroundColor:
                          row.accuracy >= 80
                            ? '#15803d'
                            : row.accuracy >= 60
                            ? '#ca8a04'
                            : '#dc2626',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.accuracyPercent,
                    row.accuracy < 60 && { color: '#dc2626' },
                  ]}
                >
                  {row.accuracy}%
                </Text>
              </View>
              <Text
                style={[
                  styles.td,
                  styles.tdTrendValue,
                  { color: row.trend.includes('-') ? '#dc2626' : '#16a34a' },
                ]}
              >
                {row.trend}
              </Text>
              <View style={styles.tdAction}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    (row.isWeak || row.isCritical) && styles.actionBtnAlert,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      (row.isWeak || row.isCritical) &&
                        styles.actionBtnTextAlert,
                    ]}
                  >
                    {(row.isWeak || row.isCritical) ? 'Practice' : 'View'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* AI Study Plan */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.planHeaderLeft}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
            <Text style={styles.planTitle}>
              AI Study Plan — This Week
            </Text>
            <Text style={styles.planSub}>
              Personalized for your weak areas
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.regenerateText}>+ Regenerate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.planGrid}>
          {['Mon', 'Tue', 'Wed', 'Thu'].map((day, idx) => (
            <View key={idx} style={styles.planDay}>
              <View style={styles.planDayHeader}>
                <Text style={styles.planDayName}>{day}</Text>
              </View>
              <Text style={styles.planDayTitle}>
                {['Math — Percentages', 'English — Tense & Voice', 'Intl Affairs — UN', 'Full Mock Exam #5'][idx]}
              </Text>
              <Text style={styles.planDayDesc}>
                {[
                  'Focus on CP/SP problems. 25 MCQs from past BCS papers.',
                  'Do 10 grammar rules + 30 transformation MCQs.',
                  'Review UN charter & SAARC summits, recent events.',
                  '200 Qs • 2hrs • review weak topics afterward.',
                ][idx]}
              </Text>
              <View style={styles.planDayFooter}>
                <Text style={styles.planDayTime}>
                  ⏱️ {[90, 60, 45, 120][idx]} min
                </Text>
                <Text style={styles.planDayArrow}>›</Text>
              </View>
            </View>
          ))}
          <View style={styles.planRecommended}>
            <Text style={styles.recommendedBadge}>RECOMMENDED</Text>
            <Text style={styles.recommendedTitle}>
              Daily Review & Practice
            </Text>
            <Text style={styles.recommendedDesc}>
              Revise 2 weak subjects daily + 50 MCQs
            </Text>
          </View>
        </View>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Text style={styles.bannerIconText}>🎯</Text>
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>
            Stick to this plan and your projected accuracy will reach{' '}
            <Text style={styles.bannerHighlight}>82%</Text> by exam day.
          </Text>
          <Text style={styles.bannerSub}>
            Consistent study leads to mastery. You're on the right track.
          </Text>
        </View>
        <TouchableOpacity style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>Continue Study ›</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  targetBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  targetBadgeText: {
    fontSize: 9,
    color: '#15803d',
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
  },
  filterBtnText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  exportBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 10,
  },
  exportBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  statTrend: {
    fontSize: 10,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexWrap: 'wrap',
  },
  filterActive: {
    backgroundColor: '#0e1625',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterActiveText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  filterInactive: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterInactiveText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    fontSize: 9,
    color: '#16a34a',
    fontWeight: '600',
  },
  chartsRow: {
    gap: 16,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  chartSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  radarLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  radarLegendItem: {
    fontSize: 10,
    color: '#6b7280',
  },
  radarLegendBold: {
    fontWeight: '800',
    color: '#374151',
  },
  lineChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lineChartValue: {
    alignItems: 'flex-end',
  },
  lineChartBigValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16a34a',
  },
  lineChartChange: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '700',
  },
  // Table
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  tableSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  table: {
    paddingBottom: 4,
  },
  tableHeadRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thSubject: { flex: 2 },
  thNum: { width: 55, textAlign: 'center' },
  thAccuracy: { flex: 1.5 },
  thTrend: { width: 45, textAlign: 'center' },
  thAction: { width: 65, textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowCritical: {
    backgroundColor: '#fef2f2',
  },
  tableRowWeak: {
    backgroundColor: '#fef2f2',
  },
  td: {
    fontSize: 12,
    color: '#374151',
  },
  tdSubject: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectName: {
    fontWeight: '700',
    color: '#1e293b',
  },
  weakBadge: {
    backgroundColor: '#fecaca',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  weakBadgeText: {
    fontSize: 8,
    color: '#dc2626',
    fontWeight: '800',
  },
  criticalBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  criticalBadgeText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: '800',
  },
  tdNum: {
    width: 55,
    textAlign: 'center',
    color: '#6b7280',
  },
  tdAccuracyBar: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
  },
  accuracyTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 3,
  },
  accuracyPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    width: 36,
    textAlign: 'right',
  },
  tdTrendValue: {
    width: 45,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
  },
  tdAction: {
    width: 65,
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 12,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  actionBtnAlert: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  actionBtnText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '700',
  },
  actionBtnTextAlert: {
    color: '#dc2626',
  },
  // Plan
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  planHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  aiBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '800',
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  planSub: {
    fontSize: 9,
    color: '#9ca3af',
  },
  regenerateText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '700',
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  planDay: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
  },
  planDayHeader: {
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planDayName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9ca3af',
  },
  planDayTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  planDayDesc: {
    fontSize: 10,
    color: '#9ca3af',
    lineHeight: 14,
    marginBottom: 8,
  },
  planDayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  planDayTime: {
    fontSize: 9,
    color: '#9ca3af',
  },
  planDayArrow: {
    fontSize: 14,
    color: '#d1d5db',
  },
  planRecommended: {
    width: '48%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedBadge: {
    fontSize: 8,
    color: '#16a34a',
    fontWeight: '800',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  recommendedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  recommendedDesc: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 2,
  },
  // Banner
  banner: {
    backgroundColor: '#0e1625',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIconText: {
    fontSize: 18,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  bannerHighlight: {
    color: '#4ade80',
  },
  bannerSub: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  bannerBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bannerBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '800',
  },
});
