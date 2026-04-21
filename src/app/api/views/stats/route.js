import { supabase } from '@/lib/supabase';
import { encodeId } from '@/lib/slug';

export const dynamic = 'force-dynamic';

/**
 * GET /api/views/stats
 * Returns aggregated site-wide view statistics for the admin dashboard:
 * - Post view totals by time period (daily, weekly, monthly, all-time)
 * - Site-wide page view totals (all pages including homepage & categories)
 * - Top 20 most-viewed articles per period
 * - Top 10 most-visited pages
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
    // ── All queries in parallel for speed ───────────────────────────
    const [
      daily, weekly, monthly, allTime,
      pageDaily, pageWeekly, pageMonthly, pageAllTime,
    ] = await Promise.all([
      // Post views totals
      supabase.from('post_views').select('*', { count: 'exact', head: true }).gte('viewed_at', dayAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }).gte('viewed_at', weekAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }).gte('viewed_at', monthAgo),
      supabase.from('post_views').select('*', { count: 'exact', head: true }),
      // Site-wide page view totals
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', dayAgo),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', weekAgo),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('viewed_at', monthAgo),
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
    ]);

    // ── Hourly breakdown for today (sparkline) ───────────────────────
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

    // ── Daily breakdown for last 30 days ─────────────────────────────
    const { data: monthRows } = await supabase
      .from('post_views')
      .select('viewed_at')
      .gte('viewed_at', monthAgo)
      .order('viewed_at', { ascending: true });

    const dailyMap = {};
    (monthRows || []).forEach(row => {
      const d = row.viewed_at.slice(0, 10);
      dailyMap[d] = (dailyMap[d] || 0) + 1;
    });
    const dailyBuckets = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyBuckets.push({ date: key, views: dailyMap[key] || 0 });
    }

    // ── Top 20 most-viewed articles (monthly) ────────────────────────
    const { data: topRows } = await supabase
      .from('post_views')
      .select('post_id')
      .gte('viewed_at', monthAgo);

    const postCounts = {};
    (topRows || []).forEach(r => {
      postCounts[r.post_id] = (postCounts[r.post_id] || 0) + 1;
    });

    const allSorted = Object.entries(postCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, views]) => ({ id: parseInt(id), views }));

    const topIds = allSorted.slice(0, 20);

    const allPostCounts = {};
    allSorted.forEach(({ id, views }) => { allPostCounts[id] = views; });

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

    // ── Top 10 most-visited pages (from page_views) ──────────────────
    const { data: pageRows } = await supabase
      .from('page_views')
      .select('path')
      .gte('viewed_at', monthAgo);

    const pageCounts = {};
    (pageRows || []).forEach(r => {
      pageCounts[r.path] = (pageCounts[r.path] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    return Response.json({
      totals: {
        daily:   daily.count   ?? 0,
        weekly:  weekly.count  ?? 0,
        monthly: monthly.count ?? 0,
        allTime: allTime.count ?? 0,
      },
      // Site-wide page totals (all pages, not just articles)
      pageTotals: {
        daily:   pageDaily.count   ?? 0,
        weekly:  pageWeekly.count  ?? 0,
        monthly: pageMonthly.count ?? 0,
        allTime: pageAllTime.count ?? 0,
      },
      hourlyBuckets,   // array[24] — article views per hour for today
      dailyBuckets,    // array[30] — { date, views } for last 30 days
      topPosts,        // top 20 most read articles this month
      allPostCounts,   // { [post_id]: views } — for the admin posts table
      topPages,        // top 10 pages by visits this month
    });
  } catch (err) {
    console.error('Stats error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
