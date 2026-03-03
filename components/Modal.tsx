
import React, { useEffect, useState, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Panel container */}
      <div className="fixed inset-0 flex items-end sm:items-center sm:justify-center">
        <div
          className={`
            w-full sm:max-w-3xl sm:mx-4
            max-h-[90dvh] sm:max-h-[85vh]
            flex flex-col
            bg-white
            rounded-t-3xl sm:rounded-3xl
            shadow-2xl
            transition-all duration-300 ease-out
            ${visible
              ? 'opacity-100 translate-y-0 sm:scale-100'
              : 'opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95'
            }
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary-100 shrink-0">
            <div>
              <h2 className="text-xl font-black text-primary-900">{title}</h2>
              {subtitle && <p className="text-primary-400 text-sm">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 flex items-center justify-center text-primary-400 hover:text-primary-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
