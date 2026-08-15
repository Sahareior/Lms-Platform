import { api } from './baseApi';

export interface SearchResults {
  exams: Array<{
    _id: string;
    name: string;
    image?: string;
    description?: string;
    category?: string;
  }>;
  courses: Array<{
    _id: string;
    title: string;
    thumbnail?: string;
    description?: string;
    exam?: string;
    instructor?: string;
  }>;
  lessons: Array<{
    _id: string;
    title: string;
    description?: string;
    course?: string;
    order?: number;
    duration?: number;
    isPreview?: boolean;
  }>;
}

const searchApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchAll: build.query<SearchResults, string>({
      query: (q) => ({ url: `/search?q=${encodeURIComponent(q)}` }),
    }),
  }),
  overrideExisting: false,
});

export const { useSearchAllQuery } = searchApi;
