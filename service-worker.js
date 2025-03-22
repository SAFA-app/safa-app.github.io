const CACHE_NAME = 'safa-cache-v3';
const EXCLUDE_FROM_CACHE = [
    "https://docs.google.com/spreadsheets/d/1ZuUVyBmIU_Ax5V7Iq-yCUQvN-tmF8RZEh1uhkT6HVFA/export?format=csv",
    "https://docs.google.com/spreadsheets/d/1FVN90zGMNJbKOiBJWCVdVH7UFI74yny4G-3vJBzwrEo/export?format=csv"
];

// Install event to cache the pages and assets
self.addEventListener('install', (event) => {
    console.log('Installing service worker and caching necessary URLs');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            const urlsToCache = [
                '/',
                '/index.html',
                '/pages/items.html',
                '/pages/single-item.html',
                '/styles.css',
                '/main.js',
                '/images/logoSAFA.png',
                'js/index.js',
                'js/items.js',
                'js/single-item.js',
            ];

            return Promise.all(
                urlsToCache.map((url) =>
                    cache.add(url).catch((error) => {
                        console.error(`Failed to cache ${url}:`, error);
                    })
                )
            );
        })
    );
});

// Activate event to clean up old caches
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

// Fetch event to serve cached resources and cache new ones
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Remove the query parameters from the URL to normalize it
    const urlWithoutParams = url.origin + url.pathname;

    // Skip caching for excluded URLs
    if (EXCLUDE_FROM_CACHE.includes(url.href)) {
        event.respondWith(fetch(event.request)); // Fetch directly from network
        return;
    }

    // Cache the page without URL parameters
    event.respondWith(
        caches.match(urlWithoutParams).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Return cached response if available
            }

            // Fetch from network if not cached
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clonedResponse = networkResponse.clone(); // Clone the response for caching
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(urlWithoutParams, clonedResponse); // Cache the normalized URL
                    });
                }
                return networkResponse; // Return the original network response
            });
        })
    );
});
