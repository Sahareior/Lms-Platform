import { api } from './baseApi';

// ─── Types (mirror lmss/models/CreativeQuestionSet.js) ────────

export interface CQSource {
    kind?: string;
    board?: string;
    year?: string;
    questionNo?: string;
    raw?: string;
}

export interface CQPart {
    label: string;
    text: string;
    marks?: number;
    cognitiveType?: string;
    answer?: string;
    modelAnswers?: string[];
}

export interface CQQuestion {
    /** MongoDB subdocument id (auto). */
    _id?: string;
    id: string;
    chapterId: string;
    chapterNumber: number;
    chapter: string;
    source?: CQSource;
    type?: string;
    number: number;
    stimulus?: string;
    stimulusBlocks?: Array<{ kind?: string; value: string }>;
    parts: CQPart[];
    answerNotes?: string;
}

export interface CQChapter {
    id: string;
    number: number;
    name: string;
}

/** Summary returned by GET /creative-questions (no question payloads). */
export interface CQQuestionSetSummary {
    _id: string;
    exam: string | { _id: string; name: string; category?: string };
    examVersion?: string | { _id: string; examVersion: string } | null;
    subject?: string | { _id: string; name: string } | null;
    title?: string;
    description?: string;
    questionCount: number;
    chapters: CQChapter[];
    createdAt?: string;
    updatedAt?: string;
}

/** Full set returned by GET /creative-questions/:setId. */
export interface CQQuestionSet extends Omit<CQQuestionSetSummary, 'questionCount' | 'chapters'> {
    questions: CQQuestion[];
    createdAt?: string;
    updatedAt?: string;
}

export interface UploadCQSetRequest {
    exam: string;
    examVersion?: string;
    subject?: string;
    title?: string;
    description?: string;
    /** Raw JSON file for multipart upload. */
    file?: File;
    /** Or inline JSON payload (used when no file is provided). */
    data?: CQQuestion[];
}

export interface UploadCQSetResponse {
    message: string;
    setId: string;
    questionCount: number;
}

/** A structured validation error from the server. */
export interface CQValidationError {
    status: number;
    data: {
        message: string;
        errors?: string[];
        errorCount?: number;
    };
}

const creativeQuestionApi = api.injectEndpoints({
    endpoints: (build) => ({
        // ── Public ────────────────────────────────────────────────
        getCreativeQuestionSets: build.query<
            CQQuestionSetSummary[],
            { exam?: string; examVersion?: string; subject?: string } | undefined
        >({
            query: (params) => {
                const qs = new URLSearchParams();
                const p = params ?? {};
                if (p.exam) qs.set('exam', p.exam);
                if (p.examVersion) qs.set('examVersion', p.examVersion);
                if (p.subject) qs.set('subject', p.subject);
                const s = qs.toString();
                return { url: s ? `/creative-questions?${s}` : '/creative-questions' };
            },
            providesTags: ['CreativeQuestion'],
        }),

        getCreativeQuestionSetById: build.query<CQQuestionSet, string>({
            query: (setId) => ({ url: `/creative-questions/${setId}` }),
            providesTags: (_r, _e, setId) => [{ type: 'CreativeQuestion', id: setId }],
        }),

        // ── Admin ─────────────────────────────────────────────────
        uploadCreativeQuestionSet: build.mutation<UploadCQSetResponse, UploadCQSetRequest>({
            query: ({ file, data, ...meta }) => {
                if (file) {
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('exam', meta.exam);
                    if (meta.examVersion) fd.append('examVersion', meta.examVersion);
                    if (meta.subject) fd.append('subject', meta.subject);
                    if (meta.title) fd.append('title', meta.title);
                    if (meta.description) fd.append('description', meta.description);
                    return {
                        url: '/creative-questions/upload',
                        method: 'POST',
                        body: fd,
                    };
                }
                return {
                    url: '/creative-questions/upload',
                    method: 'POST',
                    body: { ...meta, data },
                };
            },
            invalidatesTags: ['CreativeQuestion'],
        }),

        updateCreativeQuestionSet: build.mutation<
            CQQuestionSet,
            {
                setId: string;
                data: {
                    title?: string;
                    description?: string;
                    examVersion?: string | null;
                    subject?: string | null;
                    questions?: CQQuestion[];
                };
            }
        >({
            query: ({ setId, data }) => ({
                url: `/creative-questions/${setId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_r, _e, { setId }) => [
                'CreativeQuestion',
                { type: 'CreativeQuestion', id: setId },
            ],
        }),

        updateCreativeQuestion: build.mutation<
            { message: string; question: CQQuestion },
            { setId: string; questionId: string; data: Partial<CQQuestion> }
        >({
            query: ({ setId, questionId, data }) => ({
                url: `/creative-questions/${setId}/question/${encodeURIComponent(questionId)}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_r, _e, { setId }) => [
                'CreativeQuestion',
                { type: 'CreativeQuestion', id: setId },
            ],
        }),

        deleteCreativeQuestion: build.mutation<
            { message: string; questionCount: number },
            { setId: string; questionId: string }
        >({
            query: ({ setId, questionId }) => ({
                url: `/creative-questions/${setId}/question/${encodeURIComponent(questionId)}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_r, _e, { setId }) => [
                'CreativeQuestion',
                { type: 'CreativeQuestion', id: setId },
            ],
        }),

        deleteCreativeQuestionSet: build.mutation<{ message: string }, string>({
            query: (setId) => ({
                url: `/creative-questions/${setId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CreativeQuestion'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetCreativeQuestionSetsQuery,
    useGetCreativeQuestionSetByIdQuery,
    useUploadCreativeQuestionSetMutation,
    useUpdateCreativeQuestionSetMutation,
    useUpdateCreativeQuestionMutation,
    useDeleteCreativeQuestionMutation,
    useDeleteCreativeQuestionSetMutation,
} = creativeQuestionApi;
