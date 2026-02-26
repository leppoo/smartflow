
import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface Props {
  onHome: () => void;
  onProfile: () => void;
  userName?: string;
}

export const Navbar: React.FC<Props> = ({ onHome, onProfile, userName }) => {
  const getFirstName = (name: string) => {
    if (!name.trim()) return 'Settings';
    // Split by space and return the first part that isn't empty
    const parts = name.trim().split(/\s+/);
    return parts[0] || 'Settings';
  };

  const displayName = userName ? getFirstName(userName) : 'Settings';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <button 
          onClick={onHome}
          className="flex items-center gap-2 font-bold text-xl text-primary-600 group"
        >
          <div className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <span>SmartFlow <span className="text-slate-400 font-medium">Invoice</span></span>
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onProfile}
            className="text-slate-500 hover:text-primary-600 text-sm font-bold transition-colors hidden sm:block bg-[#F8F9FB] px-3 py-1.5 rounded-lg border border-slate-100"
          >
            {displayName}
          </button>
          <ThemeSwitcher />
          <button
            onClick={onProfile}
            className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 hover:border-primary-300 hover:text-primary-600 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};
