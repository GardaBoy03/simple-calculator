const CACHE_NAME = 'wa-calc-v3'; // Naikkan versi ke v3
const assets = [
  './',
  './index.html',
  './apps.js',
  './style.css'
];

// Install & simpan aset utama ke cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    }).then(() => self.skipWaiting()) // Paksa SW baru langsung aktif
  );
});

// Bersihkan cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategi Pintar: Coba ambil dari internet dulu, kalau offline baru pakai cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Jika berhasil, kloning dan simpan ke cache
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(e.request).then(cachedResponse => cachedResponse))
  );
});
