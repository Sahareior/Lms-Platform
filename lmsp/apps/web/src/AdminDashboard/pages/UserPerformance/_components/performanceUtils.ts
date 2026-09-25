import type { AdminQuizAttemptQuestion } from '@my-monorepo/store';

// ─── Types ───────────────────────────────────────────────────
export type QuestionResult = 'correct' | 'incorrect' | 'unanswered';
export type AttemptResultFilter = 'all' | QuestionResult;

/** Preset antd Tag colors, kept as data so this stays a plain .ts module. */
export interface TagTone {
  label: string;
  color: string;
}

export interface AttemptBreakdown {
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
}

// ─── Formatting ──────────────────────────────────────────────

/** `86399` → `23h 59m`, `125` → `2m 5s`. */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
};

/** Green ramp for scores, shared by progress bars and legends. */
export const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return '#4ADE80';
  if (percentage >= 60) return '#22C55E';
  if (percentage >= 40) return '#A3E635';
  return '#ff4d4f';
};

// ─── Labels ──────────────────────────────────────────────────

export const getTypeTone = (type?: string, source?: string): TagTone =>
  type === 'mock_exam' || source === 'mock_exam'
    ? { label: 'Mock Exam', color: 'blue' }
    : { label: 'Practice', color: 'green' };

export const getStatusTone = (percentage: number): TagTone => {
  if (percentage >= 80) return { label: 'Excellent', color: 'success' };
  if (percentage >= 60) return { label: 'Good', color: 'processing' };
  if (percentage >= 40) return { label: 'Average', color: 'warning' };
  return { label: 'Needs Work', color: 'error' };
};

// ─── Question helpers ────────────────────────────────────────

/**
 * The API can return duplicate or out-of-order question rows, so normalize
 * once here instead of in every consumer.
 */
export const normalizeQuestions = (
  questions?: AdminQuizAttemptQuestion[]
): AdminQuizAttemptQuestion[] => {
  const seen = new Set<number>();
  return (questions ?? [])
    .filter((q) => {
      const num = Number(q.questionNumber);
      if (seen.has(num)) return false;
      seen.add(num);
      return true;
    })
    .sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber));
};

export const getQuestionResult = (
  question: AdminQuizAttemptQuestion
): QuestionResult => {
  if (question.isCorrect === true) return 'correct';
  if (question.isCorrect === false) return 'incorrect';
  return 'unanswered';
};

/** Counts derived from the question rows (works even if the summary is stale). */
export const computeBreakdown = (
  questions: AdminQuizAttemptQuestion[]
): AttemptBreakdown => {
  const breakdown: AttemptBreakdown = { correct: 0, incorrect: 0, unanswered: 0, total: questions.length };
  for (const q of questions) {
    breakdown[getQuestionResult(q)] += 1;
  }
  return breakdown;
};

/** Filter the question review list by result state and free-text search. */
export const filterAttemptQuestions = (
  questions: AdminQuizAttemptQuestion[],
  result: AttemptResultFilter,
  search: string
): AdminQuizAttemptQuestion[] => {
  const needle = search.trim().toLowerCase();

  return questions.filter((q) => {
    if (result !== 'all' && getQuestionResult(q) !== result) return false;
    if (!needle) return true;
    if (String(q.questionNumber).includes(needle)) return true;

    const haystack = [q.questionText, q.selectedOption, q.correctAnswer, ...Object.values(q.options || {})]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  });
};
