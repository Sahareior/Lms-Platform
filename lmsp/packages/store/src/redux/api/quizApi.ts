import { api } from './baseApi';

// ─── Types ──────────────────────────────────────────────────
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number; // index of correct option – hidden from client in prod
  explanation?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // minutes
  passingScore: number; // percentage
}

export interface QuizListResponse {
  quizzes: (Omit<Quiz, 'questions'> & { questionCount: number })[];
  total: number;
}

export interface SubmitAnswerRequest {
  quizId: string;
  answers: { questionId: string; selectedIndex: number }[];
}

export interface QuizResult {
  quizId: string;
  score: number; // percentage
  correct: number;
  total: number;
  passed: boolean;
  answers: {
    questionId: string;
    selectedIndex: number;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
}

// ─── Injected Endpoints ─────────────────────────────────────
const quizApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── List All Quizzes ─────────────────────────────────────
    getQuizzes: build.query<QuizListResponse, void>({
      query: () => ({ url: '/quizzes' }),
      providesTags: (result) =>
        result
          ? [
              ...result.quizzes.map(
                ({ id }) => ({ type: 'Quiz' as const, id }),
              ),
              { type: 'Quiz', id: 'LIST' },
            ]
          : [{ type: 'Quiz', id: 'LIST' }],
    }),

    // ── Get Full Quiz (with questions) ───────────────────────
    getQuizById: build.query<Quiz, string>({
      query: (id) => ({ url: `/quizzes/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Quiz', id }],
    }),

    // ── Submit Quiz Answers ──────────────────────────────────
    submitQuiz: build.mutation<QuizResult, SubmitAnswerRequest>({
      query: (data) => ({
        url: `/quizzes/${data.quizId}/submit`,
        method: 'POST',
        body: { answers: data.answers },
      }),
      invalidatesTags: (_result, _error, { quizId }) => [
        { type: 'Quiz', id: quizId },
        'Performance',
      ],
    }),

    // ── Get Past Results ─────────────────────────────────────
    getQuizResults: build.query<QuizResult[], string>({
      query: (quizId) => ({ url: `/quizzes/${quizId}/results` }),
      providesTags: (_result, _error, quizId) => [
        { type: 'Performance', id: quizId },
      ],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useSubmitQuizMutation,
  useGetQuizResultsQuery,
} = quizApi;
