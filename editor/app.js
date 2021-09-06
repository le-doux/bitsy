// service worker turned off for now
// if ("serviceWorker" in navigator) {
// 	console.log("service workers exist :)");

// 	var isRefreshing = false;
// 	navigator.serviceWorker.addEventListener("controllerchange", function(event) {
// 		if (!isRefreshing) {
// 			console.log("force refresh to update service worker");

// 			// refresh the page when a new version finishes installing
// 			isRefreshing = true;
// 			window.location.reload();
// 		}
// 	});

// 	navigator.serviceWorker.register("sw.js").then(function (reg){
// 		if (reg.installing) {
// 			console.log("service worker installing...");
// 		}
// 		else if (reg.waiting) {
// 			console.log("service worker installed!");
// 		}
// 		else if (reg.active) {
// 			console.log("service worker active :)");
// 		}
// 	}).catch(function(error) {
// 		console.log("service worker registration failed :(");
// 		console.log("service worker error: " + error);
// 	});
// }