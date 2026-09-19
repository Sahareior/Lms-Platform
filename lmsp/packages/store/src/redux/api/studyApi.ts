import { api } from './baseApi';

// ─── Types ──────────────────────────────────────────────────
export interface StudyPdf {
  _id: string;
  title: string;
  description?: string;
  category: 'academic' | 'job';
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number;
  mimeType?: string;
  coverImage?: string | null;
  isPublished: boolean;
  downloadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string | null;
  tags?: string[];
  author?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type StudyGroupPlatform =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'whatsapp'
  | 'telegram'
  | 'other';

export interface StudyGroupLink {
  _id: string;
  title: string;
  url: string;
  platform: StudyGroupPlatform;
  description?: string;
  iconUrl?: string | null;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyPdfsResponse {
  pdfs: StudyPdf[];
}
export interface BlogPostsResponse {
  posts: BlogPost[];
}
export interface StudyGroupLinksResponse {
  links: StudyGroupLink[];
}

// ─── Endpoints ──────────────────────────────────────────────
const studyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Study PDFs ──
    getStudyPdfs: builder.query<StudyPdfsResponse, { category?: 'academic' | 'job'; search?: string; includeUnpublished?: boolean } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.category) qs.set('category', params.category);
        if (params?.search) qs.set('search', params.search);
        if (params?.includeUnpublished) qs.set('includeUnpublished', 'true');
        const s = qs.toString();
        return { url: `/study-section${s ? `?${s}` : ''}` };
      },
      providesTags: ['StudyPdf'],
    }),

    getStudyPdfById: builder.query<{ pdf: StudyPdf }, string>({
      query: (id) => ({ url: `/study-section/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'StudyPdf', id }],
    }),

    createStudyPdf: builder.mutation<{ message: string; pdf: StudyPdf }, Partial<StudyPdf>>({
      query: (data) => ({ url: '/study-section', method: 'POST', body: data }),
      invalidatesTags: ['StudyPdf'],
    }),

    updateStudyPdf: builder.mutation<{ message: string; pdf: StudyPdf }, { id: string; data: Partial<StudyPdf> }>({
      query: ({ id, data }) => ({ url: `/study-section/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'StudyPdf', id }, 'StudyPdf'],
    }),

    deleteStudyPdf: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/study-section/${id}`, method: 'DELETE' }),
      invalidatesTags: ['StudyPdf'],
    }),

    incrementPdfDownload: builder.mutation<{ downloadCount: number }, string>({
      query: (id) => ({ url: `/study-section/${id}/download`, method: 'POST' }),
    }),

    // ── Blog Posts ──
    getBlogPosts: builder.query<BlogPostsResponse, { search?: string; tag?: string; limit?: number; includeUnpublished?: boolean } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.search) qs.set('search', params.search);
        if (params?.tag) qs.set('tag', params.tag);
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.includeUnpublished) qs.set('includeUnpublished', 'true');
        const s = qs.toString();
        return { url: `/study-section/blog-posts${s ? `?${s}` : ''}` };
      },
      providesTags: ['BlogPost'],
    }),

    getBlogPostById: builder.query<{ post: BlogPost }, string>({
      query: (id) => ({ url: `/study-section/blog-posts/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'BlogPost', id }],
    }),

    createBlogPost: builder.mutation<{ message: string; post: BlogPost }, Partial<BlogPost>>({
      query: (data) => ({ url: '/study-section/blog-posts', method: 'POST', body: data }),
      invalidatesTags: ['BlogPost'],
    }),

    updateBlogPost: builder.mutation<{ message: string; post: BlogPost }, { id: string; data: Partial<BlogPost> }>({
      query: ({ id, data }) => ({ url: `/study-section/blog-posts/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'BlogPost', id }, 'BlogPost'],
    }),

    deleteBlogPost: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/study-section/blog-posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BlogPost'],
    }),

    // ── Study Group Links ──
    getStudyGroupLinks: builder.query<StudyGroupLinksResponse, { includeInactive?: boolean } | void>({
      query: (params) => ({
        url: `/study-section/study-group-links${params?.includeInactive ? '?includeInactive=true' : ''}`,
      }),
      providesTags: ['StudyGroupLink'],
    }),

    createStudyGroupLink: builder.mutation<{ message: string; link: StudyGroupLink }, Partial<StudyGroupLink>>({
      query: (data) => ({ url: '/study-section/study-group-links', method: 'POST', body: data }),
      invalidatesTags: ['StudyGroupLink'],
    }),

    updateStudyGroupLink: builder.mutation<{ message: string; link: StudyGroupLink }, { id: string; data: Partial<StudyGroupLink> }>({
      query: ({ id, data }) => ({ url: `/study-section/study-group-links/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'StudyGroupLink', id }, 'StudyGroupLink'],
    }),

    deleteStudyGroupLink: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/study-section/study-group-links/${id}`, method: 'DELETE' }),
      invalidatesTags: ['StudyGroupLink'],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useGetStudyPdfsQuery,
  useGetStudyPdfByIdQuery,
  useCreateStudyPdfMutation,
  useUpdateStudyPdfMutation,
  useDeleteStudyPdfMutation,
  useIncrementPdfDownloadMutation,
  useGetBlogPostsQuery,
  useGetBlogPostByIdQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetStudyGroupLinksQuery,
  useCreateStudyGroupLinkMutation,
  useUpdateStudyGroupLinkMutation,
  useDeleteStudyGroupLinkMutation,
} = studyApi;
