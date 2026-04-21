import { supabase } from '@/lib/supabase';
import { encodeId } from '@/lib/slug';

export const dynamic = 'force-dynamic';
// Cache this response for 5 minutes at the CDN / Next.js layer
export const revalidate = 300;

/**
 * GET /api/trending
 * Returns the top 5 most-read articles in the last 48 hours,
 * derived from the existing post_views table.
 */
export async function GET() {
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // Fetch all post_view rows from the last 48h
    const { data: viewRows, error: viewError } = await supabase
      .from('post_views')
      .select('post_id')
      .gte('viewed_at', fortyEightHoursAgo);

    if (viewError) throw viewError;

    // Count views per post
    const counts = {};
    (viewRows || []).forEach(({ post_id }) => {
      counts[post_id] = (counts[post_id] || 0) + 1;
    });

    // Sort and take top 5 IDs
    const topIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => parseInt(id));

    if (topIds.length === 0) {
      return Response.json({ posts: [] });
    }

    // Fetch post details for top IDs
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .select('id, title, image_url, section, created_at, published_at')
      .in('id', topIds);

    if (postError) throw postError;

    // Re-sort by view count (Supabase .in() doesn't preserve order)
    const sorted = topIds
      .map(id => {
        const post = (posts || []).find(p => p.id === id);
        if (!post) return null;
        return {
          ...post,
          slug: encodeId(post.id),
          views: counts[id] || 0,
        };
      })
      .filter(Boolean);

    return Response.json({ posts: sorted });
  } catch (err) {
    console.error('Trending error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
