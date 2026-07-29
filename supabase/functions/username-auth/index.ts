import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@^2';

Deno.serve(async (request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await request.json();
    const action = String(body.action || '');
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, serviceKey);
    const auth = createClient(url, anonKey);

    if (action === 'register') {
      const username = String(body.username || '').trim().toLowerCase();
      const displayName = String(body.displayName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!/^[a-z0-9_]{3,30}$/.test(username) || !displayName || !email || password.length < 8) {
        throw new Error('Thông tin đăng ký chưa hợp lệ.');
      }
      const { data: existing } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
      if (existing) throw new Error('Tên đăng nhập đã được sử dụng.');
      const { data, error } = await auth.auth.signUp({
        email, password,
        options: { data: { username, display_name: displayName } },
      });
      if (error) throw error;
      return Response.json({ session: data.session, user: data.user }, { headers: cors });
    }

    const username = String(body.username || '').trim().toLowerCase();
    const { data: profile } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
    if (!profile) throw new Error('Tên đăng nhập không tồn tại.');
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
    if (userError || !userData.user?.email) throw new Error('Không thể xác định tài khoản.');

    if (action === 'login') {
      const { data, error } = await auth.auth.signInWithPassword({
        email: userData.user.email,
        password: String(body.password || ''),
      });
      if (error) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
      return Response.json({ session: data.session }, { headers: cors });
    }

    if (action === 'recover') {
      const redirectTo = String(body.redirectTo || '');
      const { error } = await auth.auth.resetPasswordForEmail(userData.user.email, { redirectTo });
      if (error) throw error;
      return Response.json({ ok: true }, { headers: cors });
    }
    throw new Error('Yêu cầu không hợp lệ.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể xử lý yêu cầu.';
    return Response.json({ error: message }, { status: 400, headers: cors });
  }
});
