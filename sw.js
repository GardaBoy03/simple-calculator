// ============================================================
//  Service Worker — sw.js  v2
//  FIX: cache version naik agar SW lama terhapus bersih
// ============================================================

const CACHE_NAME = 'kalkulator-wa-v2';

const ASSETS_TO_CACHE = [
    '/index.html',
    '/style.css',
    '/apps.js',
    '/vue.js',
    '/manifest.json'
];

// ─── Install ────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache satu per satu; jika gagal (file tidak ada) tidak memblokir
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url =>
                    cache.add(url).catch(e => console.warn('[SW] Skip cache:', url, e.message))
                )
            );
        })
    );
    // Aktif langsung tanpa tunggu tab lama
    self.skipWaiting();
});

// ─── Activate: buang semua cache versi lama ─────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => {
                    console.log('[SW] Hapus cache lama:', k);
                    return caches.delete(k);
                })
            )
        ).then(() => self.clients.claim())
    );
});

// ─── Fetch: Network first → fallback cache ──────────────────
// Strategi network-first lebih aman: pastikan selalu buka versi terbaru,
// fallback ke cache kalau offline.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Abaikan request ke chrome-extension atau non-http
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then(networkRes => {
                // Simpan ke cache jika response valid
                if (networkRes && networkRes.status === 200 && networkRes.type !== 'opaque') {
                    const clone = networkRes.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return networkRes;
            })
            .catch(() =>
                // Offline → ambil dari cache; fallback ke index.html
                caches.match(event.request).then(cached =>
                    cached || caches.match('/index.html')
                )
            )
    );
});
