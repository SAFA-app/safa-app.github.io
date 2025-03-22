const CACHE_NAME = 'safa-cache-v2';
const URLs_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/items.html',
    '/pages/single-item.html',
];

const EXCLUDE_FROM_CACHE = [
    "https://docs.google.com/spreadsheets/d/1ZuUVyBmIU_Ax5V7Iq-yCUQvN-tmF8RZEh1uhkT6HVFA/export?format=csv",
    "https://docs.google.com/spreadsheets/d/1FVN90zGMNJbKOiBJWCVdVH7UFI74yny4G-3vJBzwrEo/export?format=csv"
];

// Install event to cache the specific pages
self.addEventListener('install', (event) => {
    console.log('Installing service worker and caching URLs:', URLs_TO_CACHE);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLs_TO_CACHE);
        })
    );
});

// Activate event to clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event to serve cached resources
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip caching for excluded URLs
    if (EXCLUDE_FROM_CACHE.includes(url.href)) {
        event.respondWith(fetch(event.request)); // Fetch directly from network
        return;
    }

    // Serve cached responses for URLs_TO_CACHE
    if (URLs_TO_CACHE.includes(url.pathname)) {
        event.respondWith(
            caches.match(url.pathname).then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
        return;
    }

    // For all other requests, fetch from the network
    event.respondWith(fetch(event.request));
});