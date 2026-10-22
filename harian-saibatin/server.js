// Backend Harian Saibatin: Express + penyimpanan JSON (data/db.json)
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'saibatin-admin'; // ganti di produksi!
const DB = path.join(__dirname, 'data', 'db.json');
const CATEGORIES = ['Politik', 'Ekonomi', 'Budaya', 'Nusantara', 'Opini'];

const load = () => JSON.parse(fs.readFileSync(DB, 'utf8'));
const save = (d) => fs.writeFileSync(DB, JSON.stringify(d, null, 2));
const admin = (req, res, next) =>
  req.get('x-api-key') === ADMIN_KEY ? next() : res.status(401).json({ error: 'API key tidak valid' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/categories', (_, res) => res.json(CATEGORIES));

app.get('/api/breaking', (_, res) => res.json(load().breaking));

// ?category=Politik &q=kata &sort=latest|popular &limit=5
app.get('/api/articles', (req, res) => {
  const { category, q, sort = 'latest', limit } = req.query;
  let list = load().articles;
  if (category) list = list.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((a) => (a.title + a.summary + a.body).toLowerCase().includes(s));
  }
  list = [...list].sort((a, b) =>
    sort === 'popular' ? b.views - a.views : new Date(b.publishedAt) - new Date(a.publishedAt));
  if (limit) list = list.slice(0, Number(limit));
  res.json(list);
});

app.get('/api/articles/:id', (req, res) => {
  const db = load();
  const a = db.articles.find((x) => x.id === Number(req.params.id));
  if (!a) return res.status(404).json({ error: 'Berita tidak ditemukan' });
  a.views += 1;
  save(db);
  res.json(a);
});

// --- Admin: kelola berita (kirim header x-api-key) ---
app.post('/api/articles', admin, (req, res) => {
  const { title, summary, body, category, image = '', featured = false } = req.body;
  if (!title || !category || !CATEGORIES.includes(category))
    return res.status(400).json({ error: 'title dan category (valid) wajib diisi' });
  const db = load();
  const art = {
    id: Math.max(0, ...db.articles.map((a) => a.id)) + 1,
    title, summary: summary || '', body: body || '', category, image, featured,
    views: 0, publishedAt: new Date().toISOString(),
  };
  db.articles.push(art);
  save(db);
  res.status(201).json(art);
});

app.put('/api/articles/:id', admin, (req, res) => {
  const db = load();
  const i = db.articles.findIndex((x) => x.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ error: 'Berita tidak ditemukan' });
  db.articles[i] = { ...db.articles[i], ...req.body, id: db.articles[i].id };
  save(db);
  res.json(db.articles[i]);
});

app.delete('/api/articles/:id', admin, (req, res) => {
  const db = load();
  db.articles = db.articles.filter((x) => x.id !== Number(req.params.id));
  save(db);
  res.status(204).end();
});

app.put('/api/breaking', admin, (req, res) => {
  const db = load();
  db.breaking = String(req.body.text || '');
  save(db);
  res.json({ text: db.breaking });
});

// --- Langganan ---
app.post('/api/subscribe', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return res.status(400).json({ error: 'Format email tidak valid' });
  const db = load();
  if (!db.subscribers.includes(email)) db.subscribers.push(email);
  save(db);
  res.status(201).json({ message: 'Terima kasih, Anda sudah berlangganan.' });
});

app.listen(PORT, () => console.log(`Harian Saibatin berjalan di http://localhost:${PORT}`));
