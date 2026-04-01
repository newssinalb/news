import Link from 'next/link';

export default function HeroArticle({ post, category = "KRYESORE" }) {
  if (!post) return null;

  return (
    <Link href={`/news/${post.id}`} className="block relative group overflow-hidden w-full h-[450px] rounded-2xl shadow-sm">
      {/* Background Image */}
      {post.image_url ? (
        <img 
          src={post.image_url} 
          alt={post.title} 
          fetchPriority="high"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
          Görsel Yok
        </div>
      )}

      {/* Gradient Overlay for Text Visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 pb-8">
        
        {/* Badge */}
        <div className="bg-[#e60000] text-white text-xs font-bold uppercase px-3 py-1 w-max mb-3 tracking-wider">
          {category}
        </div>
        
        {/* Headline */}
        <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight mb-3 drop-shadow-md">
          {post.title}
        </h2>
        
        {/* Date */}
        <div className="text-gray-300 text-xs flex items-center gap-1 font-medium tracking-wide">
          {new Date(post.created_at).toLocaleDateString('sq-AL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      </div>
    </Link>
  );
}
