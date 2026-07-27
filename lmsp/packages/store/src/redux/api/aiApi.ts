import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getAuthToken } from './baseApi';

// ─── Configuration State ───────────────────────────────────
// Separate base URL for AI-specific endpoints (default port 5000).
let _aiBaseUrl = 'http://127.0.0.1:5000/';

/**
 * Configure the AI API client.
 * Call this if you need to change the AI endpoint URL at runtime.
 */
export function configureAiApi(options: { baseUrl?: string }) {
  if (options.baseUrl) _aiBaseUrl = options.baseUrl;
}

// ─── Request / Response Types ───────────────────────────────
/** Sent to the AI endpoint: { "question": "..." } */
export interface AiChatRequest {
  question: string;
}

/** Received from the AI endpoint: { "question": "...", "answer": "..." } */
export interface AiChatResponse {
  question: string;
  answer: string;
}

export interface ScrapedQuestion {
  question_number: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
}

export interface QuestionPaperScraperResponse {
  status: string;
  data: ScrapedQuestion[];
}

export interface QuestionAnalyzerQuestion {
  year: number;
  question: string;
  options: string[];
  answer: string;
}

export interface QuestionAnalyzerRequest {
  questions: QuestionAnalyzerQuestion[];
}

// ─── Custom Base Query (dynamic URL + shared auth token) ──
const dynamicAiBaseQuery: BaseQueryFn<
  FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: _aiBaseUrl,
    prepareHeaders: (headers) => {
      // Reuse the same auth token from the main API
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });
  return rawBaseQuery(args, api, extraOptions);
};

// ─── Tag Types ──────────────────────────────────────────────
export const aiTagTypes = ['Chat', 'AI'] as const;

// ─── AI API Slice ───────────────────────────────────────────
/**
 * Standalone RTK Query slice for AI endpoints.
 * Uses its own base URL (port 5000 by default) so it does NOT
 * interfere with the main API (port 3000).
 */
export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: dynamicAiBaseQuery,
  tagTypes: aiTagTypes,
  endpoints: (build) => ({
    // ── Send a chat message to the AI ─────────────────────────
    sendChatMessage: build.mutation<AiChatResponse, AiChatRequest>({
      query: (body) => ({
        url: '/rag-chat',
        method: 'POST',
        body,
      }),
      // invalidatesTags: ['Chat'],
    }),

    uploadDocuments: build.mutation({
      query:(data) => ({
        url:'/file-upload-rag',
        method:'POST',
        body:data
      })
    }),

    questionPaperScraper: build.mutation<QuestionPaperScraperResponse, FormData>({
      query: (data) => ({
        method:'POST',
        url:'/question-papers-scraper',
        body: data
      })
    }),

    questionAnalyzer: build.mutation<unknown, QuestionAnalyzerRequest>({
      query: (data) => ({
        method:'POST',
        url:'/analyze-question-topics',
        body:data
      })
    }),



  }),
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useSendChatMessageMutation,
  useUploadDocumentsMutation,
  useQuestionAnalyzerMutation,
  useQuestionPaperScraperMutation,

} = aiApi;
