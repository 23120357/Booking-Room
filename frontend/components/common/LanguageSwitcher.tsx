'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';

interface LanguageSwitcherProps {
  dropdownPlacement?: 'bottom' | 'top';
  className?: string;
}

export default function LanguageSwitcher({ dropdownPlacement = 'bottom', className = '' }: LanguageSwitcherProps) {
  const { t, language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#6B778C] hover:text-[#172B4D] transition-colors p-1.5 rounded-full hover:bg-gray-50 flex items-center gap-1 focus:outline-none"
        title={t('header.selectLanguage')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
        </svg>
        <span className="text-xs uppercase font-bold">{language}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in duration-150 ${
            dropdownPlacement === 'top' ? 'bottom-full mb-2 slide-in-from-bottom-2' : 'top-full mt-2.5 slide-in-from-top-2'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setLanguage('vi');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F4F5F7] transition-colors text-left font-medium ${
              language === 'vi' ? 'text-[#0052CC] bg-[#E9F2FF]' : 'text-[#172B4D]'
            }`}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F4F5F7] transition-colors text-left font-medium ${
              language === 'en' ? 'text-[#0052CC] bg-[#E9F2FF]' : 'text-[#172B4D]'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      )}
    </div>
  );
}
