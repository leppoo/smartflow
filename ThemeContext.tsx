
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeDefinition, themes, DEFAULT_THEME_ID } from './theme';

const THEME_STORAGE_KEY = 'smartflow_theme';

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  setTheme: (themeId: string) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

const applyTheme = (theme: ThemeDefinition) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};

const getInitialTheme = (): ThemeDefinition => {
  const savedId = localStorage.getItem(THEME_STORAGE_KEY);
  return themes.find(t => t.id === savedId) || themes.find(t => t.id === DEFAULT_THEME_ID)!;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(getInitialTheme);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
