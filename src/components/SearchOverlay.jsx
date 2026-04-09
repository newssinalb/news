'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { encodeId } from '@/lib/slug';

/**
 * Site-wide search overlay.
 * Opens with the search icon in the header → searches Supabase posts in real-time.
 */
export default function SearchOverlay() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);
  const router   = useRouter();

  // Open / close with keyboard shortcut Ctrl+K
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus input when overlay opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  // Debounced search
  const searchTimeout = useRef(null);
  const handleChange = useCallback((e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(searchTimeout.current);

    if (!q.trim() || q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  function handleResultClick(post) {
    setOpen(false);
    router.push(`/news/${encodeId(post.id)}`);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        id="search-trigger-button"
        aria-label="Kërko lajme"
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 text-slate-500 hover:text-slate-800 text-sm group"
        title="Kërko (Ctrl+K)"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline text-[13px] font-medium">Kërko…</span>
        <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md group-hover:bg-slate-100">
          Ctrl K
        </kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${loading ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Kërko lajme në shqip…"
                className="flex-1 text-[17px] font-medium text-slate-900 placeholder-slate-400 bg-transparent outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus(); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="hidden sm:block text-xs font-bold text-slate-400 hover:text-slate-600 border border-slate-200 px-2 py-1 rounded-md transition-colors">
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {/* Loading */}
              {loading && (
                <div className="flex items-center gap-3 px-5 py-6 text-slate-400">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" strokeOpacity={0.25} /><path d="M12 2a10 10 0 0110 10" />
                  </svg>
                  <span className="text-sm">Duke kërkuar…</span>
                </div>
              )}

              {/* No results */}
              {!loading && hasSearched && results.length === 0 && (
                <div className="px-5 py-10 text-center text-slate-500">
                  <span className="text-4xl block mb-3">🔍</span>
                  <p className="font-semibold">Nuk u gjet asgjë për <span className="text-red-600">"{query}"</span></p>
                  <p className="text-sm text-slate-400 mt-1">Provoni fjalë të tjera.</p>
                </div>
              )}

              {/* Results list */}
              {!loading && results.length > 0 && (
                <ul className="py-2">
                  {results.map((post) => (
                    <li key={post.id}>
                      <button
                        onClick={() => handleResultClick(post)}
                        className="w-full flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left group"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                          {post.image_url
                            ? <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xl">📰</div>
                          }
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          {post.section && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1 block">{post.section}</span>
                          )}
                          <p className="text-[14px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                            {post.title}
                          </p>
                          {post.summary && (
                            <p className="text-[12px] text-slate-500 line-clamp-1 mt-0.5">{post.summary}</p>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1 group-hover:text-red-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Empty state */}
              {!loading && !hasSearched && query.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-400">
                  <p className="text-sm">Shkruaj të paktën 2 shkronja për të kërkuar.</p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Shtyp <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">↵</kbd> për të hapur</span>
              <span>{results.length > 0 && `${results.length} rezultat${results.length !== 1 ? 'e' : ''}`}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
