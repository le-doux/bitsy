function Exporter() {


/* resource loading */
var resources = {};
function loadResource(url) {
	var client = new XMLHttpRequest();
	client.open('GET', './'+url);
	client.onreadystatechange = function() {
	  resources[url] = client.responseText;
	}
	client.send();
}

loadResource("exportTemplate.html");
loadResource("bitsy.js");
loadResource("font.js");
loadResource("dialog.js");


/* exporting */
function downloadFile(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.setAttribute('target', '_blank');

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function escapeSpecialCharacters(str) {
	str = str.replace(/\\/g, '\\\\');
	str = str.replace(/"/g, '\\"');
	return str;
}

function replaceTemplateMarker(template, marker, text) {
	var markerIndex = template.indexOf( marker );
	return template.substr( 0, markerIndex ) + text + template.substr( markerIndex + marker.length );
}

this.exportGame = function(gameData, title, pageColor, filename) {
	gameData = escapeSpecialCharacters( gameData ); //escape quotes and slashes
	gameData = gameData.split("\n").join("\\n"); //replace newlines with escaped newlines
	var html = resources["exportTemplate.html"].substr(); //copy template
	console.log(html);
	html = replaceTemplateMarker( html, "@@T", title );
	html = replaceTemplateMarker( html, "@@B", pageColor );
	html = replaceTemplateMarker( html, "@@F", resources["font.js"] );
	html = replaceTemplateMarker( html, "@@L", resources["dialog.js"] );
	html = replaceTemplateMarker( html, "@@E", resources["bitsy.js"] );
	html = replaceTemplateMarker( html, "@@D", gameData );
	console.log(html);
	downloadFile( filename, html );
}


/* importing */
function unescapeSpecialCharacters(str) {
	str = str.replace(/\\"/g, '"');
	str = str.replace(/\\\\/g, '\\');
	return str;
}

this.importGame = function( html ) {
	// find start of game data
	var i = html.indexOf("var exportedGameData");
	while ( html.charAt(i) != '"' ) {
		i++; // move to first quote
	}
	i++; // move past first quote

	// isolate game data
	var gameDataStr = "";
	var isEscapeChar = false;
	while ( html.charAt(i) != '"' || isEscapeChar ) {
		gameDataStr += html.charAt(i);
		isEscapeChar = html.charAt(i) == "\\";
		i++;
	}

	// replace special characters
	gameDataStr = gameDataStr.replace(/\\n/g, "\n"); //todo: move this into the method below
	gameDataStr = unescapeSpecialCharacters( gameDataStr );

	return gameDataStr;
}

} // Exporter()