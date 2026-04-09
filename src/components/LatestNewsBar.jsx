'use client';

import { useState } from 'react';
import Link from 'next/link';
import { encodeId } from '@/lib/slug';

export default function LatestNewsBar({ posts = [] }) {
  const [paused, setPaused] = useState(false);

  if (!posts || posts.length === 0) return null;

  // Duplicate items so the marquee loops seamlessly
  const items = [...posts, ...posts];
  const duration = `${Math.max(items.length * 5, 30)}s`;

  return (
    <div
      className="w-full bg-[#111827] border-b border-slate-700/80 shadow-lg overflow-hidden"
      style={{ minHeight: '40px' }}
    >
      {/* Keyframe animation injected globally once */}
      <style>{`
        @keyframes latest-news-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="flex items-stretch h-[40px]">

        {/* ── Label badge ── */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.15em] px-4 z-10 relative select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="hidden sm:inline">Lajmet e Fundit</span>
          <span className="sm:hidden">Lajme</span>
          {/* Arrow tip */}
          <div
            className="absolute right-[-10px] top-0 bottom-0 w-[10px] bg-red-600"
            style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 50%)' }}
          />
        </div>

        {/* ── Scrolling track ── */}
        <div
          className="flex-1 overflow-hidden flex items-center relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#111827] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#111827] to-transparent z-10 pointer-events-none" />

          <div
            className="inline-flex whitespace-nowrap"
            style={{
              animation: `latest-news-marquee ${duration} linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {items.map((post, idx) => (
              <Link
                key={`${post.id}-${idx}`}
                href={`/news/${encodeId(post.id)}`}
                className="inline-flex items-center gap-2.5 px-6 text-[12.5px] font-medium text-slate-300 hover:text-white transition-colors duration-200 group"
              >
                {/* Category pill */}
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-sm flex-shrink-0">
                  {post.section || 'Lajm'}
                </span>
                <span className="group-hover:text-white transition-colors">
                  {post.title}
                </span>
                {/* Dot separator */}
                <span className="text-slate-600 flex-shrink-0 ml-3 text-base leading-none">·</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
