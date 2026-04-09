'use client';

import { useEffect, useState } from 'react';

/**
 * Floating "Back to Top" button that appears after the user
 * has scrolled down 400px. Smooth-scrolls back to the top on click.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Kthehu lart"
      className="fixed bottom-8 right-5 z-50 w-11 h-11 flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 hover:scale-110 active:scale-95 transition-all duration-200 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
