'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { encodeId } from '@/lib/slug';

/**
 * Breaking news banner — shows a full-width animated red strip at the top
 * of the homepage only when there is a recent breaking post (is_breaking = true,
 * published within the last 6 hours).
 *
 * Props:
 *  posts — array of all posts (passed from the server component)
 */
export default function BreakingNewsBanner({ posts }) {
  const [visible, setVisible] = useState(true);
  const [pulse, setPulse] = useState(true);

  // Find the latest breaking post published in the last 6 hours
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
  const breakingPost = posts?.find(p =>
    p.is_breaking &&
    new Date(p.published_at || p.created_at).getTime() > sixHoursAgo
  );

  // Stop pulsing dot after 10s to reduce distraction
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 10_000);
    return () => clearTimeout(t);
  }, []);

  if (!breakingPost || !visible) return null;

  const slug = encodeId(breakingPost.id);

  return (
    <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white relative overflow-hidden">
      {/* Animated shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3 relative">
        {/* Live dot + label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />}
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90 hidden xs:inline">
            LAJM I FUNDIT
          </span>
        </div>

        {/* Separator */}
        <span className="h-4 w-px bg-white/30 flex-shrink-0" />

        {/* Headline - scrolls on mobile */}
        <Link
          href={`/news/${slug}`}
          className="flex-1 min-w-0 text-[13px] sm:text-[14px] font-bold text-white hover:text-white/90 transition-colors truncate"
        >
          {breakingPost.title}
        </Link>

        {/* CTA */}
        <Link
          href={`/news/${slug}`}
          className="flex-shrink-0 text-[11px] font-black uppercase tracking-wider bg-white text-red-700 px-3 py-1 rounded-full hover:bg-red-50 transition-colors hidden sm:block"
        >
          Lexo →
        </Link>

        {/* Dismiss */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Mbylle"
          className="flex-shrink-0 p-1 text-white/60 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
