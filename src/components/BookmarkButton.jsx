'use client';

import { useBookmark } from '@/lib/bookmarks';

/**
 * BookmarkButton — shows a filled/outlined bookmark icon.
 * Pass the full `post` object plus its `slug` string.
 */
export default function BookmarkButton({ post, slug, className = '' }) {
  const { isBookmarked, toggle } = useBookmark({ ...post, slug });

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      aria-label={isBookmarked ? 'Hiq nga të ruajturat' : 'Ruaj artikullin'}
      title={isBookmarked ? 'Hiq nga të ruajturat' : 'Ruaj artikullin'}
      className={`group flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ${
        isBookmarked
          ? 'text-red-600'
          : 'text-slate-400 hover:text-red-600'
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 3h14a1 1 0 0 1 1 1v16.5l-8-4-8 4V4a1 1 0 0 1 1-1z"
        />
      </svg>
      <span className="text-xs">
        {isBookmarked ? 'Ruajtur' : 'Ruaj'}
      </span>
    </button>
  );
}
