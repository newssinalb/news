'use client';

import { useState, useEffect } from 'react';

/**
 * Comments section for an individual article.
 * Stores comments in Supabase `post_comments` table.
 * No authentication — just a name + message.
 */
export default function CommentsSection({ postId }) {
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName]           = useState('');
  const [message, setMessage]     = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // Load comments
  useEffect(() => {
    if (!postId) return;
    fetch(`/api/comments?postId=${postId}`)
      .then(r => r.json())
      .then(d => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Ju lutem plotësoni emrin dhe komentin.');
      return;
    }
    if (message.trim().length < 5) {
      setError('Komenti duhet të ketë të paktën 5 karaktere.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, name: name.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(prev => [data.comment, ...prev]);
      setName('');
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Gabim gjatë dërgimit. Provoni sërish.');
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (mins < 1)    return 'Tani';
    if (mins < 60)   return `${mins} min më parë`;
    if (hours < 24)  return `${hours}h më parë`;
    if (days < 7)    return `${days} ditë më parë`;
    return new Date(dateStr).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short' });
  }

  return (
    <section className="mt-12 pt-10 border-t-2 border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">
          Komente {comments.length > 0 && <span className="text-red-600 ml-1">({comments.length})</span>}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <p className="text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">
          Lër një koment
        </p>

        <input
          type="text"
          placeholder="Emri juaj *"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
        />

        <textarea
          placeholder="Shkruani komentin tuaj…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition resize-none"
        />

        {error && (
          <p className="text-red-600 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-sm flex items-center gap-2">
            <span>✅</span> Komenti u dërgua me sukses!
          </p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">{message.length}/1000</p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0110 10"/>
                </svg>
                Duke dërguar…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Dërgo Komentin
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" strokeOpacity={0.25}/><path d="M12 2a10 10 0 0110 10"/>
          </svg>
          Duke ngarkuar komentet…
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <span className="text-4xl block mb-3">💬</span>
          <p className="text-sm">Bëni të parët që komentoni!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-4 group">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-base uppercase select-none">
                {c.name?.charAt(0) || '?'}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[13px] font-black text-slate-800">{c.name}</span>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">{c.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
