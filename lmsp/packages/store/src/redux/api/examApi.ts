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

        getAnalyzedQuestions: builder.query<any[], string | void>({
            query: (examId?: string) => {
                const params = examId ? `?exam=${examId}` : '';
                return { url: `/questions/question-pattern${params}` };
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
        }),

        getExamVersionsByExam: builder.query<any[], string>({
            query: (examId) => ({ url: `/exam-version/exam/${examId}` }),
        }),

        getQuestionsByExam: builder.query<any[], { examId: string; versionId?: string }>({
            query: ({ examId, versionId }) => {
                let url = `/questions/exam/${examId}`;
                if (versionId) url += `?versionId=${versionId}`;
                return { url };
            },
        }),
    }),
});

export const { useGetExamsQuery,
    useGetAnalyzedQuestionsQuery,
     useSelectExamMutation,
     usePostScrapQuestionsMutation,
     usePostQuestionPatternMutation,
     useGetSubjectsByExamQuery,
     useGetExamVersionsByExamQuery,
     useGetQuestionsByExamQuery } = examApi;
export default examApi;