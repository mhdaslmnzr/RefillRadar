const CACHE_NAME = 'refillradar-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/pwa.png',
  '/logo.png',
  'https://fonts.googleapis.com/css?family=Poppins:400,600,700,900&display=swap',
  'https://fonts.googleapis.com/css2?family=Waterfall&display=swap'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/pwa.png');
        }
      });
    })
  );
}); 