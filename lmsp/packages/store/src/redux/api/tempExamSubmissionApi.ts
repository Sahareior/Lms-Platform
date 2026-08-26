import { api } from './baseApi';

// ─── Types ──────────────────────────────────────────────────
export interface SubmittedAnswerItem {
  questionId?: string;
  questionNumber: number;
  selectedOption: string;
  selectedIndex: number;
  timeTaken?: number;
}

export interface TempExamSubmission {
  _id?: string;
  user: string;
  exam: string;
  examVersion?: string | null;
  scheduleExam?: string | null;
  subject?: string | null;
  board?: string | null;
  paperType?: string | null;
  selectedAnswers: Record<string, number>;
  submittedAnswers: SubmittedAnswerItem[];
  rollDigits?: string[];
  candidateName?: string;
  subjectDigits?: (number | null)[];
  paperCode?: number | null;
  extraDigits?: (number | null)[];
  setDigits?: (number | null)[];
  timeLeft?: number | null;
  attemptId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveTempExamSubmissionRequest {
  userId: string;
  examId: string;
  examVersionId?: string;
  scheduleExamId?: string;
  subjectId?: string;
  board?: string;
  paperType?: string;
  selectedAnswers: Record<string | number, number>;
  submittedAnswers?: SubmittedAnswerItem[];
  rollDigits?: string[];
  candidateName?: string;
  subjectDigits?: (number | null)[];
  paperCode?: number | null;
  extraDigits?: (number | null)[];
  setDigits?: (number | null)[];
  timeLeft?: number | null;
  attemptId?: string | null;
}

export interface DeleteTempExamSubmissionRequest {
  userId: string;
  examId: string;
  versionId?: string;
  board?: string;
}

// ─── Injected Endpoints ─────────────────────────────────────
const tempExamSubmissionApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── Get temporary exam submission ────────────────────────
    getTempExamSubmission: build.query<
      TempExamSubmission | null,
      { userId: string; examId: string; versionId?: string; board?: string }
    >({
      query: ({ userId, examId, versionId, board }) => {
        let url = `/temp-exam-submission?userId=${userId}&examId=${examId}`;
        if (versionId) url += `&versionId=${versionId}`;
        if (board) url += `&board=${board}`;
        return { url };
      },
      providesTags: (_result, _error, { examId }) => [
        { type: 'TempExamSubmission', id: examId },
      ],
    }),

    // ── Save/Update temporary exam submission ────────────────
    saveTempExamSubmission: build.mutation<
      { message: string; submission: TempExamSubmission },
      SaveTempExamSubmissionRequest
    >({
      query: (data) => ({
        url: '/temp-exam-submission',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { examId }) => [
        { type: 'TempExamSubmission', id: examId },
      ],
    }),

    // ── Delete temporary exam submission ─────────────────────
    deleteTempExamSubmission: build.mutation<
      { message: string },
      DeleteTempExamSubmissionRequest
    >({
      query: (data) => {
        const params = new URLSearchParams({
          userId: data.userId,
          examId: data.examId,
        });
        if (data.versionId) params.set('versionId', data.versionId);
        if (data.board) params.set('board', data.board);
        return {
          url: `/temp-exam-submission?${params.toString()}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_result, _error, { examId }) => [
        { type: 'TempExamSubmission', id: examId },
      ],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetTempExamSubmissionQuery,
  useSaveTempExamSubmissionMutation,
  useDeleteTempExamSubmissionMutation,
} = tempExamSubmissionApi;
