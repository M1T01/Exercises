/* Service Worker · Rutina Gym Pro */
const CACHE = 'gym-pro-v1.1';

const PRECACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Cache-first para videos e imágenes locales
  if (url.pathname.includes('/videos/') || url.pathname.includes('/images/')) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        if (hit) return hit;
        return fetch(e.request).then(res => {
          // Solo guardamos en caché si la imagen/video realmente cargó con éxito
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        }); 
        // Eliminé el catch que devolvía 'index.html', ya que no tiene sentido devolver un HTML a una etiqueta <img>
      })
    );
    return;
  }

  // Network-first para el resto (con fallback a cache)
  e.respondWith(
    fetch(e.request).then(res => {
      // Evitar guardar respuestas fallidas en caché
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
