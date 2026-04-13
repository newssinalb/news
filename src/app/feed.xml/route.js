import { supabase } from '@/lib/supabase';
import { encodeId } from '@/lib/slug';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rilindjenews.com';
const SITE_NAME = 'NextShqip';

/**
 * GET /feed.xml
 * Generates a standard RSS 2.0 feed for all published articles.
 * Automatically discovered by Google News, Feedly, and RSS readers.
 */
export async function GET() {
  let posts = [];

  try {
    if (supabase) {
      const { data } = await supabase
        .from('posts')
        .select('id, title, summary, content, image_url, section, author, created_at, published_at')
        .order('created_at', { ascending: false })
        .limit(50);
      posts = data || [];
    }
  } catch {
    posts = [];
  }

  const escapeXml = (str) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const items = posts.map((post) => {
    const url        = `${SITE_URL}/news/${encodeId(post.id)}`;
    const pubDate    = new Date(post.published_at || post.created_at).toUTCString();
    const title      = escapeXml(post.title);
    const desc       = escapeXml(post.summary || (post.content || '').slice(0, 200));
    const author     = escapeXml(post.author || 'NextShqip');
    const category   = escapeXml(post.section || 'Aktualitet');
    const imageTag   = post.image_url
      ? `<enclosure url="${escapeXml(post.image_url)}" type="image/jpeg" length="0" />`
      : '';

    return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <author>${author}</author>
      <category>${category}</category>
      <pubDate>${pubDate}</pubDate>
      ${imageTag}
    </item>`;
  }).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>Lajmet më të fundit nga Shqipëria dhe bota — politikë, ekonomi, sport, showbiz.</description>
    <language>sq</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
    },
  });
}
