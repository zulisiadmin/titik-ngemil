const encoder = new TextEncoder();
const allowedStages = ['terkirim','ditinjau','verifikasi','disetujui','perlu-revisi','ditolak'];
const allowedBoothStatus = ['buka','tutup','habis'];

function cors(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = origin === env.ALLOWED_ORIGIN || origin === 'http://localhost:8790';
  return { 'Access-Control-Allow-Origin': allowed ? origin : env.ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', Vary: 'Origin' };
}
function response(request, env, body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type':'application/json; charset=utf-8', ...cors(request,env) } }); }
const hex = bytes => [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2,'0')).join('');
const randomHex = length => hex(crypto.getRandomValues(new Uint8Array(length)));
async function hashPassword(password,salt){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:10000,hash:'SHA-256'},key,256));}
async function hashToken(token){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(token)));}
async function jsonBody(request){return request.json().catch(()=>({}));}

async function currentUser(request,env){
  const header=request.headers.get('Authorization')||''; if(!header.startsWith('Bearer '))return null;
  const tokenHash=await hashToken(header.slice(7));
  return env.DB.prepare(`SELECT users.id,users.email,users.brand_name,users.owner_name,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>datetime('now')`).bind(tokenHash).first();
}
async function requireUser(request,env){const user=await currentUser(request,env);if(!user)throw Object.assign(new Error('Silakan login terlebih dahulu.'),{status:401});return user;}
async function requireAdmin(request,env){const user=await requireUser(request,env);if(user.role!=='admin')throw Object.assign(new Error('Akses admin diperlukan.'),{status:403});return user;}

async function createUser(env,body,role='tenant'){
  const email=String(body.email||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email))throw Object.assign(new Error('Format email tidak valid.'),{status:422});
  if(String(body.password||'').length<8)throw Object.assign(new Error('Kata sandi minimal 8 karakter.'),{status:422});
  if(await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first())throw Object.assign(new Error('Email sudah terdaftar.'),{status:409});
  const salt=randomHex(16), passwordHash=await hashPassword(body.password,salt);
  const result=await env.DB.prepare('INSERT INTO users (email,brand_name,owner_name,password_hash,password_salt,role) VALUES (?,?,?,?,?,?)').bind(email,body.brand.trim(),body.owner.trim(),passwordHash,salt,role).run();
  const id=result.meta.last_row_id;
  await env.DB.prepare('INSERT INTO tenant_profiles (user_id,category,phone,story,booth,booth_status) VALUES (?,?,?,?,?,?)').bind(id,body.category||null,body.contact||body.phone||null,body.story||null,body.booth||null,body.booth_status||'buka').run();
  return {id,email};
}

async function register(request,env){
  const body=await jsonBody(request), required=['brand','owner','category','contact','email','password','menu','story'];
  const missing=required.find(key=>!String(body[key]||'').trim());if(missing)throw Object.assign(new Error(`Field ${missing} wajib diisi.`),{status:422});
  const user=await createUser(env,body);
  const appId=`APP-${new Date().getUTCFullYear()}-${randomHex(4).toUpperCase()}`;
  await env.DB.prepare('INSERT INTO applications (app_id,user_id,brand_name,category,contact_name,phone,email,pitch,menu) VALUES (?,?,?,?,?,?,?,?,?)').bind(appId,user.id,body.brand.trim(),body.category,body.owner.trim(),body.contact.trim(),user.email,body.story.trim(),body.menu.trim()).run();
  await env.DB.prepare('INSERT INTO tenant_menu_items (user_id,name,description,price) VALUES (?,?,?,?)').bind(user.id,body.menu.trim(),'Menu andalan',0).run();
  return response(request,env,{ok:true,id:appId,stage:'terkirim',message:'Pendaftaran berhasil dikirim. Akun tenant sudah dibuat.'},201);
}

async function login(request,env){
  const body=await jsonBody(request),email=String(body.email||'').trim().toLowerCase();const user=await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  if(!user||await hashPassword(String(body.password||''),user.password_salt)!==user.password_hash)return response(request,env,{error:'Email atau kata sandi salah.'},401);
  const token=randomHex(32);await env.DB.prepare("INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,datetime('now','+30 days'))").bind(await hashToken(token),user.id).run();
  return response(request,env,{ok:true,token,user:{id:user.id,email:user.email,brand:user.brand_name,owner:user.owner_name,role:user.role||'tenant'}});
}

