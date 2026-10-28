const CACHE_NAME = 'sports-pos-v6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache available shell files resiliently so 404 does not crash service worker installation
    try {
      await cache.addAll(APP_SHELL);
    } catch (err) {
      console.warn('cache.addAll failed, caching files individually:', err);
      for (const url of APP_SHELL) {
        try {
          const res = await fetch(url);
          if (res && res.ok) await cache.put(url, res);
        } catch (e) {}
      }
    }
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
