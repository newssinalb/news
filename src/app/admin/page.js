"use client";

import { useState, useEffect } from 'react';
import { addPost, getPosts, getPostById, updatePost, deletePost, getLiveChannels, updateLiveChannel, addLiveChannel, deleteLiveChannel } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import StatsModal from '@/components/StatsModal';

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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [section, setSection] = useState('Aktualitet');
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [loading, setLoading] = useState(false);
  // media_gallery: array of { type: 'image'|'video', url: string, caption: string }
  const [mediaGallery, setMediaGallery] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [viewCounts, setViewCounts] = useState({}); // { [postId]: count }

  // Live TV state
  const [liveChannels, setLiveChannels] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [newChannel, setNewChannel] = useState({ name: '', youtube_url: '', sort_order: 0 });
  const [addingChannel, setAddingChannel] = useState(false);

  // Comment moderation state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const [titleLoading, setTitleLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [aiError, setAiError] = useState('');

  const router = useRouter();
  const SECTIONS = ['Aktualitet', 'Edi Rama', 'Politikë', 'Bota', 'Showbiz', 'Sport', 'Ekonomi', 'Kronikë', 'Teknologji', 'Të Tjera'];

  useEffect(() => {
    async function loadData() {
      setFetchingPosts(true);
      setLiveLoading(true);
      const [postsData, channelsData] = await Promise.all([getPosts(), getLiveChannels()]);
      const fetchedPosts = postsData || [];
      setPosts(fetchedPosts);
      setLiveChannels(channelsData || []);
      setFetchingPosts(false);
      setLiveLoading(false);

      // Fetch view counts for all posts in parallel (batched)
      if (fetchedPosts.length > 0) {
        try {
          const stats = await fetch('/api/views/stats').then(r => r.json());
          // Use allPostCounts for the full map (covers every post, not just top 10)
          const map = stats.allPostCounts || {};
          // Fall back to topPosts if allPostCounts is missing (older API)
          if (!stats.allPostCounts) {
            (stats.topPosts || []).forEach(p => { map[p.id] = p.views; });
          }
          setViewCounts(map);
        } catch { /* ignore */ }
      }
    }
    loadData();
  }, []);

  // Load comments on demand
  async function loadComments() {
    setCommentsLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      const data = await res.json();
      setComments(data.comments || []);
      setCommentsLoaded(true);
    } catch { /* ignore */ }
    setCommentsLoading(false);
  }

  async function handleCommentAction(id, action) {
    try {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      setComments(prev =>
        action === 'delete'
          ? prev.filter(c => c.id !== id)
          : prev.map(c => c.id === id ? { ...c, approved: true } : c)
      );
    } catch { alert('Gabim gjatë veprimit'); }
  }

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

  // ── Gallery: add item by URL ─────────────────────────────────────────────
  const handleAddGalleryUrl = (type) => {
    const url = prompt(type === 'image' ? 'Fut URL-in e fotos:' : 'Fut URL-in e videos:');
    if (!url || !url.trim()) return;
    setMediaGallery(prev => [...prev, { type, url: url.trim(), caption: '' }]);
  };

  // ── Gallery: upload file ─────────────────────────────────────────────────
  const handleGalleryFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setGalleryUploading(true);
    setAiError('');
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Gabim gjatë ngarkimit');
        const data = await res.json();
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setMediaGallery(prev => [...prev, { type, url: data.url, caption: '' }]);
      }
    } catch (err) {
      setAiError('Galeri: ' + err.message);
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  };

  // ── Gallery: update caption ───────────────────────────────────────────────
  const handleGalleryCaption = (index, value) => {
    setMediaGallery(prev => prev.map((m, i) => i === index ? { ...m, caption: value } : m));
  };

  // ── Gallery: remove item ─────────────────────────────────────────────────
  const handleGalleryRemove = (index) => {
    setMediaGallery(prev => prev.filter((_, i) => i !== index));
  };

  // ── Image Upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setAiError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Gabim gjatë ngarkimit të fotografisë');
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      setAiError('Fotografi: ' + err.message);
    } finally {
      setImageUploading(false);
    }
  };

  // ── Handlers for Edit and Delete ──────────────────────────────────────────
  const handleEditClick = async (post) => {
    try {
      const fullPost = await getPostById(post.id);
      if (fullPost) {
        setEditingPostId(fullPost.id);
        setTitle(fullPost.title || '');
        setContent(fullPost.content || '');
        setImageUrl(fullPost.image_url || '');
        setSection(fullPost.section || 'Aktualitet');
        setAuthor(fullPost.author || '');
        setSummary(fullPost.summary || '');
        // Format date for datetime-local input
        const dateVal = fullPost.published_at ? new Date(fullPost.published_at).toISOString().slice(0, 16) : '';
        setPublishedAt(dateVal);
        setIsBreaking(fullPost.is_breaking || false);
        setMediaGallery(Array.isArray(fullPost.media_gallery) ? fullPost.media_gallery : []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      alert('Gabim gjatë marrjes së detajeve të lajmit');
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle(''); setContent(''); setImageUrl('');
    setSection('Aktualitet'); setAuthor(''); setSummary('');
    setPublishedAt(''); setIsBreaking(false);
    setMediaGallery([]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Jeni të sigurt që doni ta fshini këtë lajm? Ky veprim nuk mund të kthehet mbrapsht!')) return;
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
      alert('Lajmi u fshi me sukses!');
    } catch (err) {
      alert('Gabim gjatë fshirjes: ' + err.message);
    }
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Auto-generate SEO summary if the admin left it blank
    let finalSummary = summary;
    if (!finalSummary.trim() && content.trim()) {
      try {
        setSummaryLoading(true);
        const prompt = `Përmblidhe këtë lajm në 2-3 fjali të shkurtra dhe tërheqëse në gjuhën SHQIPE. Ktheje VETËM përmbledhjen.\n\nTeksti:\n${content.slice(0, 3000)}`;
        finalSummary = await callAI(prompt, 200);
        setSummary(finalSummary);
      } catch {
        // Fallback: use first 155 chars of content
        finalSummary = content.slice(0, 155).trim();
        setSummary(finalSummary);
      } finally {
        setSummaryLoading(false);
      }
    }

    const formattedPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : undefined;
    try {
      const payload = {
        title,
        content,
        image_url: imageUrl,
        section,
        author: author || 'Anonim',
        summary: finalSummary,
        published_at: formattedPublishedAt,
        is_breaking: isBreaking,
        media_gallery: mediaGallery.length > 0 ? mediaGallery : null,
      };

      if (editingPostId) {
        await updatePost(editingPostId, payload);
        alert('Lajmi u përditësua me sukses!');
      } else {
        await addPost(payload);
        alert('Lajmi u publikua me sukses!');
      }

      handleCancelEdit(); // clears form

      const data = await getPosts();
      setPosts(data || []);

      router.refresh();
    } catch (error) {
      alert('Gabim: ' + (error?.message || error?.details || JSON.stringify(error)));
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
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-8 bg-red-600 rounded-full inline-block" />
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-wide">
              {editingPostId ? 'Panel Admin — Ndrysho Lajm' : 'Panel Admin — Shto Lajm'}
            </h1>
          </div>
          {/* Statistics button */}
          <StatsModal />
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
              className={`flex items-center justify-between h-[50px] px-4 rounded-lg border transition-all cursor-pointer select-none ${isBreaking ? 'border-red-300 bg-red-50 shadow-sm' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
              onClick={() => setIsBreaking(!isBreaking)}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${isBreaking ? 'text-red-700' : 'text-slate-600'}`}>
                  🔥 Shëno si Lajm i Fundit
                </span>
              </div>

              {/* Modern iOS-style Toggle Switch */}
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${isBreaking ? 'bg-red-500' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${isBreaking ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
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
              placeholder="Përmbledhje e shkurtër… (do të gjenerohej automatikisht nga AI nëse lihet bosh)"
            />

            {/* ── SEO Preview Panel ── */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <span>🔍</span> Pamja në Google (SEO Preview)
              </p>
              {/* Simulated search result */}
              <div className="bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
                <p className="text-xs text-green-700 mb-1 font-medium truncate">
                  www.nextshqip.de › lajme › {section.toLowerCase().replace(/\s+/g, '-')}
                </p>
                <p className={`text-[16px] font-medium leading-snug mb-1 ${title ? 'text-blue-700' : 'text-slate-300'}`}>
                  {title
                    ? (title.length > 60 ? title.slice(0, 60) + '…' : title) + ' | NextShqip'
                    : 'Titulli i lajmit do të shfaqet këtu…'}
                </p>
                <p className={`text-sm leading-relaxed ${summary ? 'text-slate-600' : 'text-slate-300'}`}>
                  {summary
                    ? (summary.length > 155 ? summary.slice(0, 155) + '…' : summary)
                    : 'Përmbledhja do të gjenerohej automatikisht nga AI nëse lihet bosh…'}
                </p>
              </div>
              {/* SEO score badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  title.length >= 30 && title.length <= 60 ? 'bg-green-100 text-green-700' :
                  title.length > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  Titull: {title.length}/60 {title.length >= 30 && title.length <= 60 ? '✓' : title.length > 60 ? '(shumë gjatë)' : ''}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  summary.length >= 100 && summary.length <= 155 ? 'bg-green-100 text-green-700' :
                  summary.length > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-500'
                }`}>
                  Pershkrim: {summary.length}/155 {!summary.length ? '(auto)' : ''}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  imageUrl ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                }`}>
                  {imageUrl ? '✓ Imazh OG' : '✗ Pa imazh'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  content.length >= 300 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  Permbajtja: {content.length} karaktere {content.length >= 300 ? '✓' : '(e shkurtër)'}
                </span>
              </div>
            </div>
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
            <label className="block text-sm font-bold mb-2 text-slate-700">Fotografia (Ngarko nga kompjuteri ose fut URL)</label>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
              />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm"
                placeholder="Ose përdor një URL të gatshme..."
              />
            </div>
            {imageUploading && <p className="text-sm font-semibold text-blue-600 mt-2 flex items-center gap-2"><Spinner /> Duke e ngarkuar foton në Cloudinary...</p>}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Pamja paraprake"
                className="mt-3 rounded-lg max-h-48 object-cover w-full border border-slate-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* ── GALERIA SHTESE (foto & video) ── */}
          <div>
            <label className="block text-sm font-bold mb-3 text-slate-700">📸 Foto &amp; Video shtesë (opsionale)</label>

            {/* Upload buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors border-2 border-dashed ${galleryUploading ? 'opacity-50 cursor-not-allowed border-slate-300 text-slate-400' : 'border-blue-400 text-blue-600 hover:bg-blue-50'
                }`}>
                {galleryUploading ? <Spinner /> : '📁'}
                {galleryUploading ? 'Duke ngarkuar…' : 'Ngarko Foto/Video'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={galleryUploading}
                  onChange={handleGalleryFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => handleAddGalleryUrl('image')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-dashed border-green-400 text-green-600 hover:bg-green-50 transition-colors"
              >
                🌐 Foto me URL
              </button>
              <button
                type="button"
                onClick={() => handleAddGalleryUrl('video')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-dashed border-purple-400 text-purple-600 hover:bg-purple-50 transition-colors"
              >
                🎬 Video me URL
              </button>
            </div>

            {/* Gallery preview list */}
            {mediaGallery.length > 0 && (
              <div className="space-y-3">
                {mediaGallery.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-slate-50 rounded-xl p-3 border border-slate-200">
                    {/* Thumbnail/icon */}
                    <div className="flex-shrink-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt=""
                          className="w-20 h-16 object-cover rounded-lg border border-slate-200"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-20 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-2xl">🎬</div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">{item.type === 'image' ? 'Foto' : 'Video'}</p>
                      <p className="text-xs text-slate-600 truncate mb-2">{item.url}</p>
                      <input
                        type="text"
                        value={item.caption || ''}
                        onChange={e => handleGalleryCaption(idx, e.target.value)}
                        placeholder="Titulli / përshkrimi (opsional)…"
                        className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 placeholder-slate-400"
                      />
                    </div>
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleGalleryRemove(idx)}
                      className="flex-shrink-0 mt-0.5 text-red-400 hover:text-red-600 transition-colors text-xl font-bold leading-none"
                      title="Hiq"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {mediaGallery.length === 0 && (
              <p className="text-slate-400 text-sm italic">Nuk ka media shtesë. Shto foto ose video me butonat më lart.</p>
            )}
          </div>

          <hr className="border-slate-200" />

          {/* ── SUBMIT & CANCEL ── */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 text-white font-bold text-base p-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-4 flex items-center justify-center gap-2 ${editingPostId ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-300' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'}`}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Duke i dërguar…</span>
                </>
              ) : (editingPostId ? '✏️ Ruaj Ndryshimet' : '📰 Publiko Lajmin')}
            </button>

            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-4 rounded-xl font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors shadow-sm focus:outline-none"
              >
                Anulo
              </button>
            )}
          </div>

        </form>

        {/* ── EXISTING POSTS LIST ── */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide mb-6">Lista e Lajmeve</h2>

          {fetchingPosts ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Spinner /> Duke ngarkuar lajmet...
            </div>
          ) : posts.length === 0 ? (
            <p className="text-slate-500">Nuk ka asnjë lajm të publikuar ende.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-sm font-bold text-slate-600">
                    <th className="py-3 px-2">Data</th>
                    <th className="py-3 px-2">Titulli</th>
                    <th className="py-3 px-2">Kategoria</th>
                    <th className="py-3 px-2 text-center">
                      <span title="Vizita totale (30 ditët e fundit)">👁 Vizita</span>
                    </th>
                    <th className="py-3 px-2">Veprime</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {posts.map(post => (
                    <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                        {new Date(post.created_at).toLocaleDateString('sq-AL')}
                      </td>
                      <td className="py-3 px-2 font-medium text-slate-800 max-w-xs truncate" title={post.title}>
                        {post.is_breaking ? '🔥 ' : ''}{post.title}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs">{post.section}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {viewCounts[post.id] != null ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                            {viewCounts[post.id].toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(post)}
                          className="mr-3 text-blue-600 font-bold hover:text-blue-800 transition-colors"
                        >
                          Ndrysho
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-500 font-bold hover:text-red-700 transition-colors"
                        >
                          Fshi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── LIVE TV MANAGEMENT ── */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" /></span>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Menaxhim Live TV</h2>
          </div>

          {/* Add new channel */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
            <p className="text-sm font-bold text-slate-700 mb-3">➕ Shto Kanal të Ri</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Emri i kanalit (p.sh. Euronews Shqip)"
                value={newChannel.name}
                onChange={e => setNewChannel(p => ({ ...p, name: e.target.value }))}
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                placeholder="URL e YouTube (p.sh. https://youtube.com/watch?v=...)"
                value={newChannel.youtube_url}
                onChange={e => setNewChannel(p => ({ ...p, youtube_url: e.target.value }))}
                className="flex-[2] p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                disabled={addingChannel || !newChannel.name.trim()}
                onClick={async () => {
                  setAddingChannel(true);
                  try {
                    await addLiveChannel({ name: newChannel.name.trim(), youtube_url: newChannel.youtube_url.trim(), sort_order: liveChannels.length + 1 });
                    const updated = await getLiveChannels();
                    setLiveChannels(updated);
                    setNewChannel({ name: '', youtube_url: '', sort_order: 0 });
                  } catch (e) { alert('Gabim: ' + e.message); }
                  setAddingChannel(false);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {addingChannel ? 'Duke shtuar...' : 'Shto'}
              </button>
            </div>
          </div>

          {/* Channel list */}
          {liveLoading ? (
            <div className="flex items-center gap-2 text-slate-500"><Spinner /> Duke ngarkuar kanalet...</div>
          ) : liveChannels.length === 0 ? (
            <p className="text-slate-500 text-sm">Nuk ka kanale. Shto njërin me formularin lart.</p>
          ) : (
            <div className="space-y-3">
              {liveChannels.map(ch => (
                <div key={ch.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                  {/* Active toggle */}
                  <div
                    className={`flex-shrink-0 h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 relative ${ch.is_active ? 'bg-red-500' : 'bg-slate-300'}`}
                    onClick={async () => {
                      try {
                        await updateLiveChannel(ch.id, { is_active: !ch.is_active });
                        setLiveChannels(prev => prev.map(c => c.id === ch.id ? { ...c, is_active: !c.is_active } : c));
                      } catch (e) { alert(e.message); }
                    }}
                  >
                    <span className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow transition-transform duration-200 ${ch.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>

                  {/* Name */}
                  <input
                    type="text"
                    defaultValue={ch.name}
                    onBlur={async e => {
                      if (e.target.value.trim() !== ch.name) {
                        try { await updateLiveChannel(ch.id, { name: e.target.value.trim() }); }
                        catch (err) { alert(err.message); }
                      }
                    }}
                    className="w-32 text-sm font-bold border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />

                  {/* YouTube URL */}
                  <input
                    type="url"
                    defaultValue={ch.youtube_url}
                    placeholder="https://youtube.com/watch?v=..."
                    onBlur={async e => {
                      if (e.target.value !== ch.youtube_url) {
                        try {
                          await updateLiveChannel(ch.id, { youtube_url: e.target.value });
                          setLiveChannels(prev => prev.map(c => c.id === ch.id ? { ...c, youtube_url: e.target.value } : c));
                          alert(`✅ URL u ruajt për "${ch.name}"!`);
                        } catch (err) { alert(err.message); }
                      }
                    }}
                    className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-mono text-slate-600"
                  />

                  {/* Delete */}
                  <button
                    onClick={async () => {
                      if (!confirm(`Fshi "${ch.name}"?`)) return;
                      try {
                        await deleteLiveChannel(ch.id);
                        setLiveChannels(prev => prev.filter(c => c.id !== ch.id));
                      } catch (e) { alert(e.message); }
                    }}
                    className="text-red-500 hover:text-red-700 font-bold text-lg flex-shrink-0 transition-colors"
                    title="Fshi kanalin"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-5 text-xs text-slate-400 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            💡 <strong>Si ta gjesh URL-in:</strong> Hap YouTube → Kanalin e televizionit → klikoni videon <em>Live</em> → kopjo URL-in nga shfletuesi (p.sh. <code>https://youtube.com/watch?v=abc123xyz</code>) dhe ngjite këtu. Klikoni jashtë fushës për ta ruajtur automatikisht.
          </p>
        </div>

        {/* ── COMMENT MODERATION ── */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Menaxhim Komentesh</h2>
            </div>
            <button
              onClick={() => { if (!commentsLoaded) loadComments(); else loadComments(); }}
              disabled={commentsLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
            >
              {commentsLoading ? <Spinner /> : '🔄'}
              {commentsLoaded ? 'Rifresko' : 'Ngarko Komentet'}
            </button>
          </div>

          {!commentsLoaded && !commentsLoading && (
            <div className="text-center py-12 text-slate-400">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-sm">Kliko "Ngarko Komentet" për të parë komentet e lëna nga lexuesit.</p>
            </div>
          )}

          {commentsLoading && (
            <div className="flex items-center gap-2 text-slate-500 py-6">
              <Spinner /> Duke ngarkuar komentet…
            </div>
          )}

          {commentsLoaded && !commentsLoading && comments.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <span className="text-4xl block mb-3">✅</span>
              <p className="text-sm">Nuk ka komente në prite.</p>
            </div>
          )}

          {commentsLoaded && comments.length > 0 && (
            <div className="space-y-3">
              {/* Summary bar */}
              <div className="flex gap-4 mb-5 text-sm">
                <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg font-bold">
                  ⏳ Në prite: {comments.filter(c => !c.approved).length}
                </span>
                <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg font-bold">
                  ✅ Aprovuar: {comments.filter(c => c.approved).length}
                </span>
                <span className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">
                  Gjithsej: {comments.length}
                </span>
              </div>

              {comments.map(c => (
                <div
                  key={c.id}
                  className={`flex gap-4 p-4 rounded-xl border transition-colors ${c.approved
                      ? 'border-green-100 bg-green-50/40'
                      : 'border-yellow-100 bg-yellow-50/40'
                    }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-base uppercase">
                    {c.name?.charAt(0) || '?'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-black text-slate-800 text-sm">{c.name}</span>
                      {c.approved
                        ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✅ Aprovuar</span>
                        : <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">⏳ Në prite</span>
                      }
                      <span className="text-xs text-slate-400">
                        {new Date(c.created_at).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Article reference */}
                    {c.posts?.title && (
                      <p className="text-[11px] text-slate-500 mb-1.5 italic truncate">
                        📰 {c.posts.title}
                      </p>
                    )}

                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{c.message}</p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-3">
                      {!c.approved && (
                        <button
                          onClick={() => handleCommentAction(c.id, 'approve')}
                          className="text-[12px] font-bold text-green-600 hover:text-green-800 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                        >
                          ✅ Aprovo
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Fshi këtë koment?')) handleCommentAction(c.id, 'delete');
                        }}
                        className="text-[12px] font-bold text-red-500 hover:text-red-700 border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        🗑 Fshi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