async function profile(request,env){
  const user=await requireUser(request,env);
  if(request.method==='GET'){
    const data=await env.DB.prepare(`SELECT users.id,users.email,users.brand_name,users.owner_name,users.role,tenant_profiles.category,tenant_profiles.phone,tenant_profiles.story,tenant_profiles.booth,tenant_profiles.booth_status FROM users LEFT JOIN tenant_profiles ON tenant_profiles.user_id=users.id WHERE users.id=?`).bind(user.id).first();
    return response(request,env,{profile:data});
  }
  const body=await jsonBody(request);if(!body.brand||!body.owner)throw Object.assign(new Error('Nama usaha dan pemilik wajib diisi.'),{status:422});
  if(body.booth_status&&!allowedBoothStatus.includes(body.booth_status))throw Object.assign(new Error('Status booth tidak valid.'),{status:422});
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET brand_name=?,owner_name=? WHERE id=?').bind(body.brand,body.owner,user.id),
    env.DB.prepare("INSERT INTO tenant_profiles (user_id,category,phone,story,booth,booth_status,updated_at) VALUES (?,?,?,?,?,?,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET category=excluded.category,phone=excluded.phone,story=excluded.story,booth_status=excluded.booth_status,updated_at=datetime('now')").bind(user.id,body.category||null,body.phone||null,body.story||null,body.booth||null,body.booth_status||'buka')
  ]);
  return response(request,env,{ok:true});
}

async function menus(request,env,id=null,adminUserId=null){
  const actor=await requireUser(request,env);const owner=adminUserId&&actor.role==='admin'?Number(adminUserId):actor.id;
  if(adminUserId&&actor.role!=='admin')throw Object.assign(new Error('Akses ditolak.'),{status:403});
  if(request.method==='GET'){const {results}=await env.DB.prepare('SELECT * FROM tenant_menu_items WHERE user_id=? ORDER BY id DESC').bind(owner).all();return response(request,env,{menus:results});}
  if(request.method==='POST'){const body=await jsonBody(request);if(!body.name)throw Object.assign(new Error('Nama menu wajib diisi.'),{status:422});const result=await env.DB.prepare('INSERT INTO tenant_menu_items (user_id,name,description,price,available) VALUES (?,?,?,?,?)').bind(owner,body.name,body.description||'',Number(body.price)||0,body.available===false?0:1).run();return response(request,env,{ok:true,id:result.meta.last_row_id},201);}
  const item=await env.DB.prepare('SELECT * FROM tenant_menu_items WHERE id=?').bind(id).first();if(!item||item.user_id!==owner)throw Object.assign(new Error('Menu tidak ditemukan.'),{status:404});
  if(request.method==='PUT'){const body=await jsonBody(request);await env.DB.prepare("UPDATE tenant_menu_items SET name=?,description=?,price=?,available=?,updated_at=datetime('now') WHERE id=?").bind(body.name||item.name,body.description??item.description,Number(body.price)||0,body.available===false?0:1,id).run();return response(request,env,{ok:true});}
  await env.DB.prepare('DELETE FROM tenant_menu_items WHERE id=?').bind(id).run();return response(request,env,{ok:true});
}

async function applicationStatus(request,env,appId){const user=await requireUser(request,env);const app=await env.DB.prepare('SELECT app_id,brand_name,category,stage,note,booth,submitted_at FROM applications WHERE app_id=? AND user_id=?').bind(appId,user.id).first();return app?response(request,env,{application:app}):response(request,env,{error:'Pendaftaran tidak ditemukan.'},404);}

async function adminTenants(request,env,id=null){
  await requireAdmin(request,env);
  if(request.method==='GET'){const {results}=await env.DB.prepare(`SELECT users.id,users.email,users.brand_name,users.owner_name,users.role,tenant_profiles.category,tenant_profiles.phone,tenant_profiles.story,tenant_profiles.booth,tenant_profiles.booth_status,(SELECT COUNT(*) FROM tenant_menu_items WHERE user_id=users.id) menu_count FROM users LEFT JOIN tenant_profiles ON tenant_profiles.user_id=users.id WHERE users.role='tenant' ORDER BY users.brand_name`).all();return response(request,env,{tenants:results});}
  if(request.method==='POST'){const body=await jsonBody(request);for(const key of ['brand','owner','email','password'])if(!body[key])throw Object.assign(new Error(`Field ${key} wajib diisi.`),{status:422});const user=await createUser(env,body);return response(request,env,{ok:true,id:user.id},201);}
  const target=await env.DB.prepare("SELECT * FROM users WHERE id=? AND role='tenant'").bind(id).first();if(!target)throw Object.assign(new Error('Tenant tidak ditemukan.'),{status:404});
  if(request.method==='DELETE'){await env.DB.prepare('DELETE FROM users WHERE id=?').bind(id).run();return response(request,env,{ok:true});}
  const body=await jsonBody(request);await env.DB.batch([
    env.DB.prepare('UPDATE users SET brand_name=?,owner_name=?,email=? WHERE id=?').bind(body.brand||target.brand_name,body.owner||target.owner_name,body.email||target.email,id),
    env.DB.prepare("INSERT INTO tenant_profiles (user_id,category,phone,story,booth,booth_status,updated_at) VALUES (?,?,?,?,?,?,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET category=excluded.category,phone=excluded.phone,story=excluded.story,booth=excluded.booth,booth_status=excluded.booth_status,updated_at=datetime('now')").bind(id,body.category||null,body.phone||null,body.story||null,body.booth||null,body.booth_status||'buka')
  ]);return response(request,env,{ok:true});
}

