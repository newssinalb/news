import { supabase } from '@/lib/supabase';
import { encodeId } from '@/lib/slug';

export const dynamic = 'force-dynamic';

/**
 * GET /api/views/stats
 * Returns aggregated site-wide view statistics for the admin dashboard:
 * - Totals by time period (daily, weekly, monthly, all-time)
 * - Top 10 most-viewed articles per period
 * - Hourly breakdown for today (24 buckets)
 * - Daily breakdown for last 30 days
 */
export async function GET() {
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const now = new Date();
  const dayAgo   = new Date(now - 1  * 24 * 60 * 60 * 1000).toISOString();
  const weekAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // ── Aggregate totals ────────────────────────────────────────────
    const [daily, weekly, monthly, allTime] = await Promise.all([
      supabase.from('post_views').select('*', { count: 'exact', head: true }).gte('viewed_at', dayAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }).gte('viewed_at', weekAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }).gte('viewed_at', monthAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }),
    ]);

    // ── Hourly breakdown for today (for the sparkline chart) ────────
    // Fetch today's raw rows, bucket them by hour client-side
    const { data: todayRows } = await supabase
      .from('post_views')
      .select('viewed_at')
      .gte('viewed_at', dayAgo)
      .order('viewed_at', { ascending: true });

    const hourlyBuckets = Array(24).fill(0);
    (todayRows || []).forEach(row => {
      const h = new Date(row.viewed_at).getHours();
      hourlyBuckets[h]++;
    });

    // ── Daily breakdown for last 30 days ────────────────────────────
    const { data: monthRows } = await supabase
      .from('post_views')
      .select('viewed_at')
      .gte('viewed_at', monthAgo)
      .order('viewed_at', { ascending: true });

    // Build daily buckets keyed by YYYY-MM-DD
    const dailyMap = {};
    (monthRows || []).forEach(row => {
      const d = row.viewed_at.slice(0, 10);
      dailyMap[d] = (dailyMap[d] || 0) + 1;
    });
    // Fill all 30 days, even empty ones
    const dailyBuckets = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyBuckets.push({ date: key, views: dailyMap[key] || 0 });
    }

    // ── Top 10 most-viewed articles (monthly) ────────────────────────
    const { data: topRows } = await supabase
      .from('post_views')
      .select('post_id')
      .gte('viewed_at', monthAgo);

    // Count per post_id
    const postCounts = {};
    (topRows || []).forEach(r => {
      postCounts[r.post_id] = (postCounts[r.post_id] || 0) + 1;
    });

    // Sort and take top 10
    const topIds = Object.entries(postCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, views]) => ({ id: parseInt(id), views }));

    // Fetch post titles for those IDs
    let topPosts = [];
    if (topIds.length > 0) {
      const { data: postData } = await supabase
        .from('posts')
        .select('id, title, section')
        .in('id', topIds.map(t => t.id));

      topPosts = topIds.map(({ id, views }) => {
        const post = (postData || []).find(p => p.id === id);
        return {
          id,
          slug: encodeId(id),
          title: post?.title || `Post #${id}`,
          section: post?.section || '—',
          views,
        };
      });
    }

    return Response.json({
      totals: {
        daily:   daily.count   ?? 0,
        weekly:  weekly.count  ?? 0,
        monthly: monthly.count ?? 0,
        allTime: allTime.count ?? 0,
      },
      hourlyBuckets,   // array[24] — views per hour for today
      dailyBuckets,    // array[30] — { date, views } for last 30 days
      topPosts,        // top 10 most read this month
    });
  } catch (err) {
    console.error('Stats error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
