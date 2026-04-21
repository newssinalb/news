'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [msg, setMsg]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMsg('');
        setEmail('');
      } else {
        setStatus('error');
        setMsg(data.error || 'Gabim. Provoni përsëri.');
      }
    } catch {
      setStatus('error');
      setMsg('Gabim rrjeti. Provoni përsëri.');
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 px-6 py-10 sm:px-10 sm:py-12 my-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-red-600/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 blur-xl" />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Icon */}
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600/20 text-2xl mb-4">
          📬
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Qëndroni të Informuar
        </h2>
        <p className="text-slate-400 text-sm mb-7">
          Merrni lajmet më të rëndësishme drejtpërdrejt në emailin tuaj. Pa spam.
        </p>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl">🎉</span>
            <p className="text-green-400 font-bold text-lg">Jeni regjistruar me sukses!</p>
            <p className="text-slate-400 text-sm">Do të merrni lajmet tona së shpejti.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="emaili@juaj.com"
              disabled={status === 'loading'}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Duke u regjistruar…
                </>
              ) : (
                'Regjistrohu Falas'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-xs mt-3">{msg}</p>
        )}

        <p className="text-slate-500 text-[11px] mt-5">
          Duke u regjistruar, pranoni{' '}
          <a href="/privacy" className="underline hover:text-slate-300 transition-colors">kushtet e privatësisë</a>.
          Mund të çregjistroheni në çdo kohë.
        </p>
      </div>
    </section>
  );
}