async function adminApplications(request,env,appId=null){
  await requireAdmin(request,env);
  if(request.method==='GET'){const {results}=await env.DB.prepare('SELECT * FROM applications ORDER BY submitted_at DESC').all();return response(request,env,{applications:results});}
  const app=await env.DB.prepare('SELECT * FROM applications WHERE app_id=?').bind(appId).first();if(!app)throw Object.assign(new Error('Pendaftaran tidak ditemukan.'),{status:404});const body=await jsonBody(request);
  if(!allowedStages.includes(body.stage))throw Object.assign(new Error('Status pendaftaran tidak valid.'),{status:422});
  await env.DB.batch([
    env.DB.prepare('UPDATE applications SET stage=?,note=?,booth=? WHERE app_id=?').bind(body.stage,body.note||null,body.booth||null,appId),
    env.DB.prepare("UPDATE tenant_profiles SET booth=?,updated_at=datetime('now') WHERE user_id=?").bind(body.booth||null,app.user_id)
  ]);return response(request,env,{ok:true});
}

async function logout(request,env){const header=request.headers.get('Authorization')||'';if(header.startsWith('Bearer '))await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hashToken(header.slice(7))).run();return response(request,env,{ok:true});}

export default {async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(request,env)});const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
  try{
    if(request.method==='GET'&&path==='/api/health')return response(request,env,{ok:true,service:'titik-ngemil-api'});
    if(request.method==='POST'&&path==='/api/register')return register(request,env);
    if(request.method==='POST'&&path==='/api/login')return login(request,env);
    if(path==='/api/profile'&&['GET','PUT'].includes(request.method))return profile(request,env);
    if(path==='/api/menus'&&['GET','POST'].includes(request.method))return menus(request,env);
    let match=path.match(/^\/api\/menus\/(\d+)$/);if(match&&['PUT','DELETE'].includes(request.method))return menus(request,env,Number(match[1]));
    match=path.match(/^\/api\/applications\/([^/]+)$/);if(match&&request.method==='GET')return applicationStatus(request,env,decodeURIComponent(match[1]));
    if(path==='/api/admin/tenants'&&['GET','POST'].includes(request.method))return adminTenants(request,env);
    match=path.match(/^\/api\/admin\/tenants\/(\d+)$/);if(match&&['PUT','DELETE'].includes(request.method))return adminTenants(request,env,Number(match[1]));
    if(path==='/api/admin/applications'&&request.method==='GET')return adminApplications(request,env);
    match=path.match(/^\/api\/admin\/applications\/([^/]+)$/);if(match&&request.method==='PUT')return adminApplications(request,env,decodeURIComponent(match[1]));
    match=path.match(/^\/api\/admin\/tenants\/(\d+)\/menus$/);if(match&&['GET','POST'].includes(request.method))return menus(request,env,null,Number(match[1]));
    match=path.match(/^\/api\/admin\/tenants\/(\d+)\/menus\/(\d+)$/);if(match&&['PUT','DELETE'].includes(request.method))return menus(request,env,Number(match[2]),Number(match[1]));
    if(request.method==='GET'&&path==='/api/me'){const user=await currentUser(request,env);return user?response(request,env,{user}):response(request,env,{error:'Unauthorized'},401);}
    if(request.method==='POST'&&path==='/api/logout')return logout(request,env);
    return response(request,env,{error:'Endpoint tidak ditemukan.'},404);
  }catch(error){return response(request,env,{error:error.message||'Terjadi kesalahan pada server.'},error.status||500);}
}};
