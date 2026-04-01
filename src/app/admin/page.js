"use client";

import { useState } from 'react';
import { addPost } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const SCITELY_API_KEY = 'sk-scitely-d49a34aea733305726cc6dc537e0342f988f35867ca57e5025836a5d0642c066';
const SCITELY_URL = 'https://api.scitely.com/v1/chat/completions';

// Calls Scitely (OpenAI-compatible API)
// Using qwen3-32b as requested, but with a strict "no thinking" prompt for speed.
async function callAI(prompt, maxTokens = 1024) {
  try {
    const res = await fetch(SCITELY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SCITELY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen3-32b',
        messages: [
          { role: 'system', content: 'Je një asistent i shpejtë profesional. Përgjigju vetëm me tekstin e kërkuar. NDALOHET të mendosh (no thinking) ose të japësh shpjegime. Vetëm rezultati shqip.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5, // Lower temperature for more direct answers
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gabim ${res.status}: ${errText.slice(0, 50)}`);
    }

    const data = await res.json();
    let text = data?.choices?.[0]?.message?.content || '';
    
    console.log('Raw AI Response:', text);
    
    // Safety: strip <think> blocks if they exist anyway
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    return text;
  } catch (err) {
    console.error('AI Call failed:', err);
    throw err;
  }
}

export default function AdminPage() {
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [imageUrl, setImageUrl]   = useState('');
  const [section, setSection]     = useState('Aktualitet');
  const [author, setAuthor]       = useState('');
  const [summary, setSummary]     = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [isBreaking, setIsBreaking]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const [titleLoading, setTitleLoading]     = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [aiError, setAiError]               = useState('');

  const router = useRouter();
  const SECTIONS = ['Aktualitet', 'Edi Rama', 'Politikë', 'Bota', 'Showbiz', 'Sport', 'Ekonomi', 'Kronikë', 'Teknologji', 'Të Tjera'];

  // ── AI Button 1: Generate a viral Albanian title (Fast) ───────────────────
  const handleGenerateTitle = async () => {
    const sourceText = content || summary || title;
    if (!sourceText.trim()) {
      setAiError('Shkruaj së pari tekstin e lajmit ose përmbledhjen.');
      return;
    }
    setAiError('');
    setTitleLoading(true);
    try {
      const prompt = `Gjenero VETËM 1 titull shumë viral dhe klikues në gjuhën SHQIPE për këtë tekst. Maksimum 10 fjalë. Pa thonjëza. Ktheje vetëm titullin.\n\nTeksti:\n${sourceText.slice(0, 1500)}`;
      const result = await callAI(prompt, 50); // Very few tokens needed
      setTitle(result.replace(/^["«»"\s]+|["«»"\s]+$/g, '').trim());
    } catch (err) {
      setAiError('Titull AI: ' + err.message);
    } finally {
      setTitleLoading(false);
    }
  };

  // ── AI Button 2: Generate a summary (New) ─────────────────────────────────
  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      setAiError('Shkruaj së pari tekstin e lajmit në fushën "Përmbajtja".');
      return;
    }
    setAiError('');
    setSummaryLoading(true);
    try {
      const prompt = `Përmblidhe këtë lajm në 2-3 fjali të shkurtra dhe tërheqëse në gjuhën SHQIPE. Ktheje VETËM përmbledhjen.\n\nTeksti:\n${content.slice(0, 3000)}`;
      const result = await callAI(prompt, 200);
      setSummary(result);
    } catch (err) {
      setAiError('Përmbledhje AI: ' + err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── AI Button 4: Auto-fill everything from content (New) ──────────────────
  const handleAutoFillAll = async () => {
    if (!content.trim()) {
      setAiError('Shkruaj së pari tekstin e lajmit në fushën "Përmbajtja".');
      return;
    }
    setAiError('');
    setTitleLoading(true);
    setSummaryLoading(true);
    
    try {
      // Run both in parallel for speed
      const [titleRes, summaryRes] = await Promise.all([
        callAI(`Gjenero VETËM 1 titull shumë viral dhe klikues në gjuhën SHQIPE për këtë tekst. Maksimum 10 fjalë. Pa thonjëza. Ktheje vetëm titullin.\n\nTeksti:\n${content.slice(0, 1500)}`, 50),
        callAI(`Përmblidhe këtë lajm në 2-3 fjali të shkurtra dhe tërheqëse në gjuhën SHQIPE. Ktheje VETËM përmbledhjen.\n\nTeksti:\n${content.slice(0, 3000)}`, 200)
      ]);
      
      setTitle(titleRes.replace(/^["«»"\s]+|["«»"\s]+$/g, '').trim());
      setSummary(summaryRes);
    } catch (err) {
      setAiError('Auto-Fill AI: ' + err.message);
    } finally {
      setTitleLoading(false);
      setSummaryLoading(false);
    }
  };

  // ── AI Button: Improve/rewrite content in professional Albanian ───────────
  const handleImproveContent = async () => {
    if (!content.trim()) {
      setAiError('Shkruaj së pari tekstin e lajmit në fushën "Përmbajtja".');
      return;
    }
    setAiError('');
    setContentLoading(true);
    try {
      const prompt = `Rishkruaj tekstin e mëposhtëm në gjuhën SHQIPE, në stilin e një gazetari profesionist shqiptar. Ruaj të gjitha faktet dhe informacionet. Bëje të rrjedhshëm, tërheqës dhe natyral. Ktheje VETËM tekstin e rishkruar, pa komente shtesë.\n\nTeksti origjinal:\n${content.slice(0, 4000)}`;
      const result = await callAI(prompt, 1024);
      setContent(result);
    } catch (err) {
      setAiError('Përmirësim AI: ' + err.message);
    } finally {
      setContentLoading(false);
    }
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formattedPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : undefined;
    try {
      await addPost({
        title,
        content,
        image_url: imageUrl,
        section,
        author: author || 'Anonim',
        summary,
        published_at: formattedPublishedAt,
        is_breaking: isBreaking,
      });
      alert('Lajmi u publikua me sukses!');
      setTitle(''); setContent(''); setImageUrl('');
      setSection('Aktualitet'); setAuthor(''); setSummary('');
      setPublishedAt(''); setIsBreaking(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      alert('Gabim gjatë publikimit: ' + (error?.message || error?.details || JSON.stringify(error)));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Spinner SVG ───────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      <div className="max-w-3xl mx-auto p-6 md:p-10">

        {/* Page Title */}
        <div className="mb-8 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-red-600 rounded-full inline-block" />
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-wide">
            Panel Admin — Shto Lajm
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

          {/* ── TITLE ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">Titulli*</label>
              {/* AI Button 1 */}
              <button
                type="button"
                onClick={handleGenerateTitle}
                disabled={titleLoading || contentLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                title="AI gjeneron titullin më viral në shqip"
              >
                {titleLoading ? <Spinner /> : '🔥'}
                {titleLoading ? 'Duke gjeneruar…' : 'Titull Viral me AI'}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm transition-shadow"
              placeholder="Titulli i lajmit…"
            />
          </div>

          {/* ── KATEGORIA + AUTORI ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Kategoria*</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 cursor-pointer text-sm"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Autori</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm"
                placeholder="Emri i autorit…"
              />
            </div>
          </div>

          {/* ── KOHA + BREAKING ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Data e Publikimit</label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1.5">Lër bosh për datën aktuale.</p>
            </div>
            <div
              className="flex items-center h-[50px] px-4 border border-slate-300 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              onClick={() => setIsBreaking(!isBreaking)}
            >
              <input
                id="is_breaking"
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="is_breaking" className="ml-3 text-sm font-bold text-red-600 cursor-pointer select-none">
                🔥 Shëno si Lajm i Fundit
              </label>
            </div>
          </div>

          {/* ── PERMBLEDHJA ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">Përmbledhja</label>
              {/* AI Button 2 */}
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={summaryLoading || contentLoading || titleLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                title="AI gjeneron një përmbledhje të shkurtër"
              >
                {summaryLoading ? <Spinner /> : '📝'}
                {summaryLoading ? 'Duke përmbledhur…' : 'Përmbledhje me AI'}
              </button>
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm resize-none"
              placeholder="Përmbledhje e shkurtër që shfaqet në faqen kryesore…"
            />
          </div>

          {/* ── PERMBAJTJA ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">Përmbajtja*</label>
              <div className="flex gap-2">
                {/* AI Button 3: Auto-Fill */}
                <button
                  type="button"
                  onClick={handleAutoFillAll}
                  disabled={contentLoading || titleLoading || summaryLoading}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Gjenero Titullin dhe Përmbledhjen me AI nga ky tekst"
                >
                  {(titleLoading && summaryLoading) ? <Spinner /> : '⚡'}
                  {(titleLoading && summaryLoading) ? 'Duke mbushur…' : 'Mbushe Automatike me AI'}
                </button>
                {/* AI Button 2: Improve */}
                <button
                  type="button"
                  onClick={handleImproveContent}
                  disabled={contentLoading || titleLoading || summaryLoading}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  title="AI përmirëson tekstin në shqip gazetaresk profesionist"
                >
                  {contentLoading ? <Spinner /> : '✨'}
                  {contentLoading ? 'Duke përmirësuar…' : 'Përmirëso Tekstin'}
                </button>
              </div>
            </div>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg h-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm resize-y"
              placeholder="Shkruaj ose ngjit tekstin e plotë të lajmit këtu…"
            />
          </div>

          {/* ── AI ERROR ── */}
          {aiError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <span className="text-red-500 mt-0.5">⚠️</span>
              {aiError}
            </div>
          )}

          {/* ── IMAGE URL ── */}
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">URL e Fotografisë</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm"
              placeholder="https://shembull.com/foto.jpg"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Pamja paraprake"
                className="mt-3 rounded-lg max-h-48 object-cover w-full border border-slate-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          <hr className="border-slate-200" />

          {/* ── SUBMIT ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold text-base p-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Duke publikuar…</span>
              </>
            ) : '📰 Publiko Lajmin'}
          </button>

        </form>
      </div>
    </div>
  );
}
