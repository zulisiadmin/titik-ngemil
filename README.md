# Titik Ngemil V2

Website publik Titik Ngemil dengan tampilan editorial-modern, katalog 24 tenant, 71 menu, denah booth, informasi kunjungan, dan pendaftaran tenant.

## Menjalankan

```bash
node server.mjs
```

Lalu buka `http://localhost:8790`.

## Arah visual

- Warna utama: `#005070`, `#CB9C57`, dan putih.
- Tipografi: Fraunces untuk heading dan DM Sans untuk isi.
- Radius kecil, garis tegas, dan layout editorial agar tidak terasa seperti template AI.

## Deployment

Setiap push ke branch `main` diterbitkan otomatis melalui GitHub Pages menggunakan workflow di `.github/workflows/pages.yml`.

Backend pendaftaran dan login berjalan di Cloudflare Worker dengan database D1. Deploy API dengan:

```bash
npm install
npm run deploy:api
```
