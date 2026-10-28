document.querySelector('#header').innerHTML = tnHeader('tenant');
document.querySelector('#footer').innerHTML = tnFooter();
const directory = document.querySelector('#tenant-directory');
const search = document.querySelector('#tenant-search');
const category = document.querySelector('#tenant-category');
function renderDirectory() {
  const query = search.value.trim().toLowerCase();
  const filtered = TN.tenants.filter((tenant) => {
    const haystack = [tenant.brand, tnText(tenant.tagline), ...tenant.menu.map(item => item.name)].join(' ').toLowerCase();
    return (category.value === 'all' || tenant.categoryId === category.value) && haystack.includes(query);
  });
  directory.innerHTML = filtered.map((tenant) => {
    const index = TN.tenants.indexOf(tenant);
    return `<a class="menu-card" href="tenant-detail.html?slug=${tenant.slug}"><img src="${tnTenantImage(tenant,index)}" alt="${tenant.brand}" loading="lazy"><div class="menu-card-body"><small>${tenant.stallCode.replace('B','Booth ')} · ${tnCategoryName(tenant.categoryId)}</small><h3>${tenant.brand}</h3><p>${tnText(tenant.tagline)}</p><b>${TN_LANG === 'en' ? 'View menu →' : 'Lihat menu →'}</b></div></a>`;
  }).join('') || `<p>${TN_LANG === 'en' ? 'No tenants found.' : 'Tenant tidak ditemukan.'}</p>`;
}
[search,category].forEach(control => control.addEventListener('input', renderDirectory));
renderDirectory();
