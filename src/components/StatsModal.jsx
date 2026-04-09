'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Admin Statistics Modal
 * Opens on click of the 📊 button, shows:
 *   - Daily / Weekly / Monthly / All-time view totals
 *   - Last 30 days bar chart
 *   - Today's hourly sparkline
 *   - Top 10 most-read articles this month
 */
export default function StatsModal() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/views/stats');
      if (!res.ok) throw new Error('Gabim gjatë marrjes së statistikave');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when modal opens
  useEffect(() => {
    if (open) fetchStats();
  }, [open, fetchStats]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Mini bar chart (SVG) ────────────────────────────────────────
  function MiniBarChart({ buckets, labelFn, color = '#dc2626' }) {
    if (!buckets || buckets.length === 0) return null;
    const values = buckets.map(b => (typeof b === 'number' ? b : b.views));
    const max = Math.max(...values, 1);
    const W = 480, H = 80, gap = 2;
    const barW = Math.max(1, (W - gap * (values.length - 1)) / values.length);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        {values.map((v, i) => {
          const h = Math.max(2, (v / max) * (H - 4));
          const x = i * (barW + gap);
          const y = H - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx={2} fill={color} opacity={0.85} />
              {/* Tooltip-title on hover not available in SVG easily — use title */}
              <title>{labelFn ? labelFn(i, buckets[i]) : v}</title>
            </g>
          );
        })}
      </svg>
    );
  }

  // ── Stat card ──────────────────────────────────────────────────
  function StatCard({ label, value, icon, active, onClick, color }) {
    return (
      <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${active
            ? `border-red-500 bg-red-50 shadow-sm`
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
      >
        <span className="text-2xl">{icon}</span>
        <span className={`text-3xl font-black tabular-nums ${active ? 'text-red-600' : 'text-slate-800'}`}>
          {typeof value === 'number' ? value.toLocaleString() : '—'}
        </span>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'text-red-500' : 'text-slate-500'}`}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen(true)}
        id="admin-stats-button"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        title="Statistikat e vizitave"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Statistikat
      </button>

      {/* ── Modal Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* ── Modal Panel ── */}
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fadeInUp_0.2s_ease]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide">Statistikat e Vizitave</h2>
                  <p className="text-violet-200 text-xs">Të dhëna në kohë reale nga post_views</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchStats}
                  disabled={loading}
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  title="Rifresko"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors text-xl font-bold"
                >×</button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  ⚠️ {error}
                </div>
              )}

              {loading && !data && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
                  <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" strokeOpacity={0.25} /><path d="M12 2a10 10 0 0110 10" />
                  </svg>
                  <p className="text-sm font-medium">Duke ngarkuar statistikat…</p>
                </div>
              )}

              {data && (
                <>
                  {/* ── Totals row ── */}
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Vizita gjithsej</p>
                    <div className="flex gap-3">
                      <StatCard label="Sot" value={data.totals?.daily} icon="🌅" active={period === 'daily'} onClick={() => setPeriod('daily')} />
                      <StatCard label="7 Ditë" value={data.totals?.weekly} icon="📅" active={period === 'weekly'} onClick={() => setPeriod('weekly')} />
                      <StatCard label="30 Ditë" value={data.totals?.monthly} icon="📆" active={period === 'monthly'} onClick={() => setPeriod('monthly')} />
                      <StatCard label="Gjithsej" value={data.totals?.allTime} icon="🏆" active={false} />
                    </div>
                  </div>

                  {/* ── Bar chart: today by hour ── */}
                  {period === 'daily' && (
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        Sot orë pas ore
                      </p>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <MiniBarChart
                          buckets={data.hourlyBuckets}
                          labelFn={(i, v) => `${i}:00 — ${typeof v === 'number' ? v : 0} vizita`}
                          color="#7c3aed"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Bar chart: last 30 days ── */}
                  {(period === 'weekly' || period === 'monthly') && (
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        {period === 'weekly' ? '7 ditët e fundit' : '30 ditët e fundit'}
                      </p>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <MiniBarChart
                          buckets={period === 'weekly'
                            ? data.dailyBuckets.slice(-7)
                            : data.dailyBuckets
                          }
                          labelFn={(i, b) => `${b.date}: ${b.views} vizita`}
                          color="#dc2626"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                          {period === 'weekly'
                            ? data.dailyBuckets.slice(-7).filter((_, i) => i % 2 === 0).map(b => <span key={b.date}>{b.date.slice(5)}</span>)
                            : <>
                                <span>{data.dailyBuckets[0]?.date.slice(5)}</span>
                                <span>{data.dailyBuckets[7]?.date.slice(5)}</span>
                                <span>{data.dailyBuckets[14]?.date.slice(5)}</span>
                                <span>{data.dailyBuckets[21]?.date.slice(5)}</span>
                                <span>{data.dailyBuckets[29]?.date.slice(5)}</span>
                              </>
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Top 10 articles ── */}
                  {data.topPosts && data.topPosts.length > 0 && (
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        Top 10 lajmet — 30 ditët e fundit
                      </p>
                      <div className="space-y-2">
                        {data.topPosts.map((p, i) => {
                          const maxViews = data.topPosts[0].views;
                          const pct = Math.round((p.views / maxViews) * 100);
                          return (
                            <div key={p.id} className="flex items-center gap-3">
                              {/* Rank */}
                              <span className={`flex-shrink-0 w-6 text-center text-xs font-black ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                              </span>
                              {/* Title + bar */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                  <a
                                    href={`/news/${p.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[12px] font-semibold text-slate-700 hover:text-red-600 transition-colors truncate leading-snug"
                                    title={p.title}
                                  >
                                    {p.title}
                                  </a>
                                  <span className="flex-shrink-0 text-[11px] font-black text-slate-500 tabular-nums">
                                    {p.views.toLocaleString()}
                                  </span>
                                </div>
                                {/* Progress bar */}
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {data.topPosts && data.topPosts.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <span className="text-4xl block mb-3">📭</span>
                      Nuk ka të dhëna vizitash ende.<br />
                      Vizitat do të regjistrohen automatikisht kur lexuesit hapin lajmet.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
              Të dhënat përditësohen çdo herë që hapet ky panel
            </div>
          </div>
        </div>
      )}
    </>
  );
}
