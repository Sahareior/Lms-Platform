import { api } from './baseApi';
import type {
  AiPerformanceResponse,
  AiPerformanceStats,
  AiPerformanceReport,
} from './aiApi';


// ─── Types ──────────────────────────────────────────────────
export interface QuestionPerformance {
  questionId: string;
  questionNumber: number;
  questionText: string;
  options: Record<string, string>;
  correctAnswer: string | null;
  attempts: number;
  failures: number;
  successes: number;
  lastAttemptedAt: string;
  examId?: string;
  examVersionId?: string;
  subjectId?: string;
}

export interface SavePerformanceRequest {
  userId: string;
  type: 'mockExam' | 'questionPreatise';
  questions: {
    questionId: string;
    questionNumber: number;
    questionText: string;
    options: Record<string, string>;
    correctAnswer: string | null;
    selectedOption: string | null;
    isCorrect: boolean | null;
    examId?: string;
    examVersionId?: string;
    subjectId?: string;
  }[];
}

export interface PerformanceSummary {
  totalQuestions: number;
  totalAttempts: number;
  totalSuccesses: number;
  totalFailures: number;
  successRate: number;
}

// ─── Cached AI Performance Report Types ──────────────────────
// The backend proxies the AI service, caches its response once per day, and
// returns it together with the previous report so the UI can show progress.

export interface AiReportSnapshot {
  stats: AiPerformanceResponse['stats'] | null;
  ai_report: AiPerformanceResponse['ai_report'] | null;
  generatedAt: string;
}

/** Response of the get-or-generate endpoint. Mirrors the raw AI response but
 *  `stats`/`ai_report` are nullable because the backend returns nulls when the
 *  user has no performance data yet (`empty: true`). */
export interface GetOrGenerateAiResponse {
  success: boolean;
  /** true when the response came from the daily cache instead of a fresh AI call */
  cached: boolean;
  /** ISO timestamp of when the returned report was generated */
  generatedAt: string | null;
  /** previous report (null when this is the user's first report) */
  previous: AiReportSnapshot | null;
  /** true when the user has no quiz performance data to analyze */
  empty?: boolean;
  /** true when a failed AI call / empty data fell back to the last cached report */
  fallback?: boolean;
  /** null when `empty` is true (no performance data to analyze) */
  stats: AiPerformanceStats | null;
  /** null when `empty` is true (no performance data to analyze) */
  ai_report: AiPerformanceReport | null;
}

export interface AiHistoryItem {
  generatedAt: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percentage: number;
  exam: string;
  /** score change vs the previous saved report (null for the first) */
  delta: number | null;
}


// ─── Injected Endpoints ─────────────────────────────────────
const userPerformanceApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── Get user quiz performance data ────────────────────────
    getUserPerformance: build.query<
      { mockExam: QuestionPerformance[]; questionPreatise: QuestionPerformance[] },
      { userId: string; type?: string }
    >({
      query: ({ userId, type }) => {
        let url = `/user-data/performance/${userId}`;
        if (type) url += `?type=${type}`;
        return { url };
      },
      providesTags: [{ type: 'Performance', id: 'LIST' }],
    }),

    // ── Save quiz performance after attempt completion ────────
    saveQuizPerformance: build.mutation<
      { message: string; mockExam?: QuestionPerformance[]; questionPreatise?: QuestionPerformance[] },
      SavePerformanceRequest
    >({
      query: (data) => ({
        url: '/user-data/performance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Performance', id: 'LIST' }],
    }),

    // ── Get performance stats for a specific exam ────────────
    getExamPerformance: build.query<
      { mockExam: QuestionPerformance[]; questionPreatise: QuestionPerformance[] },
      { userId: string; examId: string; type?: string }
    >({
      query: ({ userId, examId, type }) => {
        let url = `/user-data/performance/${userId}/exam/${examId}`;
        if (type) url += `?type=${type}`;
        return { url };
      },
      providesTags: [{ type: 'Performance', id: 'LIST' }],
    }),

    // new apis

    postUserQuizs: build.mutation({
      query: (data) => ({
        url: '/quiz-performance',
        method: 'POST',
        body: data,
      }),
    }),


    getUserPerformanceJson:build.query({
      query: (id) => ({ url: `quiz-performance/${id}` })
    }),

    // ── Get today's AI report (generate + cache it if missing) ─
    // examId: when provided, only that exam's performance is analyzed.
    getOrGenerateAiPerformance: build.mutation<
      GetOrGenerateAiResponse,
      { userId: string; examId?: string; force?: boolean }
    >({
      query: ({ userId, examId, force }) => {
        const params = new URLSearchParams();
        if (force) params.set('force', 'true');
        if (examId) params.set('examId', examId);
        const qs = params.toString();
        return {
          url: `/ai-performance/${userId}${qs ? `?${qs}` : ''}`,
          method: 'POST',
        };
      },
      invalidatesTags: [{ type: 'Performance', id: 'AI_HISTORY' }],
    }),

    // ── Get all saved AI reports (progress-over-time) ────────
    // examId: when provided, only reports for that exam are returned.
    getAiPerformanceHistory: build.query<
      { success: boolean; history: AiHistoryItem[] },
      { userId: string; examId?: string }
    >({
      query: ({ userId, examId }) => {
        const qs = examId ? `?examId=${examId}` : '';
        return { url: `/ai-performance/history/${userId}${qs}` };
      },
      providesTags: [{ type: 'Performance', id: 'AI_HISTORY' }],
    }),



    // ── Get overall performance summary ──────────────────────
    getPerformanceSummary: build.query<
      { mockExam: PerformanceSummary; questionPreatise: PerformanceSummary },
      string
    >({
      query: (userId) => ({
        url: `/user-data/performance/${userId}/summary`,
      }),
      providesTags: [{ type: 'Performance', id: 'SUMMARY' }],
    }),
  }),
  overrideExisting: false,
});





// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetUserPerformanceQuery,
  useSaveQuizPerformanceMutation,
  useGetExamPerformanceQuery,
  usePostUserQuizsMutation,
  useGetPerformanceSummaryQuery,
  useGetUserPerformanceJsonQuery,
  useGetOrGenerateAiPerformanceMutation,
  useGetAiPerformanceHistoryQuery
} = userPerformanceApi;
