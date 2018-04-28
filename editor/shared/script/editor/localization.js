/*
TODO
X where to store localization id? id, class, innerText?
X test google sheets (use tabs, not semicolons)
X wrap all UI strings in index.html
- create UI for switching languages
- save setting for default languages
- debug UI for translators
- get translation volunteers
- how to handle multi-paragraph text
	- about
	- instructions
	- download help
	- current solution: 
		- use word wrap for line breaks
		- broken up into many chunks because of
			- links (possible alt solution: [])
			- lists (possible alt solution? |,;>*@)
- how to handle dynamic text
*/

function Localization() {

var self = this;

var resources = new ResourceLoader();

var localizationStrings = null;

resources.load("other", "localization.tsv", function() { // why does this happen multiple times?
	localizationStrings = {};

	var csv = resources.get("localization.tsv");
	csv = csv.replace(/\r/g,""); // weird sanitization bug required
	// console.log(csv);
	var lines = csv.split("\n");

	var columnHeaders = lines[0].split("\t");
	// console.log(columnHeaders);
	for(var i = 1; i < columnHeaders.length; i++) {
		// console.log(columnHeaders[i]);
		localizationStrings[columnHeaders[i]] = {};
	}

	for(var i = 1; i < lines.length; i++) {
		// console.log(lines[i]);
		var lineSplit = lines[i].split("\t");
		// console.log(lineSplit);
		var lineId = lineSplit[0];
		for(var j = 1; j < lineSplit.length; j++) {
			var languageId = columnHeaders[j];
			localizationStrings[languageId][lineId] = lineSplit[j]; // TOOD - protect against empty lines
		}
	}

	// console.log(localizationStrings);
	localize();
});

var localizationClass = "localize";

// console.log("DEFAULT language");
var language = (navigator.languages ? navigator.languages[0] : navigator.language).split("-")[0];
// console.log(language);

language = "es";

function getLocalizationId(element) { // the localization id is the class AFTER the localizationClass
	for(var i = 0; i < element.classList.length; i++) {
		if(element.classList[i] === localizationClass) {
			return element.classList[i+1]; // have to be careful this never breaks
		}
	}
	return null; // oops
}

function localize() {
	if(localizationStrings == null)
		return;

	// console.log("LANG " + language);

	var elements = document.getElementsByClassName(localizationClass);
	for(var i = 0; i < elements.length; i++) {
		var el = elements[i];
		var localizationId = getLocalizationId(el);
		var locString = localizationStrings[language][localizationId];
		if (locString) {
			el.innerText = locString;
		}
	}
}
this.Localize = function() {
	localize();
}

this.ExportEnglishStrings = function() {
	var englishStrings = {};
	var elements = document.getElementsByClassName(localizationClass);
	for(var i = 0; i < elements.length; i++) {
		var el = elements[i];
		var localizationId = getLocalizationId(el);
		englishStrings[localizationId] = el.innerText;
	}

	var englishStringTsv = "id\ten\n";
	for(var stringId in englishStrings) {
		englishStringTsv += stringId + "\t" + englishStrings[stringId] + "\n";
	}

	// console.log(englishStringTsv);
	ExporterUtils.DownloadFile("englishStrings.tsv",englishStringTsv);
}

} // Localization()