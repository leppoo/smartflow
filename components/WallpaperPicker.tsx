
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

export const WallpaperPicker: React.FC = () => {
  const { currentWallpaper, setWallpaper, setCustomWallpaper, wallpapers, customWallpaper } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomWallpaper(dataUrl);
      setIsOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-all"
        title="Change wallpaper"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 px-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Wallpaper</p>
          <div className="space-y-1">
            {wallpapers.map((wp) => {
              const isActive = currentWallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => {
                    setWallpaper(wp.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                    style={{ background: wp.css }}
                  />
                  <span className="text-sm font-medium flex-1">{wp.name}</span>
                  {isActive && (
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Custom image option */}
            {customWallpaper && (
              <button
                onClick={() => {
                  setWallpaper('custom');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  currentWallpaper === 'custom'
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span
                  className="w-7 h-7 rounded-lg border-2 border-white shadow-sm flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${customWallpaper})` }}
                />
                <span className="text-sm font-medium flex-1">Custom Image</span>
                {currentWallpaper === 'custom' && (
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Upload button */}
          <div className="border-t border-slate-100 mt-2 pt-2 px-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-slate-500 hover:bg-slate-50 hover:text-primary-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span className="text-sm font-medium">Upload Image</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
