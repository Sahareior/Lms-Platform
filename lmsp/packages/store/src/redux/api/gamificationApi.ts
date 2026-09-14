import { api } from './baseApi';

// ─── Types ──────────────────────────────────────────────────
export interface GamificationStats {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeToday: boolean;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}

export interface LeaderboardEntry {
  rank: number;
  _id: string;
  name: string;
  profilePic: string | null;
  xp: number;
  currentStreak: number;
}

export interface LeaderboardResponse {
  range: 'week' | 'all';
  leaderboard: LeaderboardEntry[];
}

export interface NotebookEntry {
  _id: string;
  questionId: string;
  questionDocId: string | null;
  questionText: string;
  options: Record<string, string> | null;
  correctAnswer: string | null;
  exam: string | null;
  examName: string;
  subject: string | null;
  subjectName: string;
  box: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  wrongCount: number;
  correctCount: number;
  lastWrongAnswer: string | null;
  mastered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookResponse {
  filter: 'due' | 'all' | 'mastered';
  entries: NotebookEntry[];
  total: number;
  stats: {
    totalTracked: number;
    dueCount: number;
    masteredCount: number;
  };
}

export interface NotebookStats {
  totalTracked: number;
  dueCount: number;
  masteredCount: number;
}

export interface RecordMistakeQuestion {
  questionId: string;
  questionDocId?: string;
  questionText?: string;
  options?: Record<string, string>;
  correctAnswer?: string | null;
  lastWrongAnswer?: string | null;
  exam?: string | null;
  examName?: string;
  subject?: string | null;
  subjectName?: string;
}

// ─── Notebook: answered questions (right/wrong) + favorites ──
export interface NotebookItem {
  questionId: string;
  questionText: string;
  options: Record<string, string>;
  correctAnswer: string | null;
  explanation: string;
  // The user's latest submitted answer (option key). Favorites may not have one.
  providedAnswer?: string | null;
  examName?: string | null;
  subjectName?: string | null;
  answeredAt?: string;
  favoritedAt?: string;
  /** how many times this question appears in submitted answers */
  timesAnswered?: number;
  /** false when the question could no longer be resolved from the bank */
  resolved?: boolean;
}

export interface NotebookQuestionsResponse {
  right: NotebookItem[];
  wrong: NotebookItem[];
  favorites: NotebookItem[];
  stats: {
    rightCount: number;
    wrongCount: number;
    favoriteCount: number;
  };
}

export interface PracticeXpResponse {
  success: boolean;
  source: string;
  xp: number;
  xpAwarded: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  level: number;
  /** level before this XP award (present when the backend computed it) */
  previousLevel?: number;
  /** true when this award pushed the user into a new level */
  levelUp?: boolean;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}

// ─── Injected Endpoints ─────────────────────────────────────
const gamificationApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── XP / streak / level for the logged-in user ──────────
    getMyGamification: build.query<GamificationStats, void>({
      query: () => ({ url: '/gamification/me' }),
      providesTags: ['Performance'],
    }),

    // ── XP leaderboard ─────────────────────────────────────
    getLeaderboard: build.query<LeaderboardResponse, { range?: 'week' | 'all'; limit?: number }>({
      query: ({ range = 'all', limit = 20 } = {}) =>
        ({ url: `/gamification/leaderboard?range=${range}&limit=${limit}` }),
    }),

    // ── Award XP for a self-graded practice session ─────────
    // Called once on submit with the final correct/total counts.
    awardPracticeXp: build.mutation<
      PracticeXpResponse,
      { correctCount: number; totalCount: number; source?: string }
    >({
      query: (body) => ({ url: '/gamification/practice', method: 'POST', body }),
      invalidatesTags: ['Performance'],
    }),

    // ── Mistake notebook: list entries ─────────────────────
    getMistakeNotebook: build.query<
      NotebookResponse,
      { filter?: 'due' | 'all' | 'mastered'; limit?: number }
    >({
      query: ({ filter = 'due', limit = 50 } = {}) =>
        ({ url: `/mistake-notebook?filter=${filter}&limit=${limit}` }),
      providesTags: ['Question'],
    }),

    // ── Mistake notebook: quick counters ───────────────────
    getMistakeNotebookStats: build.query<NotebookStats, void>({
      query: () => ({ url: '/mistake-notebook/stats' }),
      providesTags: ['Question'],
    }),

    // ── Mistake notebook: record mistakes (auto from exams) ─
    recordMistakes: build.mutation<
      { success: boolean; count: number },
      { questions: RecordMistakeQuestion[] }
    >({
      query: (body) => ({ url: '/mistake-notebook', method: 'POST', body }),
      invalidatesTags: ['Question'],
    }),

    // ── Mistake notebook: grade a review ───────────────────
    reviewNotebookEntry: build.mutation<
      { success: boolean; entry: NotebookEntry },
      { id: string; correct: boolean; selectedOption?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/mistake-notebook/${id}/review`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Question'],
    }),

    // ── Mistake notebook: delete an entry ──────────────────
    deleteNotebookEntry: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/mistake-notebook/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Question'],
    }),

    // ── Notebook: all answered questions (right/wrong) + favorites ──
    getNotebookQuestions: build.query<
      NotebookQuestionsResponse,
      { limit?: number } | void
    >({
      query: ({ limit = 200 } = {}) => ({ url: `/quiz-performance/notebook?limit=${limit}` }),
      providesTags: ['Question', 'Performance', { type: 'Favorite', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetMyGamificationQuery,
  useGetLeaderboardQuery,
  useAwardPracticeXpMutation,
  useGetMistakeNotebookQuery,
  useGetMistakeNotebookStatsQuery,
  useRecordMistakesMutation,
  useReviewNotebookEntryMutation,
  useDeleteNotebookEntryMutation,
  useGetNotebookQuestionsQuery,
} = gamificationApi;
