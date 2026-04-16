import React, { createContext, useContext, useMemo, useState } from 'react';

type AppThemeMode = 'light' | 'dark';

type AppPalette = {
  background: string;
  card: string;
  softCard: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
};

type AppThemeValue = {
  mode: AppThemeMode;
  isDark: boolean;
  palette: AppPalette;
  setMode: (mode: AppThemeMode) => void;
  toggleMode: () => void;
};

const lightPalette: AppPalette = {
  background: '#E9EEF5',
  card: '#F7F9FC',
  softCard: '#EAF0F8',
  textPrimary: '#1B2B50',
  textSecondary: '#4A5670',
  accent: '#173B70',
};

const darkPalette: AppPalette = {
  background: '#0F1523',
  card: '#192338',
  softCard: '#24324A',
  textPrimary: '#E8EEFA',
  textSecondary: '#AEBAD0',
  accent: '#6F9BE0',
};

const AppThemeContext = createContext<AppThemeValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppThemeMode>('light');
  const isDark = mode === 'dark';
  const palette = isDark ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({
      mode,
      isDark,
      palette,
      setMode,
      toggleMode: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [mode, isDark, palette]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }
  return context;
}
