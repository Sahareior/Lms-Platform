import { api } from './baseApi';

export interface QuestionStatItem {
  questionId: string;
  totalAttempts: number;
  correctPercentage: number;
  averageTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  correctCount: number;
  incorrectCount: number;
  optionCounts?: Record<string, number>;
  lastAttemptedAt?: string;
}

export interface RecordStatPayloadItem {
  questionId: string;
  questionDocId?: string;
  isCorrect: boolean;
  timeTaken?: number;
  selectedOption?: string;
}

export interface RecordStatsRequest {
  questionId?: string;
  questionDocId?: string;
  isCorrect?: boolean;
  timeTaken?: number;
  selectedOption?: string;
  questions?: RecordStatPayloadItem[];
}

export interface RecordStatsResponse {
  success: boolean;
  count: number;
  message: string;
}

export interface BatchStatsResponse {
  stats: Record<string, QuestionStatItem>;
}

const statsApi = api.injectEndpoints({
  endpoints: (build) => ({
    recordQuestionStats: build.mutation<RecordStatsResponse, RecordStatsRequest>({
      query: (body) => ({
        url: 'stats/record',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => {
        const tags: { type: 'QuestionStats'; id: string }[] = [];
        if (arg.questionId) {
          tags.push({ type: 'QuestionStats', id: arg.questionId });
        }
        if (arg.questions) {
          arg.questions.forEach((q) => {
            tags.push({ type: 'QuestionStats', id: q.questionId });
          });
        }
        tags.push({ type: 'QuestionStats', id: 'BATCH' });
        return tags;
      },
    }),

    getQuestionStats: build.query<QuestionStatItem, string>({
      query: (questionId) => ({ url: `stats/question/${questionId}` }),
      providesTags: (_result, _error, questionId) => [
        { type: 'QuestionStats', id: questionId },
      ],
    }),

    getBatchQuestionStats: build.mutation<BatchStatsResponse, { questionIds: string[] }>({
      query: (body) => ({
        url: 'stats/batch',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useRecordQuestionStatsMutation,
  useGetQuestionStatsQuery,
  useGetBatchQuestionStatsMutation,
} = statsApi;
