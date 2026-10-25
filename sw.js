/* Service worker for Yu-Gi-Oh! Binder: offline app shell + opportunistic art cache.
   The version below is a hash of the app files; changing any file produces a new cache. */
const APP = 'yugioh-binder';
const VERSION = '2709efb05c';
const SHELL = `${APP}-shell-${VERSION}`;
const ART = `${APP}-art-v1`;
const ART_HOSTS = ["images.ygoprodeck.com"];
const ART_MAX = 1500;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith(`${APP}-shell-`) && k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // App shell: cache first (fully offline). Updates arrive as a new service worker version.
    if (req.mode === 'navigate') { e.respondWith(caches.match('./index.html', { cacheName: SHELL }).then(r => r || fetch(req))); return; }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
    return;
  }
  if (ART_HOSTS.includes(url.hostname)) e.respondWith(artFirst(req));
  // Everything else (e.g. card-info lookups) goes straight to the network.
});

async function artFirst(req) {
  const cache = await caches.open(ART);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === 'opaque') { cache.put(req, res.clone()).then(() => trim(cache)).catch(() => {}); }
    return res;
  } catch (err) { return Response.error(); }
}
async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - ART_MAX; i++) await cache.delete(keys[i]);
}
