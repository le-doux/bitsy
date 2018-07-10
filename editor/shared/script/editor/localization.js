/*
TODO
X where to store localization id? id, class, innerText?
X test google sheets (use tabs, not semicolons)
X wrap all UI strings in index.html
X create UI for switching languages
X save setting for default languages
X dynamically populate language selector
X debug UI for translators (solution: send them a version of the editor)
X get translation volunteers
X how to handle multi-paragraph text (for now: lots of strings)
X how to handle dynamic text
X find instances of dynamic text
- how to handle alt text & pladeholder text (other special cases)
- dynamic text like "I'm a cat" "tea" and "Write your game's title here"
*/

function Localization(initCallback) {

var self = this;

var resources = new ResourceLoader();

var localizationStrings = null;

resources.load("other", "localization.tsv", function() { // why does this happen multiple times?
	var csv = resources.get("localization.tsv");
	if(csv.length <= 0) // hack to avoid weird double loading (there's got to be a *real* way)
		return;

	localizationStrings = {};

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
	// localize( getEditorLanguage() );

	if(initCallback != undefined && initCallback != null)
		initCallback();
});

var localizationClass = "localize";

// var language = (navigator.languages ? navigator.languages[0] : navigator.language).split("-")[0];
// language = "es";

function getLocalizationId(element) { // the localization id is the class AFTER the localizationClass
	for(var i = 0; i < element.classList.length; i++) {
		if(element.classList[i] === localizationClass) {
			return element.classList[i+1]; // have to be careful this never breaks
		}
	}
	return null; // oops
}

function localize(language) {
	if(localizationStrings == null)
		return;

	console.log("LANG " + language);

	var elements = document.getElementsByClassName(localizationClass);
	for(var i = 0; i < elements.length; i++) {
		var el = elements[i];
		var localizationId = getLocalizationId(el);
		var locString = localizationStrings[language][localizationId];
		if (locString) {
			el.innerText = locString;
		}
		else if (localizationStrings["en"][localizationId] != null) {
			el.innerText = localizationStrings["en"][localizationId]; // fall back to english
		}
	}
}
this.Localize = function() {
	localize( getEditorLanguage() );
}

function getEditorLanguage() {
	if(localStorage.editor_language == null) {
		var browserLanguage = (navigator.languages ? navigator.languages[0] : navigator.language).split("-")[0];
		localStorage.editor_language = browserLanguage;
	}

	// fallback to english
	if(localizationStrings[localStorage.editor_language] == null) {
		localStorage.editor_language = "en";
	}

	return localStorage.editor_language;
}
this.GetLanguage = function() {
	return getEditorLanguage();
}

function saveEditorLanguage(language) {
	localStorage.editor_language = language;
}

function getLanguageList() {
	var langList = [];

	if(localizationStrings == null)
		return langList;

	for(var langId in localizationStrings) {
		langList.push( {
			id : langId,
			name : localizationStrings[langId]["language_name"]
		});
	}

	return langList;
}
this.GetLanguageList = function() {
	return getLanguageList();
}

this.ChangeLanguage = function(language) {
	saveEditorLanguage(language);
	localize( getEditorLanguage() );
}

function getString(id) {
	return localizationStrings[getEditorLanguage()][id];
}
this.GetString = function(id) {
	return getString(id);
}

var unlocalizedDynamicStrings = {};
function getStringOrFallback(id, englishFallback) {
	// we haven't loaded yet - always return fallback (but don't record it)
	if(localizationStrings == null)
		return englishFallback;

	var locString = getString(id);
	if(locString == null || locString.length <= 0) {
		locString = englishFallback;
		unlocalizedDynamicStrings[id] = englishFallback; // record use of unlocalized strings
	}
	return locString;
}
this.GetStringOrFallback = function(id, englishFallback) {
	return getStringOrFallback(id,englishFallback);
}

function localizationContains(id, text) { // TODO : rename to be more descriptive?
	for (lang in localizationStrings) {
		var locString = localizationStrings[lang][id];
		if (locString != null && locString.length > 0 && locString === text) {
			return true;
		}
	}

	return false;
}
this.LocalizationContains = localizationContains;

function exportEnglishStringsDictionary(englishStrings) {
	var englishStringTsv = "id\ten\n";
	for(var stringId in englishStrings) {
		englishStringTsv += stringId + "\t" + englishStrings[stringId] + "\n";
	}

	// console.log(englishStringTsv);
	ExporterUtils.DownloadFile("englishStrings.tsv",englishStringTsv);
}

this.ExportEnglishStrings = function() {
	var englishStrings = {};
	var elements = document.getElementsByClassName(localizationClass);
	for(var i = 0; i < elements.length; i++) {
		var el = elements[i];
		var localizationId = getLocalizationId(el);
		englishStrings[localizationId] = el.innerText;
	}
	exportEnglishStringsDictionary(englishStrings);
}

this.ExportMissingEnglishStrings = function() {
	var englishStrings = {};
	var elements = document.getElementsByClassName(localizationClass);
	for(var i = 0; i < elements.length; i++) {
		var el = elements[i];
		var localizationId = getLocalizationId(el);
		if(!localizationStrings["en"][localizationId])
			englishStrings[localizationId] = el.innerText;
	}
	exportEnglishStringsDictionary(englishStrings);
}

this.ExportDynamicEnglishStrings = function() {
	exportEnglishStringsDictionary(unlocalizedDynamicStrings);
}

} // Localization()