import ArticleCard from './ArticleCard';
import Link from 'next/link';

export default function CategoryGrid({ title, posts, href }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mb-14 w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-slate-200 pb-3">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-800 border-l-[6px] border-red-600 pl-3 leading-none h-[22px]">
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-[13px] font-black text-red-600 hover:text-red-800 transition-colors uppercase tracking-[0.1em] flex items-center gap-1.5 group bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md">
            Më shumë
            <span className="transform group-hover:translate-x-1 transition-transform text-lg leading-none">›</span>
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {posts.map((post, idx) => (
          <div key={`${post.id ?? idx}-${idx}`} className="bg-slate-50/50 rounded-xl p-3 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col group/card cursor-pointer">
            <ArticleCard post={post} layout="vertical" />
          </div>
        ))}
      </div>
    </div>
  );
}
