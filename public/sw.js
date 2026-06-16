const CACHE_NAME = 'nucleus-pwa-cache-v1';
const ASSET_EXTENSIONS = ['.js', '.css', '.svg', '.png', '.jpg', '.woff2', '.json'];

// Install event - debug/pre-cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - caching assets dynamically, network-first for everything else
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Bypass caching for API requests entirely (must always communicate with backend)
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  // 2. Network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If it's a successful response, cache static files dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const isAsset = ASSET_EXTENSIONS.some(ext => url.pathname.endsWith(ext)) || url.pathname === '/';
          if (isAsset) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, serve from the cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cache, return index.html for navigation requests (SPA support)
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
