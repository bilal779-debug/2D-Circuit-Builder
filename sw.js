const CACHE_VERSION = 'budget-tracker-v2'; // Nayi update push karte waqt is number ko change karein
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Install Event: Skip waiting to immediately install the new service worker
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Event: Clear old caches and claim clients immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_VERSION) {
                        console.log('Clearing Old Cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Network-First strategy for HTML (guarantees latest GitHub version), Cache-First for others
self.addEventListener('fetch', event => {
    // Sirf GET requests handle karein
    if (event.request.method !== 'GET') return;

    // Navigation (HTML pages) ke liye pehle Network, phir Cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_VERSION).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                // Agar internet nahi hai toh offline cache return karo
                return caches.match(event.request).then(cachedResponse => {
                    return cachedResponse || caches.match('./index.html');
                });
            })
        );
    } else {
        // Baqi assets (CSS, JS, Fonts) ke liye Cache-First, phir Network
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_VERSION).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});
