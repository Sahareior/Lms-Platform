import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Theme, User } from '@my-monorepo/store';

/**
 * Session persistence for React Native.
 *
 * Keys match the web app so a session format change stays aligned;
 * values are stored in AsyncStorage instead of localStorage.
 */
export const AUTH_TOKEN_KEY = 'brainforge_auth_token';
export const AUTH_USER_KEY = 'brainforge_auth_user';
export const THEME_KEY = 'app-theme';

export interface StoredSession {
  token: string | null;
  user: User | null;
}

export async function persistSession(
  token: string,
  user: User,
  refreshToken?: string | null
) {
  const writes: Promise<unknown>[] = [
    AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
  ];
  if (refreshToken) {
    writes.push(AsyncStorage.setItem('brainforge_refresh_token', refreshToken));
  }
  await Promise.all(writes).catch(() => undefined);
}

export async function restoreSession(): Promise<StoredSession> {
  try {
    const [token, rawUser] = await Promise.all([
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
      AsyncStorage.getItem(AUTH_USER_KEY),
    ]);
    const user = rawUser ? (JSON.parse(rawUser) as User) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export async function clearSession() {
  await AsyncStorage.multiRemove([
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
    'brainforge_refresh_token',
  ]).catch(() => undefined);
}

export async function getStoredTheme(): Promise<Theme> {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    return value === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function persistTheme(theme: Theme) {
  AsyncStorage.setItem(THEME_KEY, theme).catch(() => undefined);
}
