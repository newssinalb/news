import { getPosts } from '@/lib/supabase';
import { getWorldNews } from '@/lib/newsapi';
import NewsTicker from '@/components/NewsTicker';
import HeroArticle from '@/components/HeroArticle';
import ArticleCard from '@/components/ArticleCard';
import CategoryGrid from '@/components/CategoryGrid';

export const revalidate = 60; // Cash the page for 60 seconds for instant load times (ISR)

export default async function Home(props) {
  // In Next.js 15+, searchParams is a Promise that must be awaited
  const searchParams = await props.searchParams;
  const sectionFilter = searchParams?.section;
  
  // Run database and Google News fetches in PARALLEL to slash loading times
  const [postsRes, worldNewsPosts] = await Promise.all([
    getPosts(),
    getWorldNews()
  ]);
  let posts = postsRes || [];

  // IF User clicked a specific category loop, render only that category
  if (sectionFilter) {
    const dbPosts = posts.filter(p => p.section === sectionFilter);
    // For Bota: merge user posts with all live RSS world news
    const filteredPosts = sectionFilter === 'Bota'
      ? [...dbPosts, ...worldNewsPosts]
      : dbPosts;

    return (
      <div className="bg-white min-h-screen w-full">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 w-full">
        <h1 className="text-3xl font-black mb-8 uppercase text-slate-800 flex items-center gap-3">
          <span className="w-2 h-8 bg-red-600 inline-block"></span>
          {sectionFilter}
        </h1>
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-lg border-2 border-dashed border-gray-200 rounded-lg">
            Kjo kategori nuk ka lajme deri tani.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPosts.map((post, idx) => (
              <div key={post.id ?? `external-${idx}`} className="bg-gray-50 rounded-xl p-3 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col group/card cursor-pointer">
                <ArticleCard post={post} layout="vertical" />
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    );
  }

  // DEFAULT HOMEPAGE
  const latestPosts = posts.slice(0, 5);
  
  // Hero post: only show if it was published within the last 24 hours
  const rawHeroPost = posts.length > 0 ? posts[0] : null;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const heroPost = rawHeroPost && new Date(rawHeroPost.published_at || rawHeroPost.created_at) > oneDayAgo
    ? rawHeroPost
    : null;
  
  const subHeroPosts = posts.slice(1, 5); // next 4 posts

  // Determine sections dynamically to map at the bottom
  const SECTIONS = ['Aktualitet', 'Edi Rama', 'Politikë', 'Bota', 'Showbiz', 'Sport', 'Ekonomi', 'Kronikë', 'Teknologji', 'Të Tjera'];
  
  // For Bota: merge user-posted Bota articles with Google News RSS
  // Homepage shows a 20-article preview; full list (up to 80) is at /?section=Bota
  const botaOverride = [
    ...posts.filter(p => p.section === 'Bota'),
    ...worldNewsPosts
  ].slice(0, 20);  // preview on homepage

  return (
    <div className="bg-white min-h-screen w-full">
    <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 w-full">
      
      {/* 1. Ticker Section */}
      <NewsTicker latestPosts={latestPosts} />
      
      {posts.length === 0 ? (
        <div className="py-20 text-center text-gray-500 text-lg border-2 border-dashed border-gray-200 rounded-lg">
          Henüz hiç haber bulunmuyor. Lütfen admin panelinden ekleyin.
        </div>
      ) : (
        <>
          {/* Main Layout Grid (Top Breaking News) */}
          <div className="flex flex-col gap-8 mb-16">
            
            {/* Top Large Hero — only visible for 24h after publish */}
            {heroPost && (
              <div className="transition-transform duration-300 hover:scale-[1.01] cursor-pointer">
                <HeroArticle post={heroPost} category="LAJMI FUNDIT" />
              </div>
            )}
            
            {/* Row of small images - Bento Grid Effect */}
            {subHeroPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {subHeroPosts.map(post => (
                  <div key={post.id} className="bg-slate-50/50 rounded-xl p-3 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col group/card cursor-pointer">
                    <ArticleCard post={post} layout="vertical" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Bottom Grid Sections */}
          <div className="flex flex-col gap-12 pt-8 border-t-2 border-slate-100 border-dashed">
            {SECTIONS.map((sectionName) => {
              // For Bota use the merged Google News + user posts; otherwise filter from DB
              const sectionPosts = sectionName === 'Bota'
                ? botaOverride
                : posts.filter(p => p.section === sectionName).slice(0, 5);
              
              if (sectionPosts.length === 0) return null;

              return (
                <CategoryGrid 
                  key={sectionName} 
                  title={sectionName} 
                  posts={sectionPosts} 
                  href={`/?section=${encodeURIComponent(sectionName)}`}
                />
              );
            })}
          </div>
        </>
      )}
    </main>
    </div>
  );
}
