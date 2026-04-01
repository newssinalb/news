import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Eğer Supabase ayarları yapılmadıysa uygulamanın çökmesini engellemek için kontrol
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Tüm haberleri getir
export async function getPosts() {
  if (!supabase) {
    console.warn('Supabase URL veya Anon Key eksik (.env.local kontrol edin). Sahte veri (boş) dönülüyor.');
    return [];
  }

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, summary, image_url, author, section, is_breaking, created_at, published_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Haberler çekilirken hata oluştu:', error);
    return [];
  }
  return data;
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
    console.error('Haber eklenirken hata oluştu:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
}
