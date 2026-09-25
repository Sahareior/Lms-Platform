import { api } from './baseApi';

export interface Certificate {
  _id: string;
  user: string;
  course: string;
  certificateId: string;
  userName: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  issuedAt: string;
}

const certificateApi = api.injectEndpoints({
  endpoints: (build) => ({
    issueCertificate: build.mutation<
      { message: string; certificate: Certificate },
      { userId: string; courseId: string }
    >({
      query: (data) => ({ url: '/certificates/issue', method: 'POST', body: data }),
      invalidatesTags: [{ type: 'Certificate', id: 'LIST' }],
    }),

    getMyCertificates: build.query<Certificate[], string>({
      query: (userId) => ({ url: `/certificates/mine?userId=${userId}` }),
      providesTags: [{ type: 'Certificate', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useIssueCertificateMutation, useGetMyCertificatesQuery } = certificateApi;
