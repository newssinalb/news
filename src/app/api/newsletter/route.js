import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/newsletter
 * Body: { email: string }
 * Saves the email to the newsletter_subscribers table in Supabase.
 *
 * ⚠️  Run this SQL in your Supabase SQL Editor first:
 *   CREATE TABLE newsletter_subscribers (
 *     id          bigint generated always as identity primary key,
 *     email       text unique not null,
 *     subscribed_at timestamptz default now(),
 *     active      boolean default true
 *   );
 */
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Email i pavlefshëm.' }, { status: 400 });
    }

    if (!supabase) {
      return Response.json({ error: 'Gabim serveri.' }, { status: 500 });
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' });

    if (error) {
      console.error('Newsletter insert error:', error);
      return Response.json({ error: 'Gabim gjatë regjistrimit.' }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Newsletter error:', err);
    return Response.json({ error: 'Gabim i papritur.' }, { status: 500 });
  }
}
