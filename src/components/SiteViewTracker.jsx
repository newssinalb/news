'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Invisible component — added to the root layout so it fires on EVERY page:
 * homepage, category pages (?section=...), article pages, live page, etc.
 * Uses window.location.search to capture query strings without needing
 * useSearchParams (which would require a Suspense boundary).
 */
export default function SiteViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Include query string so /?section=Sport is tracked separately from /
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const path = pathname + search;

    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
