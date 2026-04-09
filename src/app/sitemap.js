import { getPosts } from '@/lib/supabase';
import { encodeId } from '@/lib/slug';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rilindjenews.com';

export const revalidate = 3600; // regenerate sitemap every hour

export default async function sitemap() {
  const posts = await getPosts();

  // Static pages
  const staticRoutes = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/live`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  // Dynamic article pages
  const articleRoutes = (posts || []).map((post) => ({
    url: `${SITE_URL}/news/${encodeId(post.id)}`,
    lastModified: new Date(post.published_at || post.created_at),
    changeFrequency: 'weekly',
    priority: 0.9,
    ...(post.image_url ? { images: [post.image_url] } : {}),
  }));

  return [...staticRoutes, ...articleRoutes];
}
