// ============================================================
//  Service Worker — sw.js
//  Strategi: Cache First → bisa dipakai offline setelah install
// ============================================================

const CACHE_NAME = 'kalkulator-wa-v1';

// File-file yang di-cache saat install SW
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './apps.js',
    './vue.js',
    './manifest.json',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/img/whatsapp.jpg'
];

// ─── Install: Cache semua aset statis ───────────────────────
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching assets');
            // addAll bisa gagal jika salah satu file tidak ada;
            // gunakan Promise.allSettled agar tidak memblokir install
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url).catch(e => {
                    console.warn('[SW] Gagal cache:', url, e);
                }))
            );
        })
    );
    self.skipWaiting(); // Langsung aktif tanpa tunggu tab lama ditutup
});

// ─── Activate: Hapus cache lama ─────────────────────────────
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Menghapus cache lama:', key);
                        return caches.delete(key);
                    })
            )
        )
    );
    self.clients.claim(); // Ambil alih semua tab yang terbuka
});

// ─── Fetch: Cache First, fallback ke network ────────────────
self.addEventListener('fetch', (event) => {
    // Hanya handle GET request
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Kembalikan dari cache, tapi update di background (stale-while-revalidate)
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                }).catch(() => {/* offline, tetap pakai cache */});

                return cachedResponse;
            }

            // Tidak ada di cache → ambil dari network
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                    return networkResponse;
                }
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            }).catch(() => {
                // Offline dan tidak ada cache → kembalikan halaman utama (fallback)
                return caches.match('./index.html');
            });
        })
    );
});
