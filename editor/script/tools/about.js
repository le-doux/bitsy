/* ABOUT / DOCUMENTATION TOOL */

// todo : only valid for development - need a real root later
var docsRoot = "http://localhost:3000/";

function initAbout() {
	var docsFrame = document.getElementById('docsFrame');
	docsFrame.src = docsRoot;
}

function showAbout(pagePath, insertNextToId) {
	var docsFrame = document.getElementById('docsFrame');
	docsFrame.src = docsRoot + pagePath;
	showPanel("aboutPanel", insertNextToId);
}