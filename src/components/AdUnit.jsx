'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AdUnit({ atOptionsKey, format = 'iframe', height, width, invokeUrl, className = "my-6 flex justify-center w-full overflow-hidden" }) {
  const containerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only run if the container exists and hasn't been injected into yet
    if (!containerRef.current || containerRef.current.querySelector('script')) return;

    // 1. Inject atOptions global configuration locally inside the container
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `window.atOptions = { key: '${atOptionsKey}', format: '${format}', height: ${height}, width: ${width}, params: {} };`;
    containerRef.current.appendChild(inlineScript);

    // 2. Inject the invoke.js script right after
    const invokeScript = document.createElement('script');
    invokeScript.src = invokeUrl;
    invokeScript.async = true;
    containerRef.current.appendChild(invokeScript);
  }, [atOptionsKey, format, height, width, invokeUrl]);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
