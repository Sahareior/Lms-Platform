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
let _aiBaseUrl = 'https://llm-backend-hfna.onrender.com/';
// let _aiBaseUrl = 'http://127.0.0.1:5000/';

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

/** Response from POST /file-upload-rag — indexing runs in the background. */
export interface RagUploadResponse {
  success?: boolean;
  job_id?: string;
  status?: string;
  file?: string;
  supabase_doc_id?: string | null;
  message?: string;
}

/** Status payload from GET /rag/job/{job_id} (polled while indexing). */
export interface RagJobStatus {
  status: string;
  progress: number;
  total: number;
  message: string | null;
  error: string | null;
  result: unknown;
}

// ─── AI User Performance Report Types ────────────────────────
export interface AiPerformanceStats {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percentage: number;
  exam: string;
}

export interface AiScoreAnalysis {
  percentage: number;
  verdict: string;
  message: string;
}

export interface AiSubjectBreakdown {
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
  isWeak: boolean;
  isCritical: boolean;
  /** Optional – only present in demo/fallback data, not from the AI API */
  trend?: string;
}

export interface AiStrength {
  topic: string;
  accuracy: number;
  detail: string;
}

export interface AiWeakArea {
  topic: string;
  accuracy: number;
  reason: string;
  recommendation: string;
}

export interface AiMistakeBreakdown {
  question_text: string;
  identified_subject: string;
  user_answer: string;
  correct_answer: string;
  explanation: string;
}

export interface AiStudyPlanItem {
  day: string;
  focus_subject: string;
  title: string;
  description: string;
  duration_minutes: number;
}

export interface AiPerformanceReport {
  score_analysis: AiScoreAnalysis;
  subject_breakdown: AiSubjectBreakdown[];
  strengths: AiStrength[];
  weak_areas: AiWeakArea[];
  mistake_breakdown: AiMistakeBreakdown[];
  study_plan: AiStudyPlanItem[];
}

export interface AiPerformanceResponse {
  success: boolean;
  stats: AiPerformanceStats;
  ai_report: AiPerformanceReport;
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

    uploadDocuments: build.mutation<RagUploadResponse, FormData>({
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

    airagUploadStatus: build.query<RagJobStatus, string>({
      query:(id) => ({
        url:`rag/job/${id}`,
        method:'GET'
      })
    }),

    aiUserPerFormance: build.mutation<AiPerformanceResponse, unknown>({
      query:(data) => ({
        url:'/user-performance',
        method:'POST',
        body:data
      })
    })



  }),
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useSendChatMessageMutation,
  useUploadDocumentsMutation,
  useQuestionAnalyzerMutation,
  useQuestionPaperScraperMutation,
  useAiUserPerFormanceMutation,
  useAiragUploadStatusQuery
} = aiApi;
