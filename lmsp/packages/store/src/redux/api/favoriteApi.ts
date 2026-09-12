import { api } from './baseApi';

export interface FavoriteQuestionSnapshot {
  questionNumber?: number;
  questionText?: string;
  options?: Record<string, string>;
  correctAnswer?: string;
  explanation?: string;
}

export interface FavoriteItem {
  _id: string;
  user: string;
  questionId: string;
  questionDocId?: string;
  exam?: { _id: string; name: string; category?: string };
  examVersion?: { _id: string; examVersion: string };
  subject?: { _id: string; name: string };
  questionSnapshot?: FavoriteQuestionSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface ToggleFavoriteRequest {
  questionId: string;
  questionDocId?: string;
  exam?: string;
  examVersion?: string;
  subject?: string;
  questionSnapshot?: FavoriteQuestionSnapshot;
}

export interface ToggleFavoriteResponse {
  success: boolean;
  favorited: boolean;
  questionId: string;
  favorite?: FavoriteItem;
  message: string;
}

export interface GetFavoritesResponse {
  favorites: FavoriteItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetFavoriteIdsResponse {
  questionIds: string[];
}

const favoriteApi = api.injectEndpoints({
  endpoints: (build) => ({
    toggleFavorite: build.mutation<ToggleFavoriteResponse, ToggleFavoriteRequest>({
      query: (body) => ({
        url: 'favorites/toggle',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),

    getMyFavorites: build.query<
      GetFavoritesResponse,
      { exam?: string; subject?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: 'favorites',
        params: params || {},
      }),
      providesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),

    getFavoriteQuestionIds: build.query<GetFavoriteIdsResponse, void>({
      query: () => 'favorites/ids',
      providesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useToggleFavoriteMutation,
  useGetMyFavoritesQuery,
  useGetFavoriteQuestionIdsQuery,
} = favoriteApi;
