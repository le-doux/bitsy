function Exporter() {

/* exporting */
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
	var html = Resources["exportTemplate.html"].substr(); //copy template
	// bitsyLog(html, "editor");

	html = replaceTemplateMarker( html, "@@T", title );

	if( isFixedSize ) {
		html = replaceTemplateMarker( html, "@@C", Resources["exportStyleFixed.css"] );
		html = replaceTemplateMarker( html, "@@Z", size + "px" );
	}
	else {
		html = replaceTemplateMarker( html, "@@C", Resources["exportStyleFull.css"] );
	}

	html = replaceTemplateMarker( html, "@@B", pageColor );

	html = replaceTemplateMarker( html, "@@I", Resources["input.js"] );
	html = replaceTemplateMarker( html, "@@P", Resources["soundchip.js"] );
	html = replaceTemplateMarker( html, "@@G", Resources["graphics.js"] );
	html = replaceTemplateMarker( html, "@@Y", Resources["system.js"] );

	html = replaceTemplateMarker( html, "@@W", Resources["world.js"] );
	html = replaceTemplateMarker( html, "@@O", Resources["sound.js"] );
	html = replaceTemplateMarker( html, "@@F", Resources["font.js"] );
	html = replaceTemplateMarker( html, "@@X", Resources["transition.js"] );
	html = replaceTemplateMarker( html, "@@S", Resources["script.js"] );
	html = replaceTemplateMarker( html, "@@L", Resources["dialog.js"] );
	html = replaceTemplateMarker( html, "@@R", Resources["renderer.js"] );
	html = replaceTemplateMarker( html, "@@E", Resources["bitsy.js"] );

	// export the default font in its own script tag (TODO : remove if unused)
	html = replaceTemplateMarker( html, "@@N", "ascii_small" );
	html = replaceTemplateMarker( html, "@@M", fontManager.GetData("ascii_small") );

	html = replaceTemplateMarker( html, "@@D", gameData );

	// bitsyLog(html, "editor");

	ExporterUtils.DownloadFile( filename, html );
}


/* importing */
function unescapeSpecialCharacters(str) {
	str = str.replace(/\\"/g, '"');
	str = str.replace(/\\\\/g, '\\');
	return str;
}

this.importGame = function( html ) {
	bitsyLog("IMPORT!!!", "editor");

	// fix a regression with 7.11 where the template data in resources included
	// CRLFs
	html = html.replace(/\r\n/g, "\n")

	// IMPORT : new style
	var scriptStart = '<script type="bitsyGameData" id="exportedGameData">\n';
	var scriptEnd = '</script>';

	// this is kind of embarassing, but I broke import by making the export template pass w3c validation
	// so we have to check for two slightly different versions of the script start line :(
	var i = html.indexOf( scriptStart );
	if (i === -1) {
		scriptStart = '<script type="text/bitsyGameData" id="exportedGameData">\n';
		i = html.indexOf( scriptStart );
	}

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

	// bugfix for 7.9: moved the old style of import after the new style since I accidentally
	// triggered the old style in the HTML template for v7.9 - this way those files will still import
	// IMPORT : old style
	// find start of game data
	i = html.indexOf("var exportedGameData");
	if (i > -1) {
		bitsyLog("OLD STYLE", "editor");

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

	bitsyLog("FAIL!!!!", "editor");

	return "";
}

} // Exporter()

var ExporterUtils = {
	DownloadFile : function(filename, text) {

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
}
