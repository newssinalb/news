import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Eğer Supabase ayarları yapılmadıysa uygulamanın çökmesini engellemek için kontrol
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Fetch posts — optionally filter by section or date in Supabase (faster than JS filtering)
export async function getPosts({ section, dateFrom, limit = 100 } = {}) {
  if (!supabase) {
    console.warn('Supabase URL or Anon Key missing (.env.local). Returning empty.');
    return [];
  }

  // Build query — filters MUST come before .limit() in Supabase JS v2
  let query = supabase
    .from('posts')
    .select('id, title, summary, image_url, author, section, is_breaking, created_at, published_at')
    .order('created_at', { ascending: false });

  if (section) {
    query = query.eq('section', section);
  }
  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  // Apply limit last
  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    // Log full error details — Supabase errors serialize as {} without this
    console.error('Error fetching posts:', error.message || error.code || error.details || JSON.stringify(error), { section, dateFrom, limit });
    return [];
  }
  return data || [];
}


// Tek bir haberi ID ile getir
export async function getPostById(id) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
  return data;
}

// Yeni haber ekle
export async function addPost(post) {
  if (!supabase) {
    throw new Error('Supabase URL veya Anon Key eksik. Lütfen .env.local dosyasını ayarlayın.');
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select();

  if (error) {
    const msg = error.message || error.details || error.code || JSON.stringify(error);
    console.error('Gabim gjatë shtimit të lajmit:', msg, error);
    throw new Error(msg);
  }
  return data;
}

// Haberi güncelle
export async function updatePost(id, updates) {
  if (!supabase) {
    throw new Error('Supabase URL veya Anon Key eksik. Lütfen .env.local dosyasını ayarlayın.');
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    const msg = error.message || error.details || error.code || JSON.stringify(error);
    console.error(`Gabim gjatë përditësimit (${id}):`, msg, error);
    throw new Error(msg);
  }
  return data;
}

// Haberi sil
export async function deletePost(id) {
  if (!supabase) {
    throw new Error('Supabase URL veya Anon Key eksik. Lütfen .env.local dosyasını ayarlayın.');
  }

  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    const msg = error.message || error.details || error.code || JSON.stringify(error);
    console.error(`Gabim gjatë fshirjes (${id}):`, msg, error);
    throw new Error(msg);
  }
  return data;
}

// Merr të gjitha kanalet live
export async function getLiveChannels() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('live_channels')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('getLiveChannels error:', error.message); return []; }
  return data || [];
}

// Përditëso një kanal live
export async function updateLiveChannel(id, updates) {
  if (!supabase) throw new Error('Supabase nuk është konfiguruar.');
  const { data, error } = await supabase
    .from('live_channels')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw new Error(error.message || 'Gabim gjatë përditësimit.');
  return data;
}

// Shto kanal të ri live
export async function addLiveChannel(channel) {
  if (!supabase) throw new Error('Supabase nuk është konfiguruar.');
  const { data, error } = await supabase
    .from('live_channels')
    .insert([channel])
    .select();
  if (error) throw new Error(error.message || 'Gabim gjatë shtimit.');
  return data;
}

// Fshi kanal live
export async function deleteLiveChannel(id) {
  if (!supabase) throw new Error('Supabase nuk është konfiguruar.');
  const { error } = await supabase.from('live_channels').delete().eq('id', id);
  if (error) throw new Error(error.message || 'Gabim gjatë fshirjes.');
}
