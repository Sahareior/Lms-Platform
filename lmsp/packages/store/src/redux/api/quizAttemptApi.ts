import { api } from './baseApi';

// ─── Types ──────────────────────────────────────────────────
export interface StartAttemptRequest {
  userId: string;
  examId?: string;
  examVersionId?: string;
  subjectId?: string;
  type?: 'mock_exam' | 'practice';
  source?: 'question_center' | 'mock_exam' | 'quiz_practice';
  totalQuestions?: number;
}

export interface SaveAnswerRequest {
  attemptId: string;
  questionNumber: number;
  selectedOption: string | null;
  timeTaken?: number;
}

export interface BatchSaveAnswersRequest {
  attemptId: string;
  answers: {
    questionNumber: number;
    selectedOption: string | null;
    timeTaken?: number;
  }[];
}

export interface CompleteAttemptRequest {
  attemptId: string;
}

export interface QuestionResponse {
  questionNumber: number;
  questionText: string;
  options: Record<string, string>;
  selectedOption: string | null;
  correctAnswer: string | null;
  isCorrect: boolean | null;
  timeTaken: number;
}

export interface AttemptSummary {
  _id: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number;
  isCompleted: boolean;
}

export interface Attempt {
  _id: string;
  user: any;
  exam?: any;
  examVersion?: any;
  subject?: any;
  type: string;
  source: string;
  questions: QuestionResponse[];
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number;
  startedAt: string;
  completedAt?: string;
  timeTaken: number;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Minimal completed-attempt record used by the weekly activity chart. */
export interface WeeklyAttempt {
  _id: string;
  createdAt: string;
  percentage: number;
  totalQuestions: number;
  correctCount: number;
  type: string;
  source: string;
}

export interface WeeklyActivityResponse {
  attempts: WeeklyAttempt[];
}

/** Aggregated totals across every completed attempt. */
export interface OverallOverview {
  attempts: number;
  questions: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface ExamOverview {
  examId: string;
  examName: string;
  attempts: number;
  questions: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface SubjectOverview {
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
  isWeak: boolean;
  isCritical: boolean;
}

export interface QuizOverviewResponse {
  overall: OverallOverview;
  byExam: ExamOverview[];
  bySubject: SubjectOverview[];
}

// ─── Injected Endpoints ─────────────────────────────────────
const quizAttemptApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── Start a new attempt ──────────────────────────────────
    startAttempt: build.mutation<Attempt, StartAttemptRequest>({
      query: (data) => ({
        url: '/quiz-attempts/start',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'QuizAttempt', id: 'LIST' }],
    }),

    // ── Save a single answer ─────────────────────────────────
    saveAnswer: build.mutation<{ message: string; attempt: AttemptSummary }, SaveAnswerRequest>({
      query: (data) => ({
        url: '/quiz-attempts/save-answer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { attemptId }) => [
        { type: 'QuizAttempt', id: attemptId },
      ],
    }),

    // ── Batch save answers ───────────────────────────────────
    batchSaveAnswers: build.mutation<{ message: string; attempt: AttemptSummary }, BatchSaveAnswersRequest>({
      query: (data) => ({
        url: '/quiz-attempts/batch-save',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { attemptId }) => [
        { type: 'QuizAttempt', id: attemptId },
      ],
    }),

    // ── Complete an attempt ──────────────────────────────────
    completeAttempt: build.mutation<{ message: string; attempt: Attempt }, CompleteAttemptRequest>({
      query: ({ attemptId }) => ({
        url: `/quiz-attempts/${attemptId}/complete`,
        method: 'POST',
        body: { attemptId },
      }),
      invalidatesTags: (_result, _error, { attemptId }) => [
        { type: 'QuizAttempt', id: attemptId },
        { type: 'QuizAttempt', id: 'LIST' },
        'Performance',
      ],
    }),

    // ── Get active attempt ───────────────────────────────────
    getActiveAttempt: build.query<Attempt | null, { userId: string; examId?: string }>({
      query: ({ userId, examId }) => {
        let url = `/quiz-attempts/active?userId=${userId}`;
        if (examId) url += `&examId=${examId}`;
        return { url };
      },
      providesTags: (_result, _error, { examId }) => [
        { type: 'QuizAttempt', id: examId || 'ACTIVE' },
      ],
    }),

    // ── Get user attempts ────────────────────────────────────
    getUserAttempts: build.query<Attempt[], { userId: string; type?: string; limit?: number }>({
      query: ({ userId, type, limit }) => {
        let url = `/quiz-attempts/user/${userId}`;
        const params = new URLSearchParams();
        if (type) params.set('type', type);
        if (limit) params.set('limit', String(limit));
        const qs = params.toString();
        if (qs) url += `?${qs}`;
        return { url };
      },
      providesTags: [{ type: 'QuizAttempt', id: 'LIST' }],
    }),

    // ── Get attempt by ID ────────────────────────────────────
    getAttemptById: build.query<Attempt, string>({
      query: (id) => ({ url: `/quiz-attempts/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'QuizAttempt', id }],
    }),

    // ── Get weekly activity (last-8-days completed attempts) ──
    getWeeklyActivity: build.query<WeeklyActivityResponse, { userId: string }>({
      query: ({ userId }) => ({ url: `/quiz-attempts/activity/weekly?userId=${userId}` }),
      providesTags: [{ type: 'QuizAttempt', id: 'LIST' }],
    }),

    // ── Get performance overview across all exams (dashboard) ──
    getQuizOverview: build.query<QuizOverviewResponse, { userId: string }>({
      query: ({ userId }) => ({ url: `/quiz-attempts/overview?userId=${userId}` }),
      providesTags: [{ type: 'QuizAttempt', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useStartAttemptMutation,
  useSaveAnswerMutation,
  useBatchSaveAnswersMutation,
  useCompleteAttemptMutation,
  useGetActiveAttemptQuery,
  useGetUserAttemptsQuery,
  useGetAttemptByIdQuery,
  useGetWeeklyActivityQuery,
  useGetQuizOverviewQuery,
} = quizAttemptApi;
