import { View, Text, StyleSheet } from 'react-native';
import type { DimensionValue } from 'react-native';
import type { Course } from './types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const progressWidth = `${Math.min(100, Math.max(0, course.progress))}%` as DimensionValue;

  return (
    <View style={[styles.card, { borderLeftColor: course.color }]}>
      <View style={styles.thumbnail}>
        <View style={[styles.thumbnailPlaceholder, { backgroundColor: course.color + '20' }]}>
          <Text style={[styles.thumbnailText, { color: course.color }]}>
            {course.title.charAt(0)}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: course.color + '20' }]}>
            <Text style={[styles.categoryText, { color: course.color }]}>{course.category}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.instructor}>{course.instructor}</Text>
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: progressWidth, backgroundColor: course.color }]} />
          </View>
          <Text style={styles.progressText}>{course.progress}%</Text>
        </View>
        <Text style={styles.lessons}>
          {course.completedLessons}/{course.totalLessons} lessons
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderLeftWidth: 4,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 120,
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    width: 40,
    textAlign: 'right',
  },
  lessons: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
