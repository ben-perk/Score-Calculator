const CACHE_NAME = 'score-calculator-v1';
const urlsToCache = [
  '/Score-Calculator/',
  '/Score-Calculator/index.html',
  '/Score-Calculator/stylesheet.css',
  '/Score-Calculator/improved.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});