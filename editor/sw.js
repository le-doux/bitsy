/* 
SERVICE WORKER
*/

var cacheVersionId = "bitsy-cache-v1";

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(cacheVersionId).then(function(cache) {
			return cache.addAll([
				"./app.js",
				"./font/bitsy_ascii_small.ttf",
				"./font/google-material-icons.woff2",
				"./font/google-nunito-latin.woff2",
				"./font/google-nunito-latinext.woff2",
				"./font/google-nunito-vietnamese.woff2",
				"./icons/bitsy.hqx",
				"./icons/bitsy.icns",
				"./icons/bitsy.ico",
				"./icons/bitsy.png",
				"./image/bitsy-itch-cover.png",
				"./image/bitsy.icns",
				"./image/cat.png",
				"./image/cat.svg",
				"./image/cat2.png",
				"./image/cat5.png",
				"./image/down_arrow.svg",
				"./index.html",
				"./manifest.json",
				"./script/color_picker.js",
				"./script/dialog_editor.js",
				"./script/editor.js",
				"./script/engine/bitsy.js",
				"./script/engine/color_util.js",
				"./script/engine/dialog.js",
				"./script/engine/font.js",
				"./script/engine/renderer.js",
				"./script/engine/script.js",
				"./script/engine/transition.js",
				"./script/event_manager.js",
				"./script/exporter.js",
				"./script/find.js",
				"./script/generated/resources.js",
				"./script/gif.js",
				"./script/icons.js",
				"./script/inventory.js",
				"./script/localization.js",
				"./script/menu.js",
				"./script/paint.js",
				"./script/palette.js",
				"./script/room.js",
				"./script/room_markers.js",
				"./script/store.js",
				"./script/thumbnail.js",
				"./script/util.js",
				"./style/aboutToolStyle.css",
				"./style/bitsyEditorStyle.css",
				"./style/colorsToolStyle.css",
				"./style/dataToolStyle.css",
				"./style/dialogToolStyle.css",
				"./style/exitsToolStyle.css",
				"./style/gifToolStyle.css",
				"./style/googleNunito.css",
				"./style/paintToolStyle.css",
				"./style/settingsToolStyle.css",
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