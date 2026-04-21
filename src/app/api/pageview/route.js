import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/pageview
 * Body: { path: string }
 * Records a page view for any URL path — homepage, categories, articles, live, etc.
 */
export async function POST(request) {
  try {
    const { path } = await request.json();
    if (!path || !supabase) {
      return Response.json({ ok: false }, { status: 400 });
    }

    // Normalise: trim trailing slash (except root "/"), max 500 chars
    const normPath = path === '/' ? '/' : path.replace(/\/$/, '').slice(0, 500);

    await supabase.from('page_views').insert({ path: normPath });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
