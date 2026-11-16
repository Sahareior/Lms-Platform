import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { Theme } from '../types';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Returns true if the current runtime is a browser (React DOM),
 * false for React Native / SSR.
 */
function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined'
  );
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Initial theme for non-browser runtimes (React Native has no
   * localStorage to read at mount). Ignored in the browser.
   */
  initialTheme?: Theme;
  /** Called after every change so native apps can persist it. */
  onThemeChange?: (theme: Theme) => void;
}

export function ThemeProvider({
  children,
  initialTheme,
  onThemeChange,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Restore saved theme in browser environments only
    if (isBrowser()) {
      const saved = localStorage.getItem('app-theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return initialTheme ?? 'light';
  });

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // Persist theme changes and apply to <html> in browser only
  useEffect(() => {
    onThemeChange?.(theme);
    if (!isBrowser()) return;
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, onThemeChange]);

  const value: ThemeContextValue = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
