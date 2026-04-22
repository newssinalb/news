'use client';
import { useEffect } from 'react';

export default function InPageAd() {
  useEffect(() => {
    // Only inject if the container exists and hasn't been injected yet
    const container = document.getElementById('container-46f891692b47c26539414760d8438ac5');
    if (!container || container.querySelector('script')) return;

    const s = document.createElement('script');
    s.src = 'https://pl29223871.profitablecpmratenetwork.com/46f891692b47c26539414760d8438ac5/invoke.js';
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    container.appendChild(s);
  }, []);

  return (
    <div 
      id="container-46f891692b47c26539414760d8438ac5" 
      className="my-8 flex justify-center w-full"
    />
  );
}
