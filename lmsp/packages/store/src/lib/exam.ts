/**
 * Pure exam / question-paper helpers shared by the web app and the
 * React Native app. Nothing in here touches the DOM, so it runs
 * unchanged on every platform.
 */

export interface QuestionStats {
  attempts: number;
  failures: number;
  successes: number;
  successRate: number;
}

export interface QuestionItem {
  id?: string;
  question: string;
  scenarioText?: string;
  imageUrl?: string;
  options: string[];
  /** Original option keys from the backend (e.g. ["K","L","M","N"]) */
  optionKeys?: string[];
  correctAnswer?: number;
  questionNumber?: number;
  stats?: QuestionStats;
}

export interface QuestionReviewItem {
  question: string;
  options: string[];
  selectedIndex?: number;
  correctIndex?: number;
  isCorrect?: boolean;
}

export interface QuizResultData {
  examName: string;
  versionName: string;
  title: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  percentage: number;
  score: number;
  timeTaken: number;
  durationSeconds: number;
  questions?: QuestionReviewItem[];
}

export const BENGALI_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ'];

export const getBengaliLetter = (index: number): string =>
  BENGALI_LETTERS[index] || String.fromCharCode(65 + index);

/** Resolves the correct option's index from the backend's answer key. */
export function getCorrectAnswerIndex(q: any): number | undefined {
  if (!q?.correct_answer) return undefined;
  const entries = q.options
    ? (Object.entries(q.options).filter(([, v]) => v) as [string, string][])
    : [];
  const byKey = entries.findIndex(([k]) => k === q.correct_answer);
  if (byKey >= 0) return byKey;
  const byText = entries.findIndex(([, v]) => v === q.correct_answer);
  return byText >= 0 ? byText : undefined;
}

/**
 * The backend returns question *documents* (`{ data: [...] }`), sometimes
 * split across many versions. This flattens and de-duplicates them into
 * the shape the exam UI renders.
 */
export function flattenQuestionDocs(
  docs: any[] | undefined,
  performance?: any[]
): QuestionItem[] {
  if (!docs || docs.length === 0) return [];

  const flattened: QuestionItem[] = [];
  const seen = new Set<number>();

  docs.forEach((doc: any) => {
    if (!doc?.data || !Array.isArray(doc.data)) return;

    const sorted = [...doc.data].sort(
      (a: any, b: any) => (a.question_number || 0) - (b.question_number || 0)
    );

    sorted.forEach((q: any) => {
      const qNum = q.question_number;
      if (qNum !== undefined && qNum !== null) {
        if (seen.has(qNum)) return;
        seen.add(qNum);
      }

      const validEntries = q.options
        ? (Object.entries(q.options).filter(([, v]) => v) as [string, string][])
        : [];

      const perf = performance?.find((p: any) => p.questionNumber === qNum);

      flattened.push({
        id: q._id,
        question: q.question_text,
        scenarioText: q.scenario_text || '',
        imageUrl: q.image_url || '',
        options: validEntries.map(([, v]) => v),
        optionKeys: validEntries.map(([k]) => k),
        correctAnswer: getCorrectAnswerIndex(q),
        questionNumber: qNum,
        stats: perf
          ? {
              attempts: perf.attempts || 0,
              failures: perf.failures || 0,
              successes: perf.successes || 0,
              successRate:
                perf.attempts > 0
                  ? Math.round((perf.successes / perf.attempts) * 100)
                  : 0,
            }
          : undefined,
      });
    });
  });

  return flattened;
}

/** Local correct-count — the source of truth for the result screen. */
export const computeLocalScore = (
  allQuestions: QuestionItem[],
  selectedAnswers: Record<number, number>
): number => {
  let correct = 0;
  allQuestions.forEach((q, idx) => {
    const selected = selectedAnswers[idx];
    if (
      selected !== undefined &&
      q.correctAnswer !== undefined &&
      selected === q.correctAnswer
    ) {
      correct++;
    }
  });
  return correct;
};

export const buildLocalReview = (
  allQuestions: QuestionItem[],
  selectedAnswers: Record<number, number>
): QuestionReviewItem[] =>
  allQuestions.map((q, idx) => ({
    question: q.question,
    options: q.options,
    selectedIndex: selectedAnswers[idx],
    correctIndex: q.correctAnswer,
    isCorrect:
      selectedAnswers[idx] !== undefined &&
      q.correctAnswer !== undefined &&
      selectedAnswers[idx] === q.correctAnswer,
  }));

/** Builds the result payload from local data (used before/after the API). */
export function buildResult(opts: {
  allQuestions: QuestionItem[];
  selectedAnswers: Record<number, number>;
  examName: string;
  versionName?: string;
  title?: string;
  timeTaken: number;
  durationSeconds: number;
}): QuizResultData {
  const {
    allQuestions,
    selectedAnswers,
    examName,
    versionName = '',
    title,
    timeTaken,
    durationSeconds,
  } = opts;

  const correctCount = computeLocalScore(allQuestions, selectedAnswers);
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = allQuestions.length;

  return {
    examName,
    versionName,
    title: title || examName,
    correctCount,
    incorrectCount: answeredCount - correctCount,
    unansweredCount: totalQuestions - answeredCount,
    totalQuestions,
    percentage:
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
    score: correctCount,
    timeTaken,
    durationSeconds,
    questions: buildLocalReview(allQuestions, selectedAnswers),
  };
}

/** mm:ss for short timers, hh:mm:ss for an hour or more. */
export const formatTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};
