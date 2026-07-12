const CACHE_NAME = 'memocards-v1';
const ASSETS = ['./','./memocards.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-512-maskable.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).catch(()=>cached)));
});
