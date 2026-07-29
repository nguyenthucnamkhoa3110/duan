const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
});

const apartmentsTable = `
  CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    district TEXT NOT NULL,
    price INTEGER NOT NULL,
    area INTEGER NOT NULL,
    description TEXT NOT NULL,
    amenities TEXT NOT NULL,
    images TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

async function ensureDatabase(env) {
  await env.DB.prepare(apartmentsTable).run();
}

function toApartment(row) {
  return {
    ...row,
    amenities: JSON.parse(row.amenities || '[]'),
    images: JSON.parse(row.images || '[]'),
    featured: Boolean(row.featured),
    isDefault: false,
  };
}

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function signToken(password, expiresAt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(expiresAt)));
  return `${expiresAt}.${bytesToHex(signature)}`;
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function isAuthorized(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [expiresText] = token.split('.');
  const expiresAt = Number(expiresText);
  if (!expiresAt || expiresAt < Date.now()) return false;
  return safeEqual(token, await signToken(env.ADMIN_PASSWORD, expiresAt));
}

async function handleApi(request, env, url) {
  if (!env.DB || !env.IMAGES) return json({ error: 'Kho dữ liệu chưa được cấu hình.' }, 503);
  await ensureDatabase(env);

  if (url.pathname === '/api/apartments' && request.method === 'GET') {
    const result = await env.DB.prepare('SELECT * FROM apartments ORDER BY created_at DESC, id DESC').all();
    return json((result.results || []).map(toApartment));
  }

  if (url.pathname === '/api/admin/login' && request.method === 'POST') {
    if (!env.ADMIN_PASSWORD) return json({ error: 'Chưa thiết lập mật khẩu quản trị.' }, 503);
    const body = await request.json().catch(() => ({}));
    if (!safeEqual(String(body.password || ''), String(env.ADMIN_PASSWORD))) {
      return json({ error: 'Mật khẩu không đúng.' }, 401);
    }
    const expiresAt = Date.now() + (12 * 60 * 60 * 1000);
    return json({ token: await signToken(env.ADMIN_PASSWORD, expiresAt) });
  }

  if (url.pathname.startsWith('/api/admin/') && !(await isAuthorized(request, env))) {
    return json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' }, 401);
  }

  if (url.pathname === '/api/admin/apartments' && request.method === 'POST') {
    const form = await request.formData();
    const files = form.getAll('images').filter(value => value instanceof File && value.size > 0);
    if (!files.length || files.length > 8) return json({ error: 'Hãy chọn từ 1 đến 8 hình ảnh.' }, 400);

    const title = String(form.get('title') || '').trim();
    const type = String(form.get('type') || '').trim();
    const district = String(form.get('district') || '').trim();
    const description = String(form.get('description') || '').trim();
    const price = Number(form.get('price'));
    const area = Number(form.get('area'));
    const amenities = JSON.parse(String(form.get('amenities') || '[]'));
    if (!title || !type || !district || !description || !Number.isFinite(price) || !Number.isFinite(area)) {
      return json({ error: 'Vui lòng nhập đầy đủ thông tin hợp lệ.' }, 400);
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const imageUrls = [];
    const uploadedKeys = [];
    try {
      for (const file of files) {
        if (!allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
          throw new Error('Mỗi ảnh phải là JPG, PNG hoặc WebP và nhỏ hơn 8 MB.');
        }
        const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const key = `apartments/${crypto.randomUUID()}.${extension}`;
        await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
        uploadedKeys.push(key);
        imageUrls.push(`/api/images/${key}`);
      }

      const result = await env.DB.prepare(`
        INSERT INTO apartments (title, type, district, price, area, description, amenities, images, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title, type, district, Math.round(price), Math.round(area), description,
        JSON.stringify(amenities), JSON.stringify(imageUrls), form.get('featured') === 'true' ? 1 : 0,
      ).run();
      return json({ id: result.meta.last_row_id }, 201);
    } catch (error) {
      await Promise.all(uploadedKeys.map(key => env.IMAGES.delete(key)));
      return json({ error: error.message || 'Không thể lưu căn hộ.' }, 400);
    }
  }

  const deleteMatch = url.pathname.match(/^\/api\/admin\/apartments\/(\d+)$/);
  if (deleteMatch && request.method === 'DELETE') {
    const row = await env.DB.prepare('SELECT images FROM apartments WHERE id = ?').bind(Number(deleteMatch[1])).first();
    if (!row) return json({ error: 'Không tìm thấy căn hộ.' }, 404);
    const imageKeys = JSON.parse(row.images || '[]').map(imageUrl => imageUrl.replace('/api/images/', ''));
    await env.DB.prepare('DELETE FROM apartments WHERE id = ?').bind(Number(deleteMatch[1])).run();
    await Promise.all(imageKeys.map(key => env.IMAGES.delete(key)));
    return json({ ok: true });
  }

  const imageMatch = url.pathname.match(/^\/api\/images\/(.+)$/);
  if (imageMatch && request.method === 'GET') {
    const object = await env.IMAGES.get(imageMatch[1]);
    if (!object) return new Response('Not found', { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    return new Response(object.body, { headers });
  }

  return json({ error: 'Không tìm thấy.' }, 404);
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, url);

    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const assetUrl = new URL(requestedPath, request.url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (response.status === 404 && !requestedPath.includes('.')) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
    return response;
  },
};

export default worker;
