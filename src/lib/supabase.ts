import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function apartmentFromRow(row: any) {
  return {
    ...row,
    featured: Boolean(row.featured),
    isDefault: false,
  };
}

export async function listApartments() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(apartmentFromRow);
}

export async function uploadApartmentImages(files: File[], userId: string) {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');

  const uploadedPaths: string[] = [];
  const publicUrls: string[] = [];

  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from('apartment-images')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from('apartment-images').remove(uploadedPaths);
      }
      throw error;
    }

    uploadedPaths.push(path);
    const { data } = supabase.storage.from('apartment-images').getPublicUrl(path);
    publicUrls.push(data.publicUrl);
  }

  return { uploadedPaths, publicUrls };
}

