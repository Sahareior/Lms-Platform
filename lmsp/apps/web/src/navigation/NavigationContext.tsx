import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type NavigationMode = 'sidebar' | 'hub';

interface NavigationContextValue {
  mode: NavigationMode;
  isHub: boolean;
  setMode: (mode: NavigationMode) => void;
}

const getPreferredMode = (): NavigationMode => {
  if (typeof window === 'undefined') return 'sidebar';
  const saved = localStorage.getItem('nav-mode');
  return saved === 'hub' ? 'hub' : 'sidebar';
};

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<NavigationMode>(getPreferredMode);

  useEffect(() => {
    localStorage.setItem('nav-mode', mode);
  }, [mode]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      mode,
      isHub: mode === 'hub',
      setMode: (nextMode) => setModeState(nextMode),
    }),
    [mode]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigationMode() {
  const context = useContext(NavigationContext);

  if (!context) {
    return {
      mode: 'sidebar' as NavigationMode,
      isHub: false,
      setMode: () => undefined,
    };
  }

  return context;
}
