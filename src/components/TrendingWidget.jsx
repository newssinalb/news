'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * TrendingWidget — shows the top 5 most-read articles in the last 48h.
 * Fetches from /api/trending on the client so it never blocks SSR.
 */
export default function TrendingWidget() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render anything if no trending data yet
  if (!loading && posts.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1.5 h-7 bg-red-600 rounded-full inline-block" />
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">
          🔥 Trending
        </h2>
        <span className="text-[11px] text-slate-400 font-medium ml-auto">48h</span>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center p-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))
          : posts.map((post, idx) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="flex gap-3 items-center p-3 hover:bg-red-50 transition-colors group"
              >
                {/* Rank number */}
                <span
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                    idx === 0
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </span>

                {/* Thumbnail */}
                <div className="w-14 h-12 flex-shrink-0 rounded-md overflow-hidden relative bg-slate-100">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-lg">
                      🌍
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {post.section && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block mb-0.5">
                      {post.section}
                    </span>
                  )}
                  <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {post.views.toLocaleString()} lexime
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
