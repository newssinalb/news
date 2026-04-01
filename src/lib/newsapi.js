// ─── Server-side in-memory cache ─────────────────────────────────────────────
let _cache = null;            // { articles: [...], fetchedAt: number }
const CACHE_TTL_MS = 60_000;  // 60 seconds

// ─── Translation helpers ──────────────────────────────────────────────────────

async function translateToAlbanian(text) {
  if (!text) return text;
  try {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', text.slice(0, 500));
    url.searchParams.set('langpair', 'en|sq');
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    return translated && translated !== text ? translated : text;
  } catch {
    return text;
  }
}

async function translateBatch(texts, batchSize = 8) {
  const results = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const translated = await Promise.all(batch.map(t => translateToAlbanian(t)));
    results.push(...translated);
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return results;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetches world news from NewsAPI.org (which provides real article images),
 * translates titles + descriptions to Albanian, and returns articles
 * shaped like our Supabase `posts`.
 * Results are cached in-memory for 60 seconds.
 */
export async function getWorldNews() {
  // Serve from cache if still fresh
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.articles;
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('NEWS_API_KEY not set in .env.local');
    return _cache?.articles ?? [];
  }

  try {
    // Use /top-headlines with no country = international world news with images
    const url = new URL('https://newsapi.org/v2/top-headlines');
    url.searchParams.set('language', 'en');
    url.searchParams.set('pageSize', '40');
    url.searchParams.set('apiKey', apiKey);

    const res = await fetch(url.toString(), { cache: 'no-store' });

    if (!res.ok) {
      console.error('NewsAPI fetch failed:', res.status, await res.text());
      return _cache?.articles ?? [];
    }

    const data = await res.json();

    if (data.status !== 'ok') {
      console.error('NewsAPI error:', data.message);
      return _cache?.articles ?? [];
    }

    // Filter out articles with [Removed] content (deleted by publisher)
    const rawArticles = (data.articles || []).filter(
      a => a.title && a.title !== '[Removed]'
    );

    if (rawArticles.length === 0) return [];

    // Translate titles AND descriptions in parallel batches
    const titles = rawArticles.map(a => a.title || '');
    const descriptions = rawArticles.map(a => a.description || '');

    const [translatedTitles, translatedDescriptions] = await Promise.all([
      translateBatch(titles, 8),
      translateBatch(descriptions, 8),
    ]);

    const articles = rawArticles.map((article, idx) => ({
      id: null,
      externalUrl: article.url,
      title: translatedTitles[idx],
      summary: translatedDescriptions[idx],
      // urlToImage is the full-size article image provided by NewsAPI ✅
      image_url: article.urlToImage || null,
      author: article.source?.name || article.author || 'World News',
      section: 'Bota',
      is_breaking: false,
      created_at: article.publishedAt || new Date().toISOString(),
      published_at: article.publishedAt || new Date().toISOString(),
      content: '',
    }));

    _cache = { articles, fetchedAt: Date.now() };
    return articles;
  } catch (err) {
    console.error('Failed to fetch from NewsAPI:', err);
    return _cache?.articles ?? [];
  }
}
