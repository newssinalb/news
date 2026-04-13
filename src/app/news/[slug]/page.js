/**
 * SEO: Dynamic metadata for each article page.
 * generateMetadata runs on the server and injects proper <title>,
 * <meta description>, Open Graph and Twitter Card tags into <head>.
 */
import { getPostById, getPosts } from '@/lib/supabase';
import { decodeId, encodeId } from '@/lib/slug';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import ShareButtons from '@/components/ShareButtons';
import BackToTop from '@/components/BackToTop';
import ViewTracker from '@/components/ViewTracker';
import CommentsSection from '@/components/CommentsSection';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rilindjenews.com';
const SITE_NAME = 'NextShqip';

// ── SEO: generateMetadata ─────────────────────────────────────────
export async function generateMetadata(props) {
  const params = await props.params;
  const id = decodeId(params.slug);
  if (!id) return { title: 'Lajm i Panjohur' };

  const post = await getPostById(id);
  if (!post) return { title: 'Lajm i Panjohur' };

  const description = post.summary
    ? post.summary.slice(0, 160)
    : post.content?.slice(0, 160);

  const articleUrl = `${SITE_URL}/news/${params.slug}`;

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description,
    keywords: [post.section, 'lajme', 'albania', 'news', SITE_NAME].filter(Boolean),
    authors: post.author ? [{ name: post.author }] : [],
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: articleUrl,
      siteName: SITE_NAME,
      locale: 'sq_AL',
      publishedTime: post.published_at || post.created_at,
      authors: post.author ? [post.author] : [],
      section: post.section || 'Aktualitet',
      images: post.image_url
        ? [{ url: post.image_url, alt: post.title, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.image_url ? [post.image_url] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: { canonical: articleUrl },
  };
}

// ── Helpers ───────────────────────────────────────────────────────
function readingTimeMin(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Page ──────────────────────────────────────────────────────────
export default async function NewsArticlePage(props) {
  const params = await props.params;
  const { slug } = params;

  const id = decodeId(slug);
  if (!id) notFound();

  const [post, allPostsRes] = await Promise.all([
    getPostById(id),
    getPosts()
  ]);

  if (!post) notFound();

  const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString('sq-AL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const allPosts = allPostsRes || [];
  const relatedPosts = allPosts.filter(p => p.id !== post.id).slice(0, 8);

  const postDate = new Date(post.published_at || post.created_at);
  const isWithin24Hours = (Date.now() - postDate.getTime()) < 24 * 60 * 60 * 1000;
  const showBreaking = post.is_breaking && isWithin24Hours;

  const readMins = readingTimeMin(post.content);
  const articleUrl = `${SITE_URL}/news/${slug}`;

  return (
    <div className="bg-white min-h-screen w-full">

      {/* Track this page view — invisible, fire-and-forget */}
      <ViewTracker slug={slug} />

      {/* Reading progress bar — sticks to top as you scroll */}
      <ReadingProgressBar />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 w-full">

        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center group text-slate-500 hover:text-red-600 transition-colors mb-6 text-sm font-semibold tracking-wide uppercase"
        >
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">❮</span>
          Kthehu te Ballina
        </Link>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

          {/* ════════════ LEFT: Article ════════════ */}
          <main className="flex-1 min-w-0" id="article-content">

            {/* Category / Breaking badge */}
            <div className="flex gap-3 items-center mb-5">
              <span className="bg-red-600 text-white text-xs font-bold uppercase px-3 py-1.5 tracking-widest shadow-sm">
                {post.section || 'AKTUALITET'}
              </span>
              {showBreaking && (
                <span className="text-red-600 text-[11px] font-bold uppercase flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded">
                  <span className="animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)] h-2 w-2 bg-red-600 rounded-full inline-block" />
                  LAJMI FUNDIT
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              {post.title}
            </h1>

            {/* Summary */}
            {post.summary && (
              <p className="text-lg md:text-xl font-medium text-slate-600 mb-8 leading-relaxed border-l-4 border-red-500 pl-4">
                {post.summary}
              </p>
            )}

            {/* Author + Date + Reading Time */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-base uppercase border border-slate-200">
                  {post.author ? post.author.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-none mb-1">{post.author || 'Anonim'}</p>
                  <p className="text-[13px] text-slate-500">{dateStr}</p>
                </div>
              </div>
              {/* Reading time badge */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[12px] font-semibold text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                {readMins} min lexim
              </div>
            </div>

            {/* Featured Image */}
            {post.image_url && (
              <figure className="mb-10 w-full group relative overflow-hidden rounded-xl shadow-md">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-auto max-h-[520px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
                />
              </figure>
            )}

            {/* Article Body */}
            <article className="text-lg md:text-[20px] text-slate-800 leading-[1.85] font-sans tracking-[0.01em] antialiased space-y-7 overflow-hidden">
              {post.content.split('\n')
                .filter(p => p.trim() !== '')
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className={index === 0 ? 'first-letter:text-7xl first-letter:font-black first-letter:text-red-600 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-line:tracking-wide pt-2' : ''}
                  >
                    {paragraph}
                  </p>
                ))}
            </article>

            {/* ── Social Share Buttons ── */}
            <ShareButtons url={articleUrl} title={post.title} />

            {/* ── Comments Section ── */}
            <CommentsSection postId={post.id} />

            {/* Media Gallery */}
            {Array.isArray(post.media_gallery) && post.media_gallery.length > 0 && (
              <section className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-6 bg-red-600 inline-block" />
                  Foto &amp; Video
                </h2>

                {post.media_gallery.some(m => m.type === 'image') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {post.media_gallery.filter(m => m.type === 'image').map((m, i) => (
                      <figure key={i} className="group relative overflow-hidden rounded-md shadow-sm border border-gray-100">
                        <img
                          src={m.url}
                          alt={m.caption || `Foto ${i + 1}`}
                          className="w-full h-auto max-h-[420px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        {m.caption && (
                          <figcaption className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1.5">
                            {m.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {post.media_gallery.some(m => m.type === 'video') && (
                  <div className="flex flex-col gap-5">
                    {post.media_gallery.filter(m => m.type === 'video').map((m, i) => (
                      <figure key={i} className="rounded-md overflow-hidden shadow-sm border border-gray-100">
                        <video src={m.url} controls className="w-full max-h-[520px] bg-black" preload="metadata" />
                        {m.caption && (
                          <figcaption className="text-xs text-slate-500 mt-1 px-1">{m.caption}</figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>

          {/* ════════════ RIGHT: Sidebar ════════════ */}
          {relatedPosts.length > 0 && (
            <aside className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0">
              <div className="lg:sticky lg:top-[70px]">

                {/* Sidebar header */}
                <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-slate-200">
                  <span className="w-1.5 h-5 bg-red-600 rounded-full inline-block" />
                  <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-[0.15em]">
                    Lajme të Tjera
                  </h2>
                </div>

                {/* Post list */}
                <div className="divide-y divide-slate-100">
                  {relatedPosts.map((relatedPost, idx) => (
                    <div key={`${relatedPost.id}-${idx}`} className="py-3 first:pt-0">
                      <Link
                        href={`/news/${encodeId(relatedPost.id)}`}
                        className="flex gap-3 group hover:bg-slate-50 transition-colors rounded-lg p-2 -mx-2"
                      >
                        <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 relative">
                          {relatedPost.image_url ? (
                            <img
                              src={relatedPost.image_url}
                              alt={relatedPost.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xl">🌍</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {relatedPost.section && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-1 block">
                              {relatedPost.section}
                            </span>
                          )}
                          <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-3 group-hover:text-red-600 transition-colors">
                            {relatedPost.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            {new Date(relatedPost.created_at).toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* "More news" link */}
                <Link
                  href="/"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 uppercase tracking-wider"
                >
                  Të gjitha lajmet <span>→</span>
                </Link>

              </div>
            </aside>
          )}

        </div>
      </div>

      {/* Floating back-to-top button */}
      <BackToTop />
    </div>
  );
}
