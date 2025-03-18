const CACHE_NAME = 'pwa-cache-v2';
const DATA_URLS = [
  'https://docs.google.com/spreadsheets/d/1ZuUVyBmIU_Ax5V7Iq-yCUQvN-tmF8RZEh1uhkT6HVFA/export?format=csv',
  'https://docs.google.com/spreadsheets/d/1FVN90zGMNJbKOiBJWCVdVH7UFI74yny4G-3vJBzwrEo/export?format=csv'
];

// Cache image URLs dynamically
const IMAGE_CACHE_NAME = 'pwa-image-cache-v2';

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(DATA_URLS);
    }),
    caches.open(IMAGE_CACHE_NAME) // Open the image cache as well
  );
});

// Fetch event with Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  // Cache Data URLs (CSV files) as usual
  if (DATA_URLS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone()); // Update cache for data
            });
            return response;
          }
          return cachedResponse; // Return cached response if network fails
        });
        return cachedResponse || networkFetch;
      })
    );
  }

  // Cache image requests
  if (event.request.url.endsWith('.jpg') || event.request.url.endsWith('.png') || event.request.url.endsWith('.jpeg') || event.request.url.endsWith('.gif') || event.request.url.endsWith('.webp')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone()); // Cache image response
            });
            return response;
          }
          return cachedResponse; // Return cached response if network fails
        });
        return cachedResponse || networkFetch;
      })
    );
  }
});

// Activate event (clean up old caches)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, IMAGE_CACHE_NAME]; // Add image cache to whitelist
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
