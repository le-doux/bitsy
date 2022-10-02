/* ABOUT / DOCUMENTATION TOOL */
var aboutFlags = {
	isLocalhost: false, // flag for local debugging with a server running
};

function getDocsRoot() {
	if (aboutFlags.isLocalhost) {
		return "http://localhost:3000/docs/";
	}

	// remove "index.html"
	var root = window.location.href.replace(/index\.html/, '');

	// add separator if necessary
	if (root[root.length - 1] != "/") {
		root += "/";
	}

	// add docs sub-directory
	root += "docs/";

	return root;
}

function setAboutPage(pagePath) {
	var docsFrame = document.getElementById('docsFrame');
	var url = new URL(pagePath.includes('.html') ? pagePath : `${pagePath}/index.html`, getDocsRoot());
	var src = url.href;
	docsFrame.src = src;
}

function initAbout() {
	setAboutPage(".");
}

function showAbout(pagePath, insertNextToId) {
	setAboutPage(pagePath);
	showPanel("aboutPanel", insertNextToId);
}

function aboutOpenTab() {
	var docsFrame = document.getElementById('docsFrame');

	// use the `src` attribute of the docs frame as the fallback value for the page url
	// in case we're unable to access the actual current location of the frame:
	// this will happen if we try to make a cross-origin request, for example:
	// - if we're testing locally using localhost
	// - OR if the docs link to a location outside of the bitsy editor's domain
	var docsPageUrl = docsFrame.src;

	try {
		// attempt to get the page URL from the docs frame location, since this will be more accurate:
		// for example: if the user clicks links within the docs frame *this* value will update to
		// contain the new location of the frame, but the `src` attribute will *not* update
		docsPageUrl = docsFrame.contentWindow.location.href;
	}
	catch (err) {
		// todo : use bitsyLog()?
		console.log("could not read docs page location, falling back to src: " + docsPageUrl, err);
	}

	window.open(docsPageUrl);
}