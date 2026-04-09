'use client';

import { useState } from 'react';

function getEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) return '';
  // Handle youtube.com/watch?v=ID
  const watchMatch = youtubeUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
  // Handle youtu.be/ID
  const shortMatch = youtubeUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
  // Handle youtube.com/embed/ID already
  if (youtubeUrl.includes('youtube.com/embed/')) return youtubeUrl;
  // Handle youtube.com/live/ID
  const liveMatch = youtubeUrl.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&rel=0`;
  return '';
}

export default function LivePlayer({ channels }) {
  const [activeId, setActiveId] = useState(channels[0]?.id);
  const active = channels.find(c => c.id === activeId) || channels[0];
  const embedUrl = getEmbedUrl(active?.youtube_url);
  const isPlaceholder = !active?.youtube_url || active.youtube_url.includes('REPLACE_ME');

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* ── Player ── */}
      <div className="flex-1 min-w-0">
        {/* Video container */}
        <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.15)]" style={{ paddingTop: '56.25%' }}>
          {isPlaceholder ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300">
              <span className="text-6xl">📺</span>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{active?.name}</p>
                <p className="text-sm text-slate-400 mt-1">URL nuk është vendosur ende.</p>
                <p className="text-xs text-slate-500 mt-2">Shko te <strong className="text-slate-300">Paneli Admin → Live TV</strong> dhe shto URL-in e YouTube.</p>
              </div>
            </div>
          ) : embedUrl ? (
            <iframe
              key={activeId}
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={active?.name}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 text-slate-400">
              <span className="text-4xl">⚠️</span>
              <p className="text-sm font-semibold">URL i pavlefshëm YouTube</p>
              <p className="text-xs text-slate-500">Ndrysho URL-in nga paneli i adminit.</p>
            </div>
          )}
        </div>

        {/* Now playing info bar */}
        <div className="mt-4 flex items-center gap-3 px-1">
          <div className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            LIVE
          </div>
          <span className="text-white font-bold text-lg">{active?.name}</span>
        </div>
      </div>

      {/* ── Channel List ── */}
      <div className="w-full lg:w-[220px] flex-shrink-0">
        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3 pl-1">Kanalet</p>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {channels.map(ch => {
            const isActive = ch.id === activeId;
            const hasUrl = ch.youtube_url && !ch.youtube_url.includes('REPLACE_ME');
            return (
              <button
                key={ch.id}
                onClick={() => setActiveId(ch.id)}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                  isActive
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/30'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <span className="text-xl flex-shrink-0">📺</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{ch.name}</p>
                  <p className={`text-[10px] mt-0.5 ${isActive ? 'text-red-200' : hasUrl ? 'text-green-400' : 'text-slate-500'}`}>
                    {hasUrl ? '● Aktiv' : '○ Pa URL'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
