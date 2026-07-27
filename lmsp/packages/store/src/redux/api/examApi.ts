import { api } from "./baseApi";
import type { Exam } from '../../types';

export interface courseResponse {
    data: Exam[];
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

        getAnalyzedQuestions: builder.query({
  query: () => "/questions/question-pattern"
}),


        selectExam: builder.mutation<void, any>({
            query: (data) => ({
                url: `/exams/select`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useGetExamsQuery,
    useGetAnalyzedQuestionsQuery,
     useSelectExamMutation,
     usePostScrapQuestionsMutation,
     usePostQuestionPatternMutation } = examApi;
export default examApi;