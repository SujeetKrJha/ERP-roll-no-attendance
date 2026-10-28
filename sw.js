const CACHE_NAME = 'erp-attendance-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './icon-512.png'
];

// Install Service Worker and cache files locally
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Worker and clear outdated cache engines
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache Interceptor: Network first fallback to Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.status === 200) {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return response;
      })
      .catch(() => caches.match(e.request).then((cachedResponse) => {
        // If network falls off, serve the cached asset or redirect back home
        return cachedResponse || caches.match('./index.html');
      }))
  );
});
