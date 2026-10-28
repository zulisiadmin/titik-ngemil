const tenants = TN.tenants.map((tenant, index) => ({
  no: tenant.stallCode.replace('B', ''), slug: tenant.slug, name: tenant.brand,
  desc: tnText(tenant.tagline), cat: tenant.categoryId, image: tnTenantImage(tenant, index)
}));

const tenantList = document.querySelector("#tenant-list");
const showMore = document.querySelector("#show-more");
let expanded = false;
let activeFilter = "all";

function renderTenants() {
  const filtered = tenants.filter(t => activeFilter === "all" || t.cat === activeFilter);
  const visible = expanded || activeFilter !== "all" ? filtered : filtered.slice(0, 5);
  tenantList.innerHTML = visible.map(t => `
    <a class="tenant-row${t.image ? " has-image" : ""}" href="${t.slug ? `tenant-detail.html?slug=${t.slug}` : "menu.html"}">
      <span class="tenant-number">${t.no}</span>
      ${t.image ? `<img class="tenant-thumb" src="${t.image}" alt="Booth ${t.name}" loading="lazy">` : ""}
      <div><h3>${t.name}</h3><p>${t.desc}</p></div>
      <b>${t.cat}</b>
    </a>
  `).join("");
  showMore.hidden = activeFilter !== "all" || filtered.length <= 5;
  showMore.textContent = expanded ? "Tampilkan lebih sedikit" : "Tampilkan lainnya";
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("is-active"));
    button.classList.add("is-active");
    activeFilter = button.dataset.filter;
    expanded = false;
    renderTenants();
  });
});

showMore.addEventListener("click", () => {
  expanded = !expanded;
  renderTenants();
});

const mapGrid = document.querySelector("#map-grid");
const boothTenants = Object.fromEntries(tenants.map(tenant => [Number(tenant.no), tenant]));
mapGrid.innerHTML = Array.from({ length: 24 }, (_, index) => {
  const number = index + 1;
  const tenant = boothTenants[number];
  const busy = [3, 5, 9, 17, 22].includes(number) ? " is-busy" : "";
  const occupied = tenant ? " is-occupied" : "";
  const boothContent = `
    <span class="booth-pin" aria-hidden="true"></span>
    <strong>${String(number).padStart(2, "0")}</strong>
    <small>${tenant ? tenant.name : "Tersedia"}</small>
  `;

  if (tenant?.slug) {
    return `<a class="booth${busy}${occupied}" href="tenant-detail.html?slug=${tenant.slug}" aria-label="Booth ${number}, ${tenant.name}. Buka detail tenant">${boothContent}</a>`;
  }

  return `<div class="booth${busy}${occupied}" title="Booth ${number}${tenant ? ` — ${tenant.name}` : " — tersedia"}">${boothContent}</div>`;
}).join("");

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));

renderTenants();
