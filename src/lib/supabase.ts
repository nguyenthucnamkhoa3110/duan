import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
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

export async function usernameAuth(payload: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase.functions.invoke('username-auth', { body: payload });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  if (data?.session) {
    const { error: sessionError } = await supabase.auth.setSession(data.session);
    if (sessionError) throw sessionError;
  }
  return data;
}

export async function getMyProfile() {
  if (!supabase) return null;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
  if (error) throw error;
  return data;
}

export async function listFavoriteIds() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('favorites').select('apartment_id');
  if (error) throw error;
  return (data || []).map(item => item.apartment_id);
}

export async function setFavorite(apartmentId: string, favorite: boolean) {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Vui lòng đăng nhập để lưu căn hộ.');
  if (favorite) {
    const { error } = await supabase.from('favorites').upsert({
      user_id: authData.user.id,
      apartment_id: apartmentId,
    });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('favorites')
      .delete().eq('user_id', authData.user.id).eq('apartment_id', apartmentId);
    if (error) throw error;
  }
}

