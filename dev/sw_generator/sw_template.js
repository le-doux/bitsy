/* 
SERVICE WORKER
*/

var cacheVersionId = "bitsy-cache-v7.9";

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(cacheVersionId).then(function(cache) {
			// new versions should install immediately
			self.skipWaiting();

			return cache.addAll(/*__CACHE_ITEMS__*/);
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

var isRefreshing = false;
self.addEventListener("controllerchange", function(event) {
	if (!isRefreshing) {
		// refresh the page when a new version finishes installing
		isRefreshing = true;
		window.location.reload();
	}
});