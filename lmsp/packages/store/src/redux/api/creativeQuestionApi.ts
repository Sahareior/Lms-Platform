import { useMemo, useEffect, useState, useCallback } from 'react';
import { api } from './baseApi';

// ─── Types (mirror lmss/models/CreativeQuestionSet.js) ────────

export interface CQSource {
    kind?: string;
    board?: string;
    year?: string;
    questionNo?: string;
    raw?: string;
}

/** An image attached to a stimulus, part question or part answer. */
export interface CQImage {
    url: string;
    caption?: string;
}

export interface CQPart {
    label: string;
    text: string;
    marks?: number;
    cognitiveType?: string;
    answer?: string;
    /** Images shown with the question text (figures/diagrams to look at). */
    questionImages?: CQImage[];
    /** Images revealed together with the answer (solution diagrams). */
    answerImages?: CQImage[];
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
    imageNeeded?: boolean;
    stimulus?: string;
    stimulusBlocks?: Array<{ kind?: string; value: string }>;
    /** Images rendered inside the উদ্দীপক box. */
    stimulusImages?: CQImage[];
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
    imageNeededCount?: number;
    emptyAnswerCount?: number;
    emptyQuestionTextCount?: number;
    chapters: CQChapter[];
    createdAt?: string;
    updatedAt?: string;
}

/** Full set returned by GET /creative-questions/:setId (legacy, unpaged). */
export interface CQQuestionSet extends Omit<CQQuestionSetSummary, 'questionCount' | 'chapters'> {
    questions: CQQuestion[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Paginated set response — GET /creative-questions/:setId?page=&limit=
 * `page === 1` also carries the set's real `chapters` summary.
 */
export interface CQQuestionSetPage extends Omit<CQQuestionSet, 'questions'> {
    questions: CQQuestion[];
    totalQuestions: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface GetCQSetPageRequest {
    setId: string;
    page?: number;
    limit?: number;
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

export type CQImportMode = 'upsert' | 'skip' | 'error' | 'replace';

export interface ImportCQQuestionsRequest {
    setId: string;
    mode?: CQImportMode;
    file?: File;
    data?: CQQuestion[];
}

export interface ImportCQQuestionsResponse {
    message: string;
    addedCount: number;
    updatedCount: number;
    skippedCount: number;
    totalQuestions: number;
    set?: CQQuestionSet;
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
            // Set payloads are large; keep them warm so switching back to a
            // previously viewed set is instant instead of refetching.
            keepUnusedDataFor: 300,
        }),

        // Server-paginated set slice (100 questions per page). The backend
        // $slice-aggregates instead of loading the whole questions array.
        getCreativeQuestionSetPage: build.query<CQQuestionSetPage, GetCQSetPageRequest>({
            query: ({ setId, page = 1, limit = 50 }) => {
                const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
                return { url: `/creative-questions/${setId}?${qs.toString()}` };
            },
            providesTags: (_r, _e, { setId }) => [{ type: 'CreativeQuestion', id: setId }],
            // Set payloads are large; keep pages warm so navigating back to a
            // previously viewed set is instant instead of refetching.
            keepUnusedDataFor: 300,
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

        importCreativeQuestions: build.mutation<
            ImportCQQuestionsResponse,
            ImportCQQuestionsRequest
        >({
            query: ({ setId, mode = 'upsert', file, data }) => {
                if (file) {
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('mode', mode);
                    return {
                        url: `/creative-questions/${setId}/import`,
                        method: 'POST',
                        body: fd,
                    };
                }
                return {
                    url: `/creative-questions/${setId}/import`,
                    method: 'POST',
                    body: { mode, data },
                };
            },
            invalidatesTags: (_r, _e, { setId }) => [
                'CreativeQuestion',
                { type: 'CreativeQuestion', id: setId },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetCreativeQuestionSetsQuery,
    useGetCreativeQuestionSetByIdQuery,
    useGetCreativeQuestionSetPageQuery,
    useLazyGetCreativeQuestionSetPageQuery,
    useUploadCreativeQuestionSetMutation,
    useUpdateCreativeQuestionSetMutation,
    useUpdateCreativeQuestionMutation,
    useDeleteCreativeQuestionMutation,
    useDeleteCreativeQuestionSetMutation,
    useImportCreativeQuestionsMutation,
} = creativeQuestionApi;
// ─── useCQSetQuestions ────────────────────────────────────────
// Fetches a set in 100-question pages: page 1 renders immediately while the
// remaining pages load in the background and are merged in order. Returns a
// superset of the legacy useGetCreativeQuestionSetByIdQuery result, so it is
// a drop-in replacement for consumers that want faster first paint.
export const useCQSetQuestions = (
    setId: string | undefined,
    options?: { skip?: boolean; pageSize?: number }
) => {
    const pageSize = options?.pageSize ?? 50;
    const skip = options?.skip ?? !setId;

    // Page 1 renders the UI; its `totalQuestions` tells us how many more
    // pages to background-load.
    const page1 = useGetCreativeQuestionSetPageQuery(
        { setId: setId ?? '', page: 1, limit: pageSize },
        { skip }
    );

    const [trigger, { isLoading: pagesLoading }] = useLazyGetCreativeQuestionSetPageQuery();

    const total = page1.data?.totalQuestions ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    const [backgroundQuestions, setBackgroundQuestions] = useState<CQQuestion[]>([]);
    // Bumped by `reload()` so consumers can force background pages to refetch
    // after a mutation (page 1 refetches immediately; stale pages are purged).
    const [reloadKey, setReloadKey] = useState(0);

    const bgKey = skip ? '' : setId ?? '';
    useEffect(() => {
        setBackgroundQuestions([]);
        if (!bgKey || totalPages <= 1) return;
        let cancelled = false;
        // Fire pages 2..N in parallel; RTK Query serves already-cached pages
        // instantly and only fetches missing/invalidated ones.
        Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
                trigger({ setId: bgKey, page: i + 2, limit: pageSize })
                    .unwrap()
                    .then((p) => p.questions)
                    .catch(() => [] as CQQuestion[])
            )
        ).then((chunks) => {
            if (!cancelled) setBackgroundQuestions(chunks.flat());
        });
        return () => {
            cancelled = true;
        };
    }, [bgKey, totalPages, pageSize, trigger, reloadKey]);

    // Merged slice: page 1 + all background pages, kept in server order.
    // Memoized so consumers' useMemo deps see a stable array identity until
    // new data actually arrives.
    const questions = useMemo(() => {
        const first = page1.data?.questions ?? [];
        if (backgroundQuestions.length === 0) return first;
        return [...first, ...backgroundQuestions];
    }, [page1.data, backgroundQuestions]);

    const refetchAll = useCallback(() => {
        setReloadKey((k) => k + 1);
        page1.refetch();
    }, [page1.refetch]);

    return {
        data: page1.data
            ? ({ ...page1.data, questions } as CQQuestionSetPage & { questions: CQQuestion[] })
            : undefined,
        questions,
        isLoading: page1.isLoading,
        isError: page1.isError,
        error: page1.error,
        isFetching: page1.isFetching || pagesLoading,
        hasAllPages: !skip && backgroundQuestions.length >= Math.max(0, total - pageSize),
        refetch: refetchAll,
    };
};
