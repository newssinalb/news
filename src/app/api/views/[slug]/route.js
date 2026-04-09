import { supabase } from '@/lib/supabase';
import { decodeId } from '@/lib/slug';

export const dynamic = 'force-dynamic';

/**
 * POST /api/views/[slug]
 * Records a page view for the given article slug.
 * Called client-side as a fire-and-forget beacon from the article page.
 */
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const id = decodeId(slug);
    if (!id || !supabase) {
      return Response.json({ ok: false }, { status: 400 });
    }

    await supabase.from('post_views').insert({ post_id: parseInt(id, 10) });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

/**
 * GET /api/views/[slug]
 * Returns view counts for this specific article (daily, weekly, monthly, total).
 */
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const id = decodeId(slug);
    if (!id || !supabase) {
      return Response.json({ daily: 0, weekly: 0, monthly: 0, total: 0 });
    }

    const now = new Date();
    const dayAgo   = new Date(now - 1   * 24 * 60 * 60 * 1000).toISOString();
    const weekAgo  = new Date(now - 7   * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now - 30  * 24 * 60 * 60 * 1000).toISOString();

    const postId = parseInt(id, 10);
    const [daily, weekly, monthly, total] = await Promise.all([
      supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', postId).gte('viewed_at', dayAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', postId).gte('viewed_at', weekAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', postId).gte('viewed_at', monthAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', postId),
    ]);

    return Response.json({
      daily:   daily.count   ?? 0,
      weekly:  weekly.count  ?? 0,
      monthly: monthly.count ?? 0,
      total:   total.count   ?? 0,
    });
  } catch {
    return Response.json({ daily: 0, weekly: 0, monthly: 0, total: 0 });
  }
}
