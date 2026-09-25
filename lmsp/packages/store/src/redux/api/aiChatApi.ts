import { api } from './baseApi';

// ─── Types ──────────────────────────────────────────────────
export interface AiChatHistoryMessage {
  _id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export interface AiChatHistoryResponse {
  success: boolean;
  /** Messages ordered oldest → newest (ready to render top → bottom). */
  messages: AiChatHistoryMessage[];
  /** Pass as `before` to fetch the next (older) page. Null when no more. */
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SaveAiChatMessageInput {
  sender: 'user' | 'ai';
  text: string;
  chapter?: string;
}

export interface SaveAiChatMessagesResponse {
  success: boolean;
  messages: AiChatHistoryMessage[];
}

// ─── Injected Endpoints ─────────────────────────────────────
// These hit the main LMS backend (port 3000 / /ai-chat), not the
// LLM backend, so the chat history is persisted per user.
const aiChatApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── Get paginated chat history ───────────────────────────
    // Cursor-based: `before` = id of the oldest loaded message, used
    // to fetch older messages when the user scrolls to the top.
    getAiChatHistory: build.query<
      AiChatHistoryResponse,
      { limit?: number; before?: string; chapter?: string }
    >({
      query: ({ limit = 30, before, chapter }) => {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        if (before) params.set('before', before);
        if (chapter) params.set('chapter', chapter);
        return { url: `/ai-chat/history?${params.toString()}` };
      },
      providesTags: (_result, _error, arg) => [
        { type: 'AiChat', id: arg?.chapter || 'GLOBAL' },
      ],
    }),

    // ── Persist chat messages ────────────────────────────────
    saveAiChatMessages: build.mutation<
      SaveAiChatMessagesResponse,
      { messages: SaveAiChatMessageInput[]; chapter?: string }
    >({
      query: (data) => ({
        url: '/ai-chat/messages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'AiChat', id: arg?.chapter || 'GLOBAL' },
      ],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetAiChatHistoryQuery,
  useLazyGetAiChatHistoryQuery,
  useSaveAiChatMessagesMutation,
} = aiChatApi;
