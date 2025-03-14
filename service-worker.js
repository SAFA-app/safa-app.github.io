javascript
const CACHE_NAME = 'pwa-cache-v1';
const DATA_URL = 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv'; // Replace with your CSV file URL
const CONFIG_URL = 'config.json'; // Replace with your configuration file URL

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([DATA_URL, CONFIG_URL]); // Pre-cache CSV and config
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached response if available
      }
      return fetch(event.request); // Otherwise fetch from network
    })
  );
});
