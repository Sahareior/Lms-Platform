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
let _baseUrl = 'https://lms-platform-fjwv.onrender.com/';
// let _baseUrl = 'http://localhost:3000/';
// let _baseUrl = 'https://lmss-livid.vercel.app/';
let _token: string | null = null;
let _refreshToken: string | null = null;

/**
 * Access tokens are short-lived (15m). When the backend returns 401, we try
 * one silent refresh using the long-lived refresh token, replay the failed
 * request, and only surface the error if that also fails.
 */
let refreshInFlight: Promise<boolean> | null = null;

export const REFRESH_TOKEN_KEY = 'brainforge_refresh_token';

export function getRefreshToken(): string | null {
  try {
    return _refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null) {
  _refreshToken = token;
  try {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

// Components (e.g. AuthInitializer) can subscribe to token refreshes so the
// persisted copy stays in sync after silent rotations.
type TokenListener = (token: string) => void;
const listeners = new Set<TokenListener>();
export function onAccessTokenRefreshed(cb: TokenListener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

async function tryRefreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  // Deduplicate concurrent refresh attempts into one network call.
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${_baseUrl}auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data?.token) return false;
        _token = data.token;
        if (data.refreshToken) setRefreshToken(data.refreshToken); // rotation
        listeners.forEach((cb) => cb(data.token));
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

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

/**
 * Clear both tokens (logout). Also clears the persisted refresh token.
 */
export function clearAuthTokens() {
  _token = null;
  setRefreshToken(null);
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
  const execute = () => {
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

  const result = await execute();

  // On 401 (expired access token), attempt one silent refresh + replay.
  // Auth endpoints are excluded (their 401s are real credential errors and
  // /auth/refresh itself must not recurse).
  const url = typeof args === 'string' ? args : args.url;
  const isAuthRoute =
    url.includes('/auth/refresh') ||
    url.includes('/auth/sign-in') ||
    url.includes('/auth/sign-up') ||
    url.includes('/auth/google') ||
    url.includes('/auth/logout');
  if (result.error?.status === 401 && !isAuthRoute) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) return execute();
  }
  return result;
};

// ─── Tag Types ──────────────────────────────────────────────
export const tagTypes = [
  'User',
  'Course',
  'Quiz',
  'Performance',
  'Question',
  'Lesson',
  'Module',
  'Note',
  'ExamVersion',
  'Subject',
  'College',
  'QuizAttempt',
  'ScheduleExam',
  'AiChat',
  'Notification',
  'Certificate',
  'TempExamSubmission',
  'Favorite',
  'QuestionStats',
  'StudyPdf',
  'BlogPost',
  'StudyGroupLink',
] as const;

// ─── Base API Slice ─────────────────────────────────────────
export const api = createApi({
  baseQuery: dynamicBaseQuery,
  tagTypes,
  endpoints: () => ({}),
});
