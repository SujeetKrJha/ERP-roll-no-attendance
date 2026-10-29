const CACHE_NAME = 'erp-attendance-cache-v3';

// All local and external assets to pre-cache
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest1.json',
  './icon.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install Event: Cache all assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use no-cors for external CDNs during pre-caching
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return fetch(url, { mode: 'no-cors' }).then((response) => {
            return cache.put(url, response);
          }).catch((err) => console.log('Failed to cache:', url, err));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear old cache versions
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

// Fetch Event: Cache First, Fallback to Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached asset instantly
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache dynamic responses
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback to index.html on navigation offline
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
