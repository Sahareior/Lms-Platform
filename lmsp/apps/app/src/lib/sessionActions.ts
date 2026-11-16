import {
  loginSuccess,
  setAuthToken,
  setRefreshToken,
  type AppDispatch,
  type User,
} from '@my-monorepo/store';
import { persistSession } from './authStorage';

interface AuthPayload {
  user: User;
  token: string;
  refreshToken?: string | null;
}

/**
 * Applies a successful auth response: token to the API client, tokens to
 * storage, user to Redux. Shared by every sign-in entry point.
 */
export async function applyAuthResponse(
  dispatch: AppDispatch,
  data: AuthPayload
) {
  setAuthToken(data.token);
  setRefreshToken(data.refreshToken ?? null);
  await persistSession(data.token, data.user, data.refreshToken);
  dispatch(loginSuccess(data.user));
}
