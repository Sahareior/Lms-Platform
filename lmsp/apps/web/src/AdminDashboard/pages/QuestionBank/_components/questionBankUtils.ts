import type { AdminQuestion } from '@my-monorepo/store';

// ─── Types ───────────────────────────────────────────────────
/** A single question inside a stored question document. */
export type QuestionItem = AdminQuestion['data'][number];

export type QuestionFlag = 'all' | 'missing-explanation' | 'with-image' | 'missing-answer';

export interface QuestionStats {
  total: number;
  withExplanation: number;
  withImage: number;
  withScenario: number;
  missingAnswer: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

// ─── Pure helpers ────────────────────────────────────────────

/** Count the things an admin actually cares about at a glance. */
export const computeQuestionStats = (items: QuestionItem[] = []): QuestionStats => {
  let withExplanation = 0;
  let withImage = 0;
  let withScenario = 0;
  let missingAnswer = 0;

  for (const q of items) {
    if (q.explanation?.trim()) withExplanation += 1;
    if (q.image_url) withImage += 1;
    if (q.scenario_text?.trim()) withScenario += 1;
    if (!q.correct_answer) missingAnswer += 1;
  }

  return { total: items.length, withExplanation, withImage, withScenario, missingAnswer };
};

/** Questions always read in paper order, regardless of how they were stored. */
export const sortQuestions = (items: QuestionItem[] = []): QuestionItem[] =>
  [...items].sort((a, b) => (a.question_number ?? 0) - (b.question_number ?? 0));

export const truncate = (text: string | undefined, max = 80): string =>
  text && text.length > max ? `${text.slice(0, max)}…` : text || '';

/** Option entries in stored key order (A, B, C, D, …). */
export const getOptionEntries = (options: Record<string, string> = {}): [string, string][] =>
  Object.entries(options);

/**
 * Stored question docs keep options as a `{ key: value }` map, while the
 * analyzer endpoint expects an ordered option list plus the answer *text*.
 * This translates between the two shapes so pattern analysis can be re-run
 * from the bank without re-uploading the source paper.
 */
export const buildAnalyzerPayload = (
  data: QuestionItem[],
  year: number,
  existingTopics?: string[],
  subject?: string
) => ({
  questions: data.map((item) => {
    const keys = Object.keys(item.options || {});
    return {
      year,
      question: item.question_text || '',
      options: keys.map((key) => item.options[key]),
      answer: item.options[item.correct_answer || ''] || item.correct_answer || '',
    };
  }),
  existing_topics: existingTopics && existingTopics.length > 0 ? existingTopics : undefined,
  subject: subject || undefined,
});

/** Filter a document's questions by search text and a quick status flag. */
export const filterQuestions = (
  items: QuestionItem[],
  search: string,
  flag: QuestionFlag
): QuestionItem[] => {
  const needle = search.trim().toLowerCase();

  return items.filter((q) => {
    if (flag === 'missing-explanation' && q.explanation?.trim()) return false;
    if (flag === 'with-image' && !q.image_url) return false;
    if (flag === 'missing-answer' && q.correct_answer) return false;

    if (!needle) return true;
    if (String(q.question_number).includes(needle)) return true;

    const haystack = [
      q.question_text,
      q.scenario_text,
      q.explanation,
      ...Object.values(q.options || {}),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  });
};
