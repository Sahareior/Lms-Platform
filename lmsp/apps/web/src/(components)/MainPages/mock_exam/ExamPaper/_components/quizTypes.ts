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

export const BENGALI_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];
export const getBengaliLetter = (index: number) =>
  BENGALI_LETTERS[index] || String.fromCharCode(65 + index);

/**
 * Computes the correct-count locally from the questions + selected answers.
 * This is the source of truth whenever the server doesn't return a
 * well-formed result (see the guard in handleSubmit below).
 */
export const computeLocalScore = (
  allQuestions: QuestionItem[],
  selectedAnswers: Record<number, number>
) => {
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

export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
