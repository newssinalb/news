'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBookmarks } from '@/lib/bookmarks';
import BookmarkButton from '@/components/BookmarkButton';

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState(null); // null = loading

  useEffect(() => {
    setBookmarks(getBookmarks());

    // Refresh if localStorage changes in another tab
    const handler = () => setBookmarks(getBookmarks());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="bg-white min-h-screen w-full">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 w-full">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-2 h-8 bg-red-600 inline-block rounded-full" />
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Artikujt e Ruajtur
          </h1>
          {bookmarks && bookmarks.length > 0 && (
            <span className="ml-auto bg-slate-100 text-slate-500 text-sm font-bold px-3 py-1 rounded-full">
              {bookmarks.length}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {bookmarks === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-100 overflow-hidden">
                <div className="h-44 bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {bookmarks !== null && bookmarks.length === 0 && (
          <div className="py-24 flex flex-col items-center gap-5 text-center">
            <span className="text-6xl">🔖</span>
            <h2 className="text-xl font-bold text-slate-700">Nuk keni ruajtur asnjë artikull</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              Klikoni ikonën e ruajtjes në çdo artikull për ta shtuar këtu.
            </p>
            <Link
              href="/"
              className="mt-2 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Shko te Ballina
            </Link>
          </div>
        )}

        {/* Bookmark grid */}
        {bookmarks !== null && bookmarks.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((post, idx) => (
                <div
                  key={post.id ?? idx}
                  className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image */}
                  <Link href={`/news/${post.slug}`} className="block relative aspect-[16/9] bg-slate-100 overflow-hidden">
                    {post.image_url ? (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-4xl">
                        🌍
                      </div>
                    )}
                    {post.section && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
                        {post.section}
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={`/news/${post.slug}`}>
                      <h2 className="text-[15px] font-bold text-slate-800 leading-snug line-clamp-2 hover:text-red-600 transition-colors mb-3">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400">
                        {new Date(post.created_at).toLocaleDateString('sq-AL', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </p>
                      {/* Remove bookmark */}
                      <BookmarkButton
                        post={post}
                        slug={post.slug}
                        // Re-render list after removing
                        onToggle={() => setBookmarks(getBookmarks())}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear all */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => {
                  localStorage.removeItem('nextshqip_bookmarks');
                  setBookmarks([]);
                }}
                className="px-5 py-2 text-sm font-semibold text-slate-400 border border-slate-200 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Fshij të gjitha
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
