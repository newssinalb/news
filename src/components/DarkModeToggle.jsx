'use client';

import { useEffect, useState } from 'react';

/**
 * Dark Mode Toggle — persists preference in localStorage
 * and sets/removes the `dark` class on <html>.
 * Works with Tailwind dark: utilities.
 */
export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // On mount, read saved preference only — default is light mode
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark'; // only dark if user explicitly chose it
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  // Prevent hydration mismatch — don't render until mounted
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      id="dark-mode-toggle"
      aria-label={dark ? 'Modaliteti i ndritshëm' : 'Modaliteti i errët'}
      title={dark ? 'Kaloni në modalitetin e ndritshëm' : 'Kaloni në modalitetin e errët'}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
        bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600
        text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
        border border-slate-200 dark:border-slate-600 group overflow-hidden"
    >
      {/* Sun icon */}
      <svg
        className={`absolute w-[18px] h-[18px] transition-all duration-500 ${dark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      >
        <circle cx="12" cy="12" r="5" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      {/* Moon icon */}
      <svg
        className={`absolute w-[18px] h-[18px] transition-all duration-500 ${dark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </button>
  );
}
