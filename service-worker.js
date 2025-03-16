const CACHE_NAME = 'pwa-cache-v1';
const DATA_URL = 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv';
const CONFIG_URL = 'config.json';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        DATA_URL,
        CONFIG_URL,
        '/', // Cache the root page
        '/index.html', // Cache the main HTML file
        '/app.js', // Cache the JavaScript file
        '/manifest.json', // Cache the manifest
        '/style.css', // Cache the CSS file if exists
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached response if available
      }
      return fetch(event.request).catch(() => {
        // Fallback for offline requests
        return caches.match('/index.html');
      });
    })
  );
});