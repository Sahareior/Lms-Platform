import type { Course } from './types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const progressWidth = `${Math.min(100, Math.max(0, course.progress))}%`;

  return (
    <div style={styles.card}>
      <div style={{ ...styles.thumbnailPlaceholder, backgroundColor: course.color + '18' }}>
        <span style={{ ...styles.thumbnailText, color: course.color }}>
          {course.title.charAt(0)}
        </span>
      </div>
      <div style={styles.content}>
        <div style={styles.header}>
          <span style={{ ...styles.categoryBadge, backgroundColor: course.color + '15', color: course.color }}>
            {course.category}
          </span>
        </div>
        <h3 style={styles.title}>{course.title}</h3>
        <p style={styles.instructor}>{course.instructor}</p>
        <div style={styles.progressSection}>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: progressWidth, backgroundColor: course.color }} />
          </div>
          <span style={styles.progressText}>{course.progress}%</span>
        </div>
        <span style={styles.lessons}>{course.completedLessons}/{course.totalLessons} lessons</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #f0f0f0',
    borderLeft: '4px solid var(--accent, #6366f1)',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  },
  thumbnailPlaceholder: {
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    fontSize: '40px',
    fontWeight: 'bold',
    fontFamily: 'system-ui, sans-serif',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  categoryBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 2px 0',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  instructor: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: 'auto',
    marginBottom: '4px',
  },
  progressBarBg: {
    flex: 1,
    height: '6px',
    backgroundColor: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  progressText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
    minWidth: '36px',
    textAlign: 'right' as const,
  },
  lessons: {
    fontSize: '12px',
    color: '#9ca3af',
  },
};
