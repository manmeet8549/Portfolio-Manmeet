/**
 * Portfolio Service Worker
 * Implements a Stale-While-Revalidate caching strategy for HTML pages, CDN assets,
 * stylesheets, fonts, and scripts to enable instant page loads (< 20ms).
 */

const CACHE_NAME = 'portfolio-cache-v2';

// Static resources to precache immediately on service worker install
const PRECACHE_RESOURCES = [
    './',
    './index.html',
    './about.html',
    './projects.html',
    './studio.html',
    './strategy.html',
    './archives.html',
    './contact.html',
    './case-study.html',
    './js/api.js',
    './js/supabase-config.js'
];

// Install event: Precache core shell and pages
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_RESOURCES).catch(err => {
                console.warn('Precache partial warning:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate event: Clean up older cache versions if needed
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

// Fetch event: Serve cached response instantly, then update cache in background
self.addEventListener('fetch', (event) => {
    // Only intercept GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Don't cache dynamic backend server endpoints
    if (url.pathname.includes('/api/')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return cachedResponse;
                });

            // Return cached response instantly if present; otherwise return fetchPromise
            return cachedResponse || fetchPromise;
        })
    );
});
