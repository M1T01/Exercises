const CACHE_NAME = 'gym-routine-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar peticiones (Estrategia Cache First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el cache si existe, si no, busca en la red
        return response || fetch(event.request);
      })
  );
});

// Limpiar caches antiguos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
