const CACHE = 'bird-census-v2';
const XLSX_URL = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
const LOCAL = ['./', './index.html', './manifest.webmanifest', './species.js', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(LOCAL);
    try { await c.put(XLSX_URL, await fetch(XLSX_URL, { mode: 'no-cors' })); } catch (_) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.url.includes('gsi.go.jp')) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(e.request);
      if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone());
      return res;
    } catch (_) {
      if (e.request.mode === 'navigate') return c.match('./index.html');
      throw _;
    }
  })());
});
