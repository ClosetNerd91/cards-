/* Service worker for Yu-Gi-Oh! Binder: offline app shell + opportunistic art cache + OCR engine cache (scan feature).
   The version below is a hash of the app files; changing any file produces a new cache. */
const APP = 'yugioh-binder';
const VERSION = '1b870cdf22';
const SHELL = `${APP}-shell-${VERSION}`;
const ART = `${APP}-art-v1`;
const OCR = `${APP}-ocr-v1`;
const ART_HOSTS = ["images.ygoprodeck.com"];
const ART_MAX = 1500;
/* Scan feature: the OCR engine (Tesseract.js, its WASM core and English language data) is downloaded from the CDN
   only the first time a scan is opened, then served from this cache so scanning keeps working offline. */
const OCR_PREFIXES = ["https://cdn.jsdelivr.net/npm/tesseract.js@", "https://cdn.jsdelivr.net/npm/tesseract.js-core@", "https://cdn.jsdelivr.net/npm/@tesseract.js-data/"];
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
  if (ART_HOSTS.includes(url.hostname)) { e.respondWith(artFirst(req)); return; }
  if (OCR_PREFIXES.some(p => req.url.startsWith(p))) { e.respondWith(ocrFirst(req)); return; }
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
async function ocrFirst(req) {   // versioned CDN URLs never change, so cache-first is safe
  const cache = await caches.open(OCR);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) await cache.put(req.url, res.clone()).catch(() => {});
  return res;
}
async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - ART_MAX; i++) await cache.delete(keys[i]);
}
