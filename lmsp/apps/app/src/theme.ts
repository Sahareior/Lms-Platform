import { useTheme } from '@my-monorepo/store';

/**
 * App-wide design tokens.
 *
 * Mirrors the web app's two visual modes: the vintage "paper" light
 * theme and the graphite dark theme, reworked for touch screens.
 */
export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSoft: string;
  text: string;
  sub: string;
  muted: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  primary: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  hardShadow: string;
}

const light: Palette = {
  bg: '#e8e4db',
  surface: '#f2efe9',
  surfaceAlt: '#e0dcd5',
  border: '#1a1a1a',
  borderSoft: '#d8d4cb',
  text: '#1a1a1a',
  sub: '#4a4a4a',
  muted: '#7a766e',
  accent: '#b91c1c',
  accentSoft: '#f2e2e0',
  onAccent: '#f2efe9',
  primary: '#1a1a1a',
  success: '#15803d',
  successSoft: '#e5eee5',
  warning: '#a16207',
  warningSoft: '#f5ecd9',
  danger: '#b91c1c',
  dangerSoft: '#f5e0dd',
  info: '#1d4ed8',
  infoSoft: '#e3e7f2',
  overlay: 'rgba(232,228,219,0.92)',
  hardShadow: '#1a1a1a',
};

const dark: Palette = {
  bg: '#0B0D12',
  surface: '#111318',
  surfaceAlt: '#161920',
  border: '#23262D',
  borderSoft: '#2A2F3A',
  text: '#F5F7FA',
  sub: '#A1A8B3',
  muted: '#6B7280',
  accent: '#00E5B3',
  accentSoft: 'rgba(0,229,179,0.12)',
  onAccent: '#04100C',
  primary: '#2F80ED',
  success: '#34D399',
  successSoft: 'rgba(52,211,153,0.12)',
  warning: '#F2C94C',
  warningSoft: 'rgba(242,201,76,0.12)',
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.12)',
  info: '#60A5FA',
  infoSoft: 'rgba(96,165,250,0.12)',
  overlay: 'rgba(11,13,18,0.92)',
  hardShadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export function useAppTheme() {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  const colors = isDark ? dark : light;

  return {
    colors,
    isDark,
    theme,
    toggleTheme,
    setTheme,
    radius: isDark ? 16 : 10,
    radiusLg: isDark ? 22 : 14,
    /** Light mode uses offset "sticker" shadows; dark mode soft glows. */
    cardShadow: isDark
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 4,
        }
      : {
          shadowColor: '#1a1a1a',
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        },
  };
}

export type AppTheme = ReturnType<typeof useAppTheme>;
