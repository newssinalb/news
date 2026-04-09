'use client';

import { useEffect } from 'react';

/**
 * Invisible component — mounts once per article page and fires
 * a fire-and-forget POST to record the view.
 * No re-renders, no visible UI.
 */
export default function ViewTracker({ slug }) {
  useEffect(() => {
    // Fire-and-forget: don't await, don't show errors to the reader
    fetch(`/api/views/${slug}`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  return null;
}
