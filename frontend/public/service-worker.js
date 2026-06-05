const CACHE_NAME = 'digiequb-runtime-v1';
const ASSET_CACHE_NAME = 'digiequb-assets-v1';

const isSameOriginGet = (request) => (
    request.method === 'GET' && new URL(request.url).origin === self.location.origin
);

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter((key) => key.startsWith('digiequb-') && ![CACHE_NAME, ASSET_CACHE_NAME].includes(key))
                .map((key) => caches.delete(key))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (!isSameOriginGet(request) || request.url.includes('/api/')) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const response = await fetch(request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, response.clone());
                return response;
            } catch (error) {
                const cached = await caches.match(request);
                return cached || caches.match('/index.html');
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(ASSET_CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    })());
});
