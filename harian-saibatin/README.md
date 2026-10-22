# Harian Saibatin — Portal Berita

## Menjalankan
1. Pasang Node.js 18+
2. `npm install`
3. `npm start` lalu buka http://localhost:3000

## Struktur
- `server.js`   : backend Express (REST API)
- `data/db.json`: data berita, breaking news, pelanggan
- `public/`     : frontend (index.html)

## API
| Metode | Rute | Keterangan |
|---|---|---|
| GET | /api/articles?category=&q=&sort=latest\|popular&limit= | Daftar berita |
| GET | /api/articles/:id | Detail berita (menambah jumlah baca) |
| GET | /api/categories, /api/breaking | Kategori, breaking news |
| POST | /api/subscribe | `{ "email": "..." }` |
| POST/PUT/DELETE | /api/articles(/:id) | Admin, header `x-api-key` |
| PUT | /api/breaking | Admin, `{ "text": "..." }` |

Kunci admin bawaan: `saibatin-admin`. Ganti dengan `ADMIN_KEY=rahasia npm start`.

## Gambar
Isi kolom `image` pada berita dengan URL gambar atau path lokal (mis. `/img/adat.jpg`, simpan di `public/img/`). Tanpa gambar, tampil latar gradien.

Contoh tambah berita:
curl -X POST localhost:3000/api/articles -H "Content-Type: application/json" -H "x-api-key: saibatin-admin" -d '{"title":"Judul","category":"Budaya","summary":"Ringkasan","image":"/img/adat.jpg"}'
