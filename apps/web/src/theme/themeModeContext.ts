import { createContext, useContext } from 'react';
import type { ColorMode } from './createAppTheme';

export interface ThemeModeContextValue {
  mode: ColorMode;
  toggleMode: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}
