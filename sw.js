/* Brew Bar service worker.
   App files: network first (bypassing the HTTP cache) so updates show on the next open; cached copy when offline.
   Fonts: cache first. GitHub API: never touched. */
const VERSION = 'brewbar-v11';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('github.com') || url.hostname.endsWith('githubusercontent.com')) return;
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(VERSION);
      try {
        const r = await fetch(e.request, { cache: 'no-cache' });
        if (r.ok) c.put(e.request, r.clone());
        return r;
      } catch (err) {
        return (await c.match(e.request, { ignoreSearch: true })) || (await c.match('index.html')) || Response.error();
      }
    })());
    return;
  }
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request);
    if (hit) return hit;
    const r = await fetch(e.request); if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r;
  }));
});
