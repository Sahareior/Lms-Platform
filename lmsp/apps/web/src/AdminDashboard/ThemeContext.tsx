import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';

  const saved = localStorage.getItem('app-theme');
  if (saved === 'dark' || saved === 'light') return saved;

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getPreferredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme: (nextTheme) => setThemeState(nextTheme),
      toggleTheme: () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAdminTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAdminTheme must be used inside an AdminThemeProvider');
  }

  return context;
}