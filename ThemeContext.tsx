
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeDefinition, themes, DEFAULT_THEME_ID } from './theme';

const THEME_STORAGE_KEY = 'smartflow_theme';
const WALLPAPER_STORAGE_KEY = 'smartflow_wallpaper';
const WALLPAPER_CUSTOM_KEY = 'smartflow_wallpaper_custom';

export interface WallpaperDefinition {
  id: string;
  name: string;
  css: string;
  preview: string;
}

export const wallpapers: WallpaperDefinition[] = [
  { id: 'default', name: 'Default', css: '#F8F9FB', preview: '#F8F9FB' },
  { id: 'soft-blue', name: 'Soft Blue', css: 'linear-gradient(135deg, #E0E7FF 0%, #F0F4FF 50%, #E8EEFF 100%)', preview: '#E0E7FF' },
  { id: 'warm-peach', name: 'Warm Peach', css: 'linear-gradient(135deg, #FFF5F0 0%, #FDE8E0 50%, #FFF0EA 100%)', preview: '#FDE8E0' },
  { id: 'cool-mint', name: 'Cool Mint', css: 'linear-gradient(135deg, #E0FFF5 0%, #F0FFF8 50%, #E8FFF2 100%)', preview: '#E0FFF5' },
  { id: 'lavender-mist', name: 'Lavender Mist', css: 'linear-gradient(135deg, #F0E6FF 0%, #F8F0FF 50%, #EDE0FF 100%)', preview: '#F0E6FF' },
  { id: 'slate-mesh', name: 'Slate Mesh', css: 'linear-gradient(135deg, #E2E8F0 0%, #F1F5F9 50%, #E2E8F0 100%)', preview: '#E2E8F0' },
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
  } else {
    const wp = wallpapers.find(w => w.id === wallpaperId);
    document.body.style.background = wp ? wp.css : '#F8F9FB';
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
  }, [currentWallpaper, customWallpaper]);

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
