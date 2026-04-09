import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=keyword
 * Full-text search across posts title + content + summary.
 * Returns up to 10 matching posts.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q || q.length < 2 || !supabase) {
    return Response.json({ results: [] });
  }

  try {
    // Use Supabase ilike for simple pattern matching (works without FTS setup)
    // Search title, summary, and content
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, summary, image_url, section, created_at')
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%,content.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return Response.json({ results: data || [] });
  } catch (err) {
    console.error('Search error:', err);
    return Response.json({ results: [] }, { status: 500 });
  }
}
