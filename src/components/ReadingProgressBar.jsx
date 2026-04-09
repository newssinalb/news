'use client';

import { useEffect, useState } from 'react';

/**
 * Thin red reading-progress bar fixed to the very top of the viewport.
 * Fills from 0 → 100% as the user scrolls through the article.
 */
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.getElementById('article-content');
      if (!el) {
        // Fallback: use full document height
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
        return;
      }
      const rect = el.getBoundingClientRect();
      const elHeight = el.offsetHeight;
      const scrolled = -rect.top;
      const pct = Math.min(100, Math.max(0, (scrolled / (elHeight - window.innerHeight)) * 100));
      setProgress(pct);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-400 transition-[width] duration-100 ease-linear shadow-[0_0_8px_rgba(220,38,38,0.7)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
