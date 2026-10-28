const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

const currentLanguage = localStorage.getItem('tn_language') || 'id';
document.documentElement.lang = currentLanguage;

if (mainNav && !mainNav.querySelector('.language-toggle')) {
  const languageToggle = document.createElement('button');
  languageToggle.className = 'language-toggle';
  languageToggle.type = 'button';
  languageToggle.textContent = currentLanguage === 'id' ? 'EN' : 'ID';
  languageToggle.setAttribute('aria-label', currentLanguage === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia');
  languageToggle.addEventListener('click', () => {
    localStorage.setItem('tn_language', currentLanguage === 'id' ? 'en' : 'id');
    location.reload();
  });
  mainNav.insertBefore(languageToggle, mainNav.querySelector('.nav-cta'));
}

if (currentLanguage === 'en') {
  const translations = new Map([
    ['Acara', 'Events'], ['Tenant', 'Tenants'], ['Lokasi', 'Location'], ['Login', 'Sign in'],
    ['Gabung', 'Join'], ['Menu', 'Menu'], ['Beranda', 'Home'], ['Lihat tenant', 'Explore tenants'],
    ['Lihat denah', 'View map'], ['Ajukan tenant', 'Apply as tenant'], ['Tampilkan lainnya', 'Show more'],
    ['Semua', 'All'], ['Makanan', 'Food'], ['Minuman', 'Drinks'], ['Jajanan', 'Snacks']
  ]);
  document.querySelectorAll('a,button,label').forEach((element) => {
    const text = element.textContent.trim();
    if (translations.has(text)) element.textContent = translations.get(text);
  });
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
