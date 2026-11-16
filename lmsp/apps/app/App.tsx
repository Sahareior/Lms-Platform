import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeProvider,
  store,
  useAppDispatch,
  useAppSelector,
  useGetMeQuery,
  loginSuccess,
  loginFailure,
  logout,
  setAuthToken,
  setTokenStorage,
  hydrateRefreshToken,
  type Theme,
} from '@my-monorepo/store';

import { configureClients } from './src/config';
import {
  clearSession,
  getStoredTheme,
  persistTheme,
  restoreSession,
} from './src/lib/authStorage';
import RootNavigator from './src/navigation/RootNavigator';
import { useAppTheme } from './src/theme';

configureClients();

// ─── Splash ─────────────────────────────────────────────────
function Splash({ label = 'Preparing your workspace…' }: { label?: string }) {
  return (
    <View style={styles.splash}>
      <View style={styles.splashBadge}>
        <Text style={styles.splashMark}>G</Text>
      </View>
      <Text style={styles.splashTitle}>Geneseon</Text>
      <Text style={styles.splashCaption}>{label}</Text>
    </View>
  );
}

// ─── Session validation ─────────────────────────────────────
/** Re-validates the restored token and clears the session if revoked. */
function SessionSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);
  const { data, isError, error } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (data) dispatch(loginSuccess(data));
  }, [data, dispatch]);

  useEffect(() => {
    const status = (error as any)?.status;
    if (isError && (status === 401 || status === 403)) {
      setAuthToken(null);
      clearSession();
      dispatch(logout());
    }
  }, [isError, error, dispatch]);

  return null;
}

// ─── Navigation shell ───────────────────────────────────────
function NavigationShell() {
  const { colors, isDark } = useAppTheme();
  const base = isDark ? DarkTheme : DefaultTheme;

  const theme = {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.borderSoft,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

// ─── Boot ───────────────────────────────────────────────────
function BootGate() {
  const dispatch = useAppDispatch();
  const [boot, setBoot] = useState<{ ready: boolean; theme: Theme }>({
    ready: false,
    theme: 'light',
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      configureClients();
      setTokenStorage(AsyncStorage);
      await hydrateRefreshToken();

      const [session, theme] = await Promise.all([
        restoreSession(),
        getStoredTheme(),
      ]);

      if (cancelled) return;

      if (session.token && session.user) {
        setAuthToken(session.token);
        dispatch(loginSuccess(session.user));
      } else {
        dispatch(loginFailure());
      }

      setBoot({ ready: true, theme });
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (!boot.ready) return <Splash />;

  return (
    <ThemeProvider initialTheme={boot.theme} onThemeChange={persistTheme}>
      <SafeAreaProvider>
        <SessionSync />
        <NavigationShell />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <BootGate />
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#e8e4db',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  splashMark: {
    color: '#f2efe9',
    fontSize: 30,
    fontWeight: '900',
  },
  splashTitle: {
    color: '#1a1a1a',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  splashCaption: {
    color: '#4a4a4a',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
