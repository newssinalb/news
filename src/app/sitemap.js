import { getPosts } from '@/lib/supabase';
import { encodeId } from '@/lib/slug';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nextshqip.de';

export const revalidate = 3600; // regenerate sitemap every hour

const SECTIONS = [
  'Lajmet e Fundit', 'Aktualitet', 'Politikë', 'Bota',
  'Showbiz', 'Sport', 'Ekonomi', 'Kronikë', 'Teknologji', 'Të Tjera',
];

export default async function sitemap() {
  const posts = await getPosts({ limit: 1000 });

  // Static pages
  const staticRoutes = [
    { url: SITE_URL,          lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${SITE_URL}/live`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.7 },
  ];

  // Section / category pages (e.g. /?section=Sport)
  const sectionRoutes = SECTIONS.map(section => ({
    url: `${SITE_URL}/?section=${encodeURIComponent(section)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  // Dynamic article pages
  const articleRoutes = (posts || []).map((post) => ({
    url: `${SITE_URL}/news/${encodeId(post.id)}`,
    lastModified: new Date(post.published_at || post.created_at),
    changeFrequency: 'weekly',
    priority: 0.9,
    ...(post.image_url ? { images: [post.image_url] } : {}),
  }));

  return [...staticRoutes, ...sectionRoutes, ...articleRoutes];
}
