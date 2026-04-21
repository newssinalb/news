'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'nextshqip_bookmarks';

/**
 * Returns { isBookmarked, toggle } for a given post object.
 * Post is saved as { id, slug, title, image_url, section, created_at } in localStorage.
 */
export function useBookmark(post) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setIsBookmarked(saved.some(p => p.id === post?.id));
    } catch {}
  }, [post?.id]);

  const toggle = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let updated;
      if (saved.some(p => p.id === post.id)) {
        updated = saved.filter(p => p.id !== post.id);
      } else {
        updated = [
          { id: post.id, slug: post.slug, title: post.title, image_url: post.image_url, section: post.section, created_at: post.created_at },
          ...saved,
        ];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setIsBookmarked(!saved.some(p => p.id === post.id));
    } catch {}
  }, [post]);

  return { isBookmarked, toggle };
}

/** Read all bookmarks from localStorage */
export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
