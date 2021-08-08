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
- how to handle alt text & placeholder text (other special cases)
- dynamic text like "I'm a cat" "tea" and "Write your game's title here"
*/

function Localization(initialLanguage) {

var self = this;

var localizationStrings = null;

var currentLanguage;

var defaultLanguage = "en";

var initialize = function() { // why does this happen multiple times?
	var csv = Resources["localization.tsv"];
	// bitsyLog(csv, "editor");

	localizationStrings = {};

	csv = csv.replace(/\r/g,""); // weird sanitization bug required
	// bitsyLog(csv, "editor");
	var lines = csv.split("\n");
	// bitsyLog(lines, "editor");

	var columnHeaders = lines[0].split("\t");
	// bitsyLog(columnHeaders, "editor");
	for(var i = 1; i < columnHeaders.length; i++) {
		// bitsyLog(columnHeaders[i], "editor");
		localizationStrings[columnHeaders[i]] = {};
	}

	for(var i = 1; i < lines.length; i++) {
		// bitsyLog(lines[i], "editor");
		var lineSplit = lines[i].split("\t");
		// bitsyLog(lineSplit, "editor");
		var lineId = lineSplit[0];
		for(var j = 1; j < lineSplit.length; j++) {
			var languageId = columnHeaders[j];
			localizationStrings[languageId][lineId] = lineSplit[j]; // TOOD - protect against empty lines
		}
	}

	currentLanguage = initialLanguage || Store.get('editor_language', defaultLanguage);

	// bitsyLog(localizationStrings, "editor");
	// localize( getEditorLanguage() );
};

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

function getLocaleString(locale, id) {
	var localeStrings = localizationStrings[locale];
	return localeStrings && localeStrings[id];
}

function localize(language) {
	if(localizationStrings == null)
		return;

	bitsyLog("LANG " + language, "editor");

	var elements = document.getElementsByClassName(localizationClass);
	for(var i = 0; i < elements.length; i++) {
		var el = elements[i];
		var localizationId = getLocalizationId(el);
		var locString = getLocaleString(language, localizationId);
		if (!locString) {
			locString = getLocaleString(defaultLanguage, localizationId);
		}
		if (locString) {
			el.innerText = locString;
		}
	}
}
this.Localize = function() {
	localize( getEditorLanguage() );
}

function getEditorLanguage() {
	var language = currentLanguage;
	if(!language) {
		language = (navigator.languages ? navigator.languages[0] : navigator.language).split("-")[0];
	}

	// fallback to english
	if(!localizationStrings[language]) {
		language = defaultLanguage;
	}

	return language;
}
this.GetLanguage = function() {
	return getEditorLanguage();
}

function saveEditorLanguage(language) {
	Store.set('editor_language', language);
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

this.ChangeLanguage = function(newLanguage) {
	currentLanguage = newLanguage;
	currentLanguage = getEditorLanguage();
	saveEditorLanguage(currentLanguage);
	localize( getEditorLanguage() );
}

function getString(id) {
	return getLocaleString(getEditorLanguage(), id);
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
	if(!locString) {
		locString =  getLocaleString(defaultLanguage, id) || englishFallback || id;
		unlocalizedDynamicStrings[id] = locString; // record use of unlocalized strings
	}
	return locString;
}
this.GetStringOrFallback = function(id, englishFallback) {
	return getStringOrFallback(id,englishFallback);
}

function localizationContains(id, text) { // TODO : rename to be more descriptive?
	for (lang in localizationStrings) {
		var locString = getLocaleString(lang, id);
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

	// bitsyLog(englishStringTsv, "editor");
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
		if(!getLocaleString(defaultLanguage, localizationId))
			englishStrings[localizationId] = el.innerText;
	}
	exportEnglishStringsDictionary(englishStrings);
}

this.ExportDynamicEnglishStrings = function() {
	exportEnglishStringsDictionary(unlocalizedDynamicStrings);
}

this.GetStringCount = function(langId) {
	return localizationStrings[langId] ? Object.keys(localizationStrings[langId]).length : 0;
}

initialize();

} // Localization()
