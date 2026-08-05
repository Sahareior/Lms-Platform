import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

// ─── Configuration State ───────────────────────────────────
// These are read on every request via closure, so they can be
// updated at any time without rebuilding the API slice.
let _baseUrl = 'https://lmss-livid.vercel.app/';
// let _baseUrl = 'http://localhost:3000/';
let _token: string | null = null;

/**
 * Configure the shared API client.
 * Call this once in each app's entry point *before* rendering.
 */
export function configureApi(options: { baseUrl?: string }) {
  if (options.baseUrl) _baseUrl = options.baseUrl;
}

/**
 * Persist the current auth token so it's sent on every request.
 * Call this after login / on app start (if a stored token exists).
 */
export function setAuthToken(token: string | null) {
  _token = token;
}

/** Read the current auth token (e.g. to persist it to storage). */
export function getAuthToken(): string | null {
  return _token;
}

// ─── Custom Base Query ─────────────────────────────────────
// A function-based baseQuery so _baseUrl and _token are dynamic.
const dynamicBaseQuery: BaseQueryFn<
  FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: _baseUrl,
    prepareHeaders: (headers) => {
      if (_token) {
        headers.set('Authorization', `Bearer ${_token}`);
      }
      return headers;
    },
  });
  return rawBaseQuery(args, api, extraOptions);
};

// ─── Tag Types ──────────────────────────────────────────────
export const tagTypes = [
  'User',
  'Course',
  'Quiz',
  'Performance',
  'Question',
  'Lesson',
  'ExamVersion',
  'Subject',
  'QuizAttempt',
  'ScheduleExam',
] as const;

// ─── Base API Slice ─────────────────────────────────────────
export const api = createApi({
  baseQuery: dynamicBaseQuery,
  tagTypes,
  endpoints: () => ({}),
});
