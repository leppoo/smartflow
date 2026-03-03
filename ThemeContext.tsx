
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeDefinition, themes, DEFAULT_THEME_ID } from './theme';

const THEME_STORAGE_KEY = 'smartflow_theme';
const WALLPAPER_STORAGE_KEY = 'smartflow_wallpaper';
const WALLPAPER_CUSTOM_KEY = 'smartflow_wallpaper_custom';

export interface WallpaperDefinition {
  id: string;
  name: string;
}

export const wallpapers: WallpaperDefinition[] = [
  { id: 'default', name: 'Default' },
  { id: 'accent', name: 'Accent' },
];

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  setTheme: (themeId: string) => void;
  themes: ThemeDefinition[];
  currentWallpaper: string;
  setWallpaper: (id: string) => void;
  setCustomWallpaper: (dataUrl: string) => void;
  wallpapers: WallpaperDefinition[];
  customWallpaper: string | null;
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

const applyWallpaper = (wallpaperId: string, customDataUrl: string | null) => {
  if (wallpaperId === 'custom' && customDataUrl) {
    document.body.style.background = `url(${customDataUrl}) center/cover fixed no-repeat`;
  } else if (wallpaperId === 'accent') {
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-100').trim();
    document.body.style.background = rgb ? `rgb(${rgb})` : '#F8F9FB';
  } else {
    document.body.style.background = '#F8F9FB';
  }
  document.body.style.minHeight = '100vh';
};

const getInitialTheme = (): ThemeDefinition => {
  const savedId = localStorage.getItem(THEME_STORAGE_KEY);
  return themes.find(t => t.id === savedId) || themes.find(t => t.id === DEFAULT_THEME_ID)!;
};

const getInitialWallpaper = (): string => {
  return localStorage.getItem(WALLPAPER_STORAGE_KEY) || 'default';
};

const getInitialCustomWallpaper = (): string | null => {
  return localStorage.getItem(WALLPAPER_CUSTOM_KEY);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(getInitialTheme);
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(getInitialWallpaper);
  const [customWallpaper, setCustomWallpaperState] = useState<string | null>(getInitialCustomWallpaper);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    applyWallpaper(currentWallpaper, customWallpaper);
  }, [currentWallpaper, customWallpaper, currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  };

  const setWallpaper = (id: string) => {
    setCurrentWallpaper(id);
    localStorage.setItem(WALLPAPER_STORAGE_KEY, id);
  };

  const setCustomWallpaper = (dataUrl: string) => {
    setCustomWallpaperState(dataUrl);
    localStorage.setItem(WALLPAPER_CUSTOM_KEY, dataUrl);
    setCurrentWallpaper('custom');
    localStorage.setItem(WALLPAPER_STORAGE_KEY, 'custom');
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes, currentWallpaper, setWallpaper, setCustomWallpaper, wallpapers, customWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
};
