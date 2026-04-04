import { getPostById, getPosts } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';

export const revalidate = 60; // Same as homepage: cash for 60 seconds (ISR) for instant loads

export default async function NewsArticlePage(props) {
  const params = await props.params;
  const { id } = params;
  
  // Run queries in parallel for immense speedup
  const [post, allPostsRes] = await Promise.all([
    getPostById(id),
    getPosts()
  ]);
  
  if (!post) {
    notFound();
  }

  // Format the date using Albanian locale
  const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString('sq-AL', {
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Fetch related posts, filter out this one, limit to 3
  const allPosts = allPostsRes || [];
  const relatedPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="bg-white min-h-screen w-full">
      <main className="max-w-[850px] mx-auto px-4 sm:px-8 py-8 w-full">
      
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center group text-slate-500 hover:text-red-600 transition-colors mb-8 text-sm font-semibold tracking-wide uppercase">
        <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">❮</span> Kthehu te Ballina
      </Link>
      
      {/* Category / Section Badge */}
      <div className="flex gap-3 items-center mb-5">
        <span className="bg-red-600 text-white text-xs font-bold uppercase px-3 py-1.5 tracking-widest shadow-sm">
          {post.section || 'AKTUALITET'}
        </span>
        {post.is_breaking && (
          <span className="text-red-600 text-[11px] font-bold uppercase flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded">
            <span className="animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)] h-2 w-2 bg-red-600 rounded-full inline-block"></span>
            LAJMI FUNDIT
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
        {post.title}
      </h1>
      
      {/* Summary */}
      {post.summary && (
        <p className="text-lg md:text-xl font-medium text-slate-600 mb-8 leading-relaxed">
          {post.summary}
        </p>
      )}

      {/* Meta Information Container */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 mb-8">
         <div className="flex items-center gap-3">
             <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg uppercase border border-slate-200 shadow-sm">
               {post.author ? post.author.charAt(0) : 'A'}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-900 leading-none mb-1 shadow-sm-text">{post.author || 'Anonim'}</p>
                <p className="text-[13px] text-slate-500">{dateStr}</p>
             </div>
         </div>
      </div>

      {/* Featured Image */}
      {post.image_url && (
        <figure className="mb-10 w-full group relative overflow-hidden rounded-md shadow-md">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-auto max-h-[550px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
          />
        </figure>
      )}

      {/* Article Text Content */}
      <article className="max-w-[780px] mx-auto text-lg md:text-[20px] text-slate-800 leading-[1.85] font-sans tracking-[0.01em] antialiased space-y-7 w-full overflow-hidden">
        {post.content.split('\n')
          .filter(paragraph => paragraph.trim() !== '')
          .map((paragraph, index) => {
            const isFirst = index === 0;
            return (
              <p 
                key={index} 
                className={isFirst ? "first-letter:text-7xl first-letter:font-black first-letter:text-red-600 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-line:tracking-wide pt-2" : ""}
              >
                {paragraph}
              </p>
            );
        })}
      </article>

      {/* ── Media Gallery (extra photos & videos) ── */}
      {Array.isArray(post.media_gallery) && post.media_gallery.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-6 bg-red-600 inline-block"></span>
            Foto &amp; Video
          </h2>

          {/* Photos */}
          {post.media_gallery.some(m => m.type === 'image') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {post.media_gallery
                .filter(m => m.type === 'image')
                .map((m, i) => (
                  <figure
                    key={i}
                    className="group relative overflow-hidden rounded-md shadow-sm border border-gray-100"
                  >
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
                ))
              }
            </div>
          )}

          {/* Videos */}
          {post.media_gallery.some(m => m.type === 'video') && (
            <div className="flex flex-col gap-5">
              {post.media_gallery
                .filter(m => m.type === 'video')
                .map((m, i) => (
                  <figure key={i} className="rounded-md overflow-hidden shadow-sm border border-gray-100">
                    <video
                      src={m.url}
                      controls
                      className="w-full max-h-[520px] bg-black"
                      preload="metadata"
                    />
                    {m.caption && (
                      <figcaption className="text-xs text-slate-500 mt-1 px-1">
                        {m.caption}
                      </figcaption>
                    )}
                  </figure>
                ))
              }
            </div>
          )}
        </section>
      )}

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-6 bg-red-600 inline-block"></span>
            Lajme të tjera
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => (
              <div key={relatedPost.id} className="bg-gray-50 rounded-xl p-3 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                <ArticleCard post={relatedPost} layout="vertical" />
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
    </div>
  );
}
