const CACHE_NAME = 'pwa-cache-v2';
const DATA_URLS = [
  'https://docs.google.com/spreadsheets/d/1ZuUVyBmIU_Ax5V7Iq-yCUQvN-tmF8RZEh1uhkT6HVFA/export?format=csv',
  'https://docs.google.com/spreadsheets/d/1FVN90zGMNJbKOiBJWCVdVH7UFI74yny4G-3vJBzwrEo/export?format=csv'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(DATA_URLS);
    })
  );
});

// Fetch event with Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  if (DATA_URLS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone()); // Update cache
            });
            return response;
          }
          return cachedResponse; // Return cached response if network fails
        });

        // Serve cached content if offline, but always fetch to update cache
        return cachedResponse || networkFetch;
      })
    );
  }
});



self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);  // Delete outdated caches
          }
        })
      );
    })
  );
});

