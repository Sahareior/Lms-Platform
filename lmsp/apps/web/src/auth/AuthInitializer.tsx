import React, { useEffect } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  loginSuccess,
  loginFailure,
  logout,
  setAuthToken,
  useGetMeQuery,
} from '@my-monorepo/store';

const AUTH_TOKEN_KEY = 'brainforge_auth_token';
const AUTH_USER_KEY = 'brainforge_auth_user';

// ─── Persistence helpers ────────────────────────────────────
export function persistAuth(token: string, user: any) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
}

export function clearPersistedAuth() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // ignore
  }
}

export function getPersistedToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getPersistedUser(): any | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Token Verification Component ───────────────────────────
/**
 * Verifies that the stored token is still valid by calling /auth/me.
 * If the token is expired/invalid, clears the session and logs out.
 * Runs silently in the background after auth restoration.
 */
function TokenVerifier() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  // Only call /auth/me if the user is authenticated (session restored from localStorage)
  const { isError, error } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      console.warn('Token verification failed, clearing session:', error);
      setAuthToken(null);
      clearPersistedAuth();
      dispatch(logout());
      // AuthGuard will redirect to /login
    }
  }, [isError, error, dispatch]);

  return null;
}

// ─── Initializer Component ──────────────────────────────────
interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer runs once on app mount to restore the auth session
 * from localStorage. It must be placed inside the Redux provider.
 */
const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Only restore if we're not already authenticated
    if (isAuthenticated) return;

    const token = getPersistedToken();
    const user = getPersistedUser();

    if (token && user) {
      // Restore the token into the API client
      setAuthToken(token);
      // Restore the user into Redux (optimistic)
      dispatch(loginSuccess(user));
      // TokenVerifier will then validate the token via /auth/me
    } else {
      // No session – mark loading as complete so AuthGuard can redirect
      dispatch(loginFailure());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      {children}
      <TokenVerifier />
    </>
  );
};

export default AuthInitializer;
