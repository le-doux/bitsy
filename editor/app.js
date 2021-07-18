if ("serviceWorker" in navigator) {
	console.log("service workers exist :)");

	navigator.serviceWorker.register("sw.js").then(function (reg){
		if (reg.installing) {
			console.log("service worker installing...");
		}
		else if (reg.waiting) {
			console.log("service worker installed!");
		}
		else if (reg.active) {
			console.log("service worker active :)");
		}
	}).catch(function(error) {
		console.log("service worker registration failed :(");
		console.log("service worker error: " + error);
	});
}