const encoder = new TextEncoder();

function cors(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = origin === env.ALLOWED_ORIGIN || origin === 'http://localhost:8790';
  return {
    'Access-Control-Allow-Origin': allowed ? origin : env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

function response(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(request, env) } });
}

const bytesToHex = bytes => [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
const randomHex = length => bytesToHex(crypto.getRandomValues(new Uint8Array(length)));

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 10000, hash: 'SHA-256' }, key, 256);
  return bytesToHex(bits);
}

async function hashToken(token) {
  return bytesToHex(await crypto.subtle.digest('SHA-256', encoder.encode(token)));
}

async function currentUser(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  const tokenHash = await hashToken(header.slice(7));
  return env.DB.prepare(`SELECT users.id, users.email, users.brand_name, users.owner_name
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > datetime('now')`).bind(tokenHash).first();
}

async function register(request, env) {
  const body = await request.json().catch(() => ({}));
  const required = ['brand','owner','category','contact','email','password','menu','story'];
  const missing = required.find(key => !String(body[key] || '').trim());
  if (missing) return response(request, env, { error: `Field ${missing} wajib diisi.` }, 422);
  if (!/^\S+@\S+\.\S+$/.test(body.email)) return response(request, env, { error: 'Format email tidak valid.' }, 422);
  if (String(body.password).length < 8) return response(request, env, { error: 'Kata sandi minimal 8 karakter.' }, 422);
  const email = String(body.email).trim().toLowerCase();
  if (await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()) return response(request, env, { error: 'Email sudah terdaftar. Silakan login.' }, 409);
  const salt = randomHex(16);
  const passwordHash = await hashPassword(body.password, salt);
  const userResult = await env.DB.prepare('INSERT INTO users (email, brand_name, owner_name, password_hash, password_salt) VALUES (?, ?, ?, ?, ?)')
    .bind(email, body.brand.trim(), body.owner.trim(), passwordHash, salt).run();
  const appId = `APP-${new Date().getUTCFullYear()}-${randomHex(4).toUpperCase()}`;
  await env.DB.prepare(`INSERT INTO applications (app_id,user_id,brand_name,category,contact_name,phone,email,pitch,menu)
    VALUES (?,?,?,?,?,?,?,?,?)`).bind(appId,userResult.meta.last_row_id,body.brand.trim(),body.category,body.owner.trim(),body.contact.trim(),email,body.story.trim(),body.menu.trim()).run();
  return response(request, env, { ok: true, id: appId, stage: 'terkirim', message: 'Pendaftaran berhasil dikirim. Akun tenant sudah dibuat.' }, 201);
}

async function login(request, env) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user || await hashPassword(String(body.password || ''), user.password_salt) !== user.password_hash) return response(request, env, { error: 'Email atau kata sandi salah.' }, 401);
  const token = randomHex(32); const tokenHash = await hashToken(token);
  await env.DB.prepare("INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,datetime('now','+30 days'))").bind(tokenHash,user.id).run();
  return response(request, env, { ok: true, token, user: { email:user.email, brand:user.brand_name, owner:user.owner_name } });
}

async function getApplication(request, env, appId) {
  const user = await currentUser(request, env);
  if (!user) return response(request, env, { error: 'Silakan login terlebih dahulu.' }, 401);
  const application = await env.DB.prepare('SELECT app_id,brand_name,category,stage,note,booth,submitted_at FROM applications WHERE app_id = ? AND user_id = ?').bind(appId,user.id).first();
  return application ? response(request, env, { application }) : response(request, env, { error: 'Pendaftaran tidak ditemukan.' }, 404);
}

async function logout(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (header.startsWith('Bearer ')) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashToken(header.slice(7))).run();
  return response(request, env, { ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request, env) });
    const url = new URL(request.url); const path = url.pathname.replace(/\/$/, '');
    try {
      if (request.method === 'GET' && path === '/api/health') return response(request, env, { ok:true, service:'titik-ngemil-api' });
      if (request.method === 'POST' && path === '/api/register') return register(request, env);
      if (request.method === 'POST' && path === '/api/login') return login(request, env);
      if (request.method === 'GET' && path === '/api/me') { const user=await currentUser(request,env); return user?response(request,env,{user}):response(request,env,{error:'Unauthorized'},401); }
      if (request.method === 'POST' && path === '/api/logout') return logout(request, env);
      const match = path.match(/^\/api\/applications\/([^/]+)$/);
      if (request.method === 'GET' && match) return getApplication(request, env, decodeURIComponent(match[1]));
      return response(request, env, { error:'Endpoint tidak ditemukan.' }, 404);
    } catch (error) {
      return response(request, env, { error:'Terjadi kesalahan pada server.' }, 500);
    }
  }
};
