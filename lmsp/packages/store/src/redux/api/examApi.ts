import { api } from "./baseApi";
import type { Exam } from '../../types';

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
            query:(data) =>({
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

        getAnalyzedQuestions: builder.query<any[], { examId?: string; versionId?: string } | void>({
            query: (params) => {
                const search = new URLSearchParams();
                if (params?.examId) search.set('exam', params.examId);
                if (params?.versionId) search.set('examVersion', params.versionId);
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

        getQuestionsByExam: builder.query<any[], { examId: string; versionId?: string, board?: string }>({
            query: ({ examId, versionId, board }) => {
                let url = `/questions/exam/${examId}`;
                const params = new URLSearchParams();
                if (versionId) params.append("versionId", versionId);
                if (board) params.append("board", board);
                
                const queryString = params.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }
                return { url };
            },
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
     useGetImportentTopicsQuery,
     useGetExamVersionsByExamQuery,
     useGetQuestionsByExamQuery } = examApi;
export default examApi;