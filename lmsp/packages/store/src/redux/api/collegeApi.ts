import { api } from "./baseApi";

export interface College {
  _id: string;
  name: string;
  code?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

const collegeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getColleges: builder.query<College[], void>({
      query: () => ({ url: '/colleges' }),
      providesTags: ['College'],
    }),

    createCollege: builder.mutation<College, { name: string; code?: string; location?: string }>({
      query: (data) => ({
        url: '/colleges',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['College'],
    }),

    updateCollege: builder.mutation<College, { collegeId: string; name?: string; code?: string; location?: string }>({
      query: ({ collegeId, ...data }) => ({
        url: `/colleges/${collegeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['College'],
    }),

    deleteCollege: builder.mutation<{ message: string }, string>({
      query: (collegeId) => ({
        url: `/colleges/${collegeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['College'],
    }),
  }),
});

export const {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
} = collegeApi;
export default collegeApi;
