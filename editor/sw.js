/* 
SERVICE WORKER
*/

var cacheVersionId = "bitsy-cache-v1";

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(cacheVersionId).then(function(cache) {
			return cache.addAll([
				"./manifest.json",
				"./index.html",
				"./app.js",
				// todo : add more!
			]);
		})
	);
});

self.addEventListener("fetch", function(event) {
	// if the object exists in the cache, return it, otherwise try the network
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});