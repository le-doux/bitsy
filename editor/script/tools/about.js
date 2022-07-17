/* ABOUT / DOCUMENTATION TOOL */

// todo : only valid for development - need a real root later
var docsRoot = "http://localhost:3000/";

var isUpdatingHistory = true;
var aboutHistory = [];
var aboutHistoryIndex = -1;

function setAboutPage(pagePath) {
	var docsFrame = document.getElementById('docsFrame');
	docsFrame.src = docsRoot + pagePath;
}

function onAboutLoad() {
	// update history
	var docsFrame = document.getElementById('docsFrame');
	var url = docsFrame.src;

	if (isUpdatingHistory && url.length > 0) {
		// track history
		if (aboutHistoryIndex >= 0 && aboutHistoryIndex < (aboutHistory.length - 1)) {
			aboutHistory.splice(aboutHistoryIndex + 1);
		}
		aboutHistory.push(url);
		aboutHistoryIndex = (aboutHistory.length - 1);
	}

	isUpdatingHistory = true;
}

function initAbout() {
	setAboutPage("");
}

function showAbout(pagePath, insertNextToId) {
	setAboutPage(pagePath);
	showPanel("aboutPanel", insertNextToId);
}

function aboutBack() {
	if (aboutHistory.length <= 0) {
		return;
	}

	aboutHistoryIndex = Math.max(0, aboutHistoryIndex - 1);

	isUpdatingHistory = false;
	var docsFrame = document.getElementById('docsFrame');
	docsFrame.src = aboutHistory[aboutHistoryIndex];
}

function aboutForward() {
	if (aboutHistory.length <= 0) {
		return;
	}

	aboutHistoryIndex = Math.min(aboutHistory.length - 1, aboutHistoryIndex + 1);

	isUpdatingHistory = false;
	var docsFrame = document.getElementById('docsFrame');
	docsFrame.src = aboutHistory[aboutHistoryIndex];
}

// todo : this doesn't work if the user navigates *within* the iframe
function aboutOpenTab() {
	var docsFrame = document.getElementById('docsFrame');
	window.open(docsFrame.src);
}