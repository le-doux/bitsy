/* 
SERVICE WORKER
*/

var cacheVersionId = "bitsy-cache-v7.9.5";

// NOTE: turning off service worker until I can figure out how to get them to update properly
// self destroying service worker from: https://github.com/NekR/self-destroying-sw
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  self.registration.unregister()
    .then(function() {
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url))
    });
});