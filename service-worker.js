// Service Worker pour PWA - Cache et Offline Support
const CACHE_NAME = 'prospect-app-v1';
const urlsToCache = [
  './',
  './prospect-app-pwa.html',
  './manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache failed:', err))
  );
});

// Activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone la réponse
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseClone = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseClone);
          });

        return response;
      })
      .catch(() => {
        // En cas d'erreur, retourner du cache
        return caches.match(event.request)
          .then(response => {
            return response || new Response('Offline - Veuillez vérifier votre connexion', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background Sync (optionnel)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-prospects') {
    event.waitUntil(
      // Synchroniser les données
      Promise.resolve()
    );
  }
});

console.log('Service Worker enregistré avec succès');
