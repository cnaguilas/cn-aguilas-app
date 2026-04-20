// Service Worker — CN Águilas PWA
// ⚠️ Cambia el número de versión cada vez que subas una actualización a GitHub
const CACHE = 'cn-aguilas-v2';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./index.html']).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Firebase y Google APIs siempre van a la red (datos en tiempo real)
  if (
    url.includes('firebasedatabase') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('accounts.google.com') ||
    url.includes('fonts.googleapis.com')
  ) {
    return;
  }

  // Para el resto: red primero, caché como fallback
  e.respondWith(
    fetch(e.request).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
