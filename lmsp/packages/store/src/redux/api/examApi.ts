import { api } from "./baseApi";
import type { Exam, QuestionType } from '../../types';

export interface courseResponse {
    data: Exam[];
}

export interface SubjectByExam {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  exam: { _id: string; name: string } | string;
}

const examApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getExams: builder.query<Exam[], void>({
            query: () => ({ url: '/exams' }),
        }),

        postScrapQuestions: builder.mutation({
            query:(data: {
                exam: string;
                data: any[];
                examVersion?: string;
                subject?: string;
                board?: string;
                division?: string;
                questionType?: string;
                college?: string;
                year?: number;
            }) =>({
                method:'POST',
                url:'/questions/save',
                body:data
            })
        }),

        postQuestionPattern: builder.mutation({
            query: (data) => ({
                method:"POST",
                url:"/questions/question-pattern-save",
                body:data
            })
        }),

        getAnalyzedQuestions: builder.query<any[], { examId?: string; versionId?: string; subjectId?: string; board?: string } | void>({
            query: (params) => {
                const search = new URLSearchParams();
                if (params?.examId) search.set('exam', params.examId);
                if (params?.versionId) search.set('examVersion', params.versionId);
                if (params?.subjectId) search.set('subject', params.subjectId);
                if (params?.board) search.set('board', params.board);
                const qs = search.toString();
                return { url: `/questions/question-pattern${qs ? `?${qs}` : ''}` };
            },
        }),

        getSubjectsByExam: builder.query<SubjectByExam[], string>({
            query: (examId) => ({ url: `/subjects/exam/${examId}` }),
        }),

        selectExam: builder.mutation<void, any>({
            query: (data) => ({
                url: `/exams/select`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        removeExam: builder.mutation<void, any>({
            query: (data) => ({
                url: `/exams/remove`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        getExamVersionsByExam: builder.query<any[], string>({
            query: (examId) => ({ url: `/exam-version/exam/${examId}` }),
        }),

        getImportentTopics:builder.query({
            query:(examId) => ({ url: `/important-topics?exam=${examId}` })
        }),

        getQuestionsByExam: builder.query<any[], { examId: string; versionId?: string; board?: string; subjectId?: string; questionType?: QuestionType | ''; college?: string; year?: number }>({
            query: ({ examId, versionId, board, subjectId, questionType, college, year }) => {
                let url = `/questions/exam/${examId}`;
                const params = new URLSearchParams();
                if (versionId) params.append("versionId", versionId);
                if (board) params.append("board", board);
                if (subjectId) params.append("subject", subjectId);
                if (questionType) params.append("questionType", questionType);
                if (college) params.append("college", college);
                if (year) params.append("year", String(year));
                // (params appended below via toString)
                
                const queryString = params.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }
                return { url };
            },
            providesTags: ['Question'],
        }),

        getScheduleExamQuestions: builder.query<any[], string>({
            query: (scheduleId) => ({ url: `/schedule-exams/${scheduleId}/questions` }),
            providesTags: (_result, _error, id) => [{ type: 'ScheduleExam', id }],
        }),

        getSubjects: builder.query<SubjectByExam[], void>({
            query: () => ({ url: '/subjects' }),
        }),

        getTopicsByExamAndSubject: builder.query<any[], { examId: string; subjectId?: string; subjectName?: string }>({
            query: ({ examId, subjectId, subjectName }) => {
                const params = new URLSearchParams();
                if (examId) params.set('exam', examId);
                if (subjectId) params.set('subject', subjectId);
                if (subjectName) params.set('subjectName', subjectName);
                return { url: `/topics?${params.toString()}` };
            },
        }),

        resolveTopics: builder.mutation<{ mapping: Record<string, string> }, { exam: string; subject?: string; subjectName?: string; topics: string[] }>({
            query: (data) => ({
                url: '/topics/resolve',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useGetExamsQuery,
    useGetAnalyzedQuestionsQuery,
     useSelectExamMutation,
     useRemoveExamMutation,
     usePostScrapQuestionsMutation,
     usePostQuestionPatternMutation,
     useGetSubjectsByExamQuery,
     useGetSubjectsQuery,
     useGetImportentTopicsQuery,
     useGetExamVersionsByExamQuery,
     useGetQuestionsByExamQuery,
     useGetScheduleExamQuestionsQuery,
     useGetTopicsByExamAndSubjectQuery,
     useLazyGetTopicsByExamAndSubjectQuery,
     useResolveTopicsMutation } = examApi;
export default examApi;