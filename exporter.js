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
loadResource("exportStyleFixed.css");
loadResource("exportStyleFull.css");
loadResource("bitsy.js");
loadResource("font.js");
loadResource("dialog.js");
loadResource("script.js");
loadResource("color_util.js");


/* exporting */
function downloadFile(filename, text) {

	if( browserFeatures.blobURL ) {
		// new blob version
		var a = document.createElement('a');
		var blob = new Blob( [text] );
		a.download = filename;
		a.href = makeURL.createObjectURL(blob);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
	else {
		// old version
		var element = document.createElement('a');

		element.setAttribute('href', 'data:attachment/file;charset=utf-8,' + encodeURIComponent(text));

		element.setAttribute('download', filename);
		element.setAttribute('target', '_blank');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}
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

this.exportGame = function(gameData, title, pageColor, filename, isFixedSize, size) {
	var html = resources["exportTemplate.html"].substr(); //copy template
	// console.log(html);

	html = replaceTemplateMarker( html, "@@T", title );

	if( isFixedSize ) {
		html = replaceTemplateMarker( html, "@@C", resources["exportStyleFixed.css"] );
		html = replaceTemplateMarker( html, "@@Z", size + "px" );
	}
	else {
		html = replaceTemplateMarker( html, "@@C", resources["exportStyleFull.css"] );
	}

	html = replaceTemplateMarker( html, "@@B", pageColor );

	html = replaceTemplateMarker( html, "@@U", resources["color_util.js"] );
	html = replaceTemplateMarker( html, "@@F", resources["font.js"] );
	html = replaceTemplateMarker( html, "@@S", resources["script.js"] );
	html = replaceTemplateMarker( html, "@@L", resources["dialog.js"] );
	html = replaceTemplateMarker( html, "@@E", resources["bitsy.js"] );

	html = replaceTemplateMarker( html, "@@D", gameData );

	// console.log(html);

	downloadFile( filename, html );
}


/* importing */
function unescapeSpecialCharacters(str) {
	str = str.replace(/\\"/g, '"');
	str = str.replace(/\\\\/g, '\\');
	return str;
}

this.importGame = function( html ) {
	// IMPORT : old style
	// find start of game data
	var i = html.indexOf("var exportedGameData");
	if(i > -1) {
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

	// IMPORT : new style
	var scriptStart = '<script type="bitsyGameData" id="exportedGameData">\n';
	var scriptEnd = '</script>\n'
	i = html.indexOf( scriptStart );
	if(i > -1) {
		i = i + scriptStart.length;
		var gameStr = "";
		var lineStr = "";
		var isDone = false;
		while(!isDone && i < html.length) {

			lineStr += html.charAt(i);

			if(html.charAt(i) === "\n") {
				if(lineStr === scriptEnd) {
					isDone = true;
				}
				else {
					gameStr += lineStr;
					lineStr = "";
				}
			}

			i++;
		}
		return gameStr;
	}

	console.log("FAIL!!!!");

	return "";
}

} // Exporter()