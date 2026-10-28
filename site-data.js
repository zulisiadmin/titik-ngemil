const TN = window.TITIK_DB;
const TN_LANG = localStorage.getItem('tn_language') || 'id';
const tnText = (value) => typeof value === 'string' ? value : (value?.[TN_LANG] || value?.id || '');
const tnMoney = (value) => new Intl.NumberFormat(TN_LANG === 'en' ? 'en-US' : 'id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const tnCategory = { kuliner: ['Makanan', 'Food'], minuman: ['Minuman', 'Drinks'], jajanan: ['Jajanan', 'Snacks'], dessert: ['Dessert', 'Dessert'], nonfood: ['Non-food', 'Non-food'] };
const tnCategoryName = (id) => (tnCategory[id] || [id, id])[TN_LANG === 'en' ? 1 : 0];
const tenantImages = ['kopi-titik.jpg','es-teh-pakde.jpg','kue-cubit.jpg','sate-ayam.jpg','proses-memasak.jpg','tenant-01.jpg','transaksi.jpg','suasana-malam.jpg'];
const tnTenantImage = (tenant, index = 0) => {
  const exact = { 'kopi-titik-ngemil':'kopi-titik.jpg', 'es-teh-jumbo':'es-teh-pakde.jpg', 'kue-cubit-rangi-bu-iyem':'kue-cubit.jpg', 'sate-ayam-pak-kumis':'sate-ayam.jpg' };
  return exact[tenant.slug] || tenantImages[index % tenantImages.length];
};

function tnHeader(active = '') {
  const labels = TN_LANG === 'en' ? ['Events','Tenants','All menus','Visit','About','Contact','Sign in','Join'] : ['Acara','Tenant','Semua menu','Kunjungan','Tentang','Kontak','Login','Gabung'];
  return `<header class="site-header"><a class="brand" href="index.html"><span class="brand-mark">T</span><span><strong>Titik Ngemil</strong><small>${TN_LANG === 'en' ? 'Curated culinary market' : 'Pasar kuliner terkurasi'}</small></span></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">Menu</button><nav id="main-nav" class="main-nav"><a href="acara.html">${labels[0]}</a><a href="menu.html">${labels[1]}</a><a href="semua-menu.html">${labels[2]}</a><a href="kunjungan.html">${labels[3]}</a><a href="tentang.html">${labels[4]}</a><a href="kontak.html">${labels[5]}</a><a href="login.html">${labels[6]}</a><a class="nav-cta" href="daftar-tenant.html">${labels[7]}</a></nav></header>`;
}

function tnFooter() {
  return `<footer class="site-footer"><div class="brand brand-footer"><span class="brand-mark">T</span><span><strong>Titik Ngemil</strong><small>${TN_LANG === 'en' ? 'Curated culinary market' : 'Pasar kuliner terkurasi'}</small></span></div><p>${TN_LANG === 'en' ? 'Local flavors, shared space.' : 'Rasa lokal, ruang bersama.'}</p><div><a href="lokasi.html">${TN_LANG === 'en' ? 'Locations' : 'Lokasi'}</a><a href="partner.html">Partner</a><a href="syarat.html">${TN_LANG === 'en' ? 'Terms' : 'Syarat'}</a><a href="privasi.html">${TN_LANG === 'en' ? 'Privacy' : 'Privasi'}</a></div><small>© 2026 Titik Ngemil</small></footer>`;
}
