'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Helper to prevent accidental ad clicks while scrolling
 */
let isScrolling = false;
let scrollTimeout = null;
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 250);
  }, { passive: true });
}

/**
 * AdScripts — monetisation scripts.
 * Loaded once in the root layout so they appear on every page.
 *
 *  1. Interstitial / pop-under Smart Link (Opens on click with 1-min cooldown)
 * Note: Banner ads (scripts 1, 5, 6) were moved to specific Ad components (AdUnit, InPageAd) for precise placement.
 */
export default function AdScripts() {
  const pathname = usePathname();

  useEffect(() => {
    // Helper: inject a <script> tag into <body> (only if not already present)
    function loadScript(src, attrs = {}) {
      const id = 'ad-' + src.replace(/[^a-z0-9]/gi, '').slice(-30);
      if (document.getElementById(id)) return;

      const s = document.createElement('script');
      s.src = src;
      s.id = id;
      s.async = true;
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
      document.body.appendChild(s);
    }

    // -- Note: Scripts 1, 5, and 6 are now placed individually via <AdUnit /> and <InPageAd /> components --

    // Script 2
    loadScript(
      'https://pl29223872.profitablecpmratenetwork.com/9f/7b/cd/9f7bcd1a10c32959e19b152fe061091f.js'
    );

    // Script 3
    loadScript(
      'https://pl29223873.profitablecpmratenetwork.com/06/92/3b/06923b4219e7585d1f69615abefa74eb.js'
    );

    // Script 4 — Interstitial / Pop-Under Smart Link (Triggered on click anywhere)
    const smartLinkUrl = 'https://www.profitablecpmratenetwork.com/viytcpp3?key=2c4f7d150fc9dacf1b1f7ebb7a5d2521';
    const COOLDOWN_MS = 15 * 1000; // 15 seconds

    const handleGlobalClick = (e) => {
      // 1. Ignore if the user is actively scrolling the page
      if (isScrolling) return;

      const lastClickTime = localStorage.getItem('last_ad_click_time');
      const now = Date.now();

      // If no recorded click, or 1 minute has passed since the last one
      if (!lastClickTime || now - parseInt(lastClickTime, 10) > COOLDOWN_MS) {
        // Open the ad in a new tab
        const newWindow = window.open(smartLinkUrl, '_blank');
        
        // If the browser allowed the popup, record the time
        if (newWindow) {
          localStorage.setItem('last_ad_click_time', now.toString());
        }
      }
    };

    // Attach to document to catch all clicks (buttons, links, etc.)
    document.addEventListener('click', handleGlobalClick);

    // Cleanup the event listener when component unmounts
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [pathname]); // re-evaluate on route change (SPA navigation)

  return null;
}
