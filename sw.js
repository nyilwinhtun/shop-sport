const CACHE_NAME = 'sports-pos-v5';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache only same-origin files. A single failed third-party CDN request
    // must not prevent the Service Worker from installing.
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('sports-pos-') && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestURL = new URL(event.request.url);
  // Let Firebase and other external origins use their normal network requests.
  if (requestURL.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (event.request.mode === 'navigate') {
      try {
        const response = await fetch(event.request);
        if (response && response.ok) {
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        return (await cache.match(event.request)) ||
          (await cache.match('./index.html')) ||
          new Response('Offline: app page is not cached.', { status: 503, statusText: 'Service Unavailable' });
      }
    }

    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) return cachedResponse;
    try {
      const response = await fetch(event.request);
      if (response && response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      return (await cache.match(event.request)) ||
        new Response('Offline: resource is not cached.', { status: 503, statusText: 'Service Unavailable' });
    }
  })());
});
