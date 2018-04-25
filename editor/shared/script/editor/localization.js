/*
TODO
X where to store localization id? id, class, innerText?
- test google sheets
- wrap all UI strings in index.html
- create UI for switching languages
- save setting for switching languages
- debug UI for translators
- get translation volunteers
*/

function Localization() {

var resources = new ResourceLoader();

var localizationStrings = null;

resources.load("other", "testLocalization.csv", function() { // why does this happen multiple times?
	localizationStrings = {};

	var csv = resources.get("testLocalization.csv");
	console.log(csv);
	var lines = csv.split("\n");

	var columnHeaders = lines[0].split(";");
	console.log(columnHeaders);
	for(var i = 1; i < columnHeaders.length; i++) {
		localizationStrings[columnHeaders[i]] = {};
	}

	for(var i = 1; i < lines.length; i++) {
		var lineSplit = lines[i].split(";");
		var lineId = lineSplit[0];
		for(var j = 1; j < lineSplit.length; j++) {
			var languageId = columnHeaders[j];
			localizationStrings[languageId][lineId] = lineSplit[j]; // TOOD - protect against empty lines
		}
	}

	console.log(localizationStrings);
});

var localizationClass = "localize";

// console.log("DEFAULT language");
var language = (navigator.languages ? navigator.languages[0] : navigator.language).split("-")[0];
// console.log(language);

// language = "es";

function getLocalizationId(element) { // the localization id is the class AFTER the localizationClass
	for(var i = 0; i < element.classList.length; i++) {
		if(element.classList[i] === localizationClass) {
			return element.classList[i+1]; // have to be careful this never breaks
		}
	}
	return null; // oops
}

this.Localize = function() {
	if(localizationStrings == null)
		return;

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

} // Localization()