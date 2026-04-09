export default function robots() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rilindjenews.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
