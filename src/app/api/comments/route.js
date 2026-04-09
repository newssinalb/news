import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/** GET /api/comments?postId=123 — fetch approved comments for a post */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = parseInt(searchParams.get('postId') || '0', 10);
  if (!postId || !supabase) return Response.json({ comments: [] });

  const { data, error } = await supabase
    .from('post_comments')
    .select('id, name, message, created_at')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return Response.json({ comments: [] });
  return Response.json({ comments: data || [] });
}


/** POST /api/comments — submit a new comment */
export async function POST(request) {
  if (!supabase) return Response.json({ error: 'Not configured' }, { status: 500 });

  try {
    const { postId, name, message } = await request.json();

    if (!postId || !name?.trim() || !message?.trim()) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (message.trim().length < 5 || message.trim().length > 1000) {
      return Response.json({ error: 'Invalid message length' }, { status: 400 });
    }

    // Basic spam protection: strip HTML tags
    const cleanName    = name.trim().replace(/<[^>]*>/g, '').slice(0, 60);
    const cleanMessage = message.trim().replace(/<[^>]*>/g, '').slice(0, 1000);

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: parseInt(postId, 10), name: cleanName, message: cleanMessage })
      .select('id, name, message, created_at')
      .single();

    if (error) throw error;
    return Response.json({ comment: data }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
