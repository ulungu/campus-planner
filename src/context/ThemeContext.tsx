import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, ThemeColors, ThemeName } from '../theme/colors';
import { loadTheme, saveTheme } from '../storage/themeStorage';

interface ThemeContextValue {
  theme: ThemeName;
  colors: ThemeColors;
  isLoading: boolean;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadTheme().then((saved) => {
      if (!isMounted) return;
      if (saved) setThemeState(saved);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = (next: ThemeName) => {
    setThemeState(next);
    saveTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, colors: THEMES[theme], isLoading, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
}
