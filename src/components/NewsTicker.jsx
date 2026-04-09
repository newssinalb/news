"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { encodeId } from '@/lib/slug';

export default function NewsTicker({ latestPosts }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Otomatik geçiş (5 saniyede bir)
  useEffect(() => {
    if (!latestPosts || latestPosts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % latestPosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [latestPosts]);

  if (!latestPosts || latestPosts.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % latestPosts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + latestPosts.length) % latestPosts.length);
  };

  const activePost = latestPosts[currentIndex];

  return (
    <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden mb-8 max-w-[1200px] mx-auto shadow-sm border border-gray-100">
      {/* Label */}
      <div className="bg-[#e60000] text-white font-bold text-xs px-5 py-3 flex-shrink-0 flex items-center gap-2 uppercase tracking-wide relative z-10">
        <span className="animate-pulse">⚡</span> Të fundit
        <div 
          className="absolute right-[-10px] top-0 bottom-0 w-[10px] bg-[#e60000]" 
          style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 50%)' }}
        ></div>
      </div>
      
      {/* Ticker Content area (Breadcrumb style) */}
      <div className="flex-1 overflow-hidden relative px-6 flex items-center h-full">
        <Link 
          href={`/news/${encodeId(activePost.id)}`} 
          className="flex items-center gap-3 w-full group transition-all duration-500 transform opacity-100"
          key={currentIndex}
        >
          <span className="text-red-500 font-bold shrink-0"># {currentIndex + 1}</span>
          <span className="text-gray-300 shrink-0">/</span>
          <span className="font-semibold text-gray-800 truncate group-hover:text-[#e60000] transition-colors">{activePost.title}</span>
          <span className="text-gray-400 ml-auto text-xs font-normal shrink-0 hidden sm:block">
             {new Date(activePost.created_at).toLocaleDateString('sq-AL', { hour: '2-digit', minute:'2-digit' })}
          </span>
        </Link>
      </div>

      {/* Controls */}
      <div className="flex border-l border-gray-200 bg-white">
        <button 
          onClick={handlePrev}
          className="px-4 py-3 text-gray-400 hover:text-[#e60000] hover:bg-gray-50 transition-colors border-r border-gray-100 active:bg-gray-100"
          aria-label="Previous News"
        >
          ❮
        </button>
        <button 
          onClick={handleNext}
          className="px-4 py-3 text-gray-400 hover:text-[#e60000] hover:bg-gray-50 transition-colors active:bg-gray-100"
          aria-label="Next News"
        >
          ❯
        </button>
      </div>
    </div>
  );
}
