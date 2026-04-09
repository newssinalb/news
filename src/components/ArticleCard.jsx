'use client';

import Link from 'next/link';
import { encodeId } from '@/lib/slug';

export default function ArticleCard({ post, category = "AKTUALITET", layout = "vertical" }) {
  if (!post) return null;

  // External (NewsAPI) articles link out; internal ones go to the reader page
  const href = post.externalUrl ? post.externalUrl : `/news/${encodeId(post.id)}`;
  const linkProps = post.externalUrl
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  const dateStr = new Date(post.created_at).toLocaleDateString('sq-AL', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  if (layout === "horizontal-sidebar") {
    // Layout for the sidebar (Image left, text right)
    return (
      <Link href={href} {...linkProps} className="flex gap-4 group mb-6 hover:bg-gray-50 transition-colors p-2 -mx-2 rounded-md">
        {/* Image */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden relative">
          {post.image_url ? (
            <img 
              src={post.image_url} 
              alt={post.title} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          {/* Badge Overlay */}
          <div className="absolute bottom-0 left-0 bg-[#e60000] text-white text-[10px] font-bold uppercase px-2 py-0.5">
            {category}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 justify-between py-1">
          <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-3 text-gray-900 group-hover:text-[#e60000] transition-colors">
            {post.title}
          </h3>
          <div className="text-xs text-[#00aaff] flex items-center gap-1 mt-2">
            <span>🕒</span>
            {dateStr}
          </div>
        </div>
      </Link>
    );
  }

  // Default Vertical Layout (Image top, text bottom)
  return (
    <Link href={href} {...linkProps} className="flex flex-col group block w-full">
      {/* Image */}
      <div className="w-full aspect-[4/3] overflow-hidden relative mb-3 rounded-lg bg-slate-100">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback shown when image is missing or fails to load */}
        <div
          style={{ display: post.image_url ? 'none' : 'flex' }}
          className="absolute inset-0 flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-white gap-2"
        >
          <span className="text-4xl">🌍</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            {post.section || 'Bota'}
          </span>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-bold text-sm leading-tight text-gray-900 group-hover:text-[#e60000] transition-colors line-clamp-2 mb-1">
        {post.title}
      </h3>
      {post.summary && (
        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
          {post.summary}
        </p>
      )}
      <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
        <span>🕒</span>
        {dateStr}
        {post.author && <span className="ml-1 text-slate-400">· {post.author}</span>}
      </div>
    </Link>
  );
}
