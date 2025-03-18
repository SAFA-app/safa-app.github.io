const CACHE_NAME = 'pwa-cache-v1';
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
          // Update the cache with new data
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });

        // If there's cached data, return it immediately (stale)
        // At the same time, fetch and update the cache in the background
        return cachedResponse || networkFetch;
      })
    );
  }
});

// Activate event (clear old cache)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
