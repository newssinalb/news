import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/** GET /api/admin/comments — fetch all pending/approved comments for moderation */
export async function GET() {
  if (!supabase) return Response.json({ comments: [] });

  const { data, error } = await supabase
    .from('post_comments')
    .select('id, post_id, name, message, created_at, approved, posts(title)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return Response.json({ comments: [] });
  return Response.json({ comments: data || [] });
}

/** PATCH /api/admin/comments — approve or delete a comment */
export async function PATCH(request) {
  if (!supabase) return Response.json({ error: 'Not configured' }, { status: 500 });

  try {
    const { id, action } = await request.json();
    if (!id || !action) return Response.json({ error: 'Missing id or action' }, { status: 400 });

    if (action === 'approve') {
      const { error } = await supabase
        .from('post_comments')
        .update({ approved: true })
        .eq('id', id);
      if (error) throw error;
      return Response.json({ ok: true });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
