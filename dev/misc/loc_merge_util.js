var fs = require("fs");

console.log("=== loc merge ===");

var lang = "es";
var srcTsvFile = "localization-es-rumpelcita.tsv";
console.log("file: " + srcTsvFile);

// extract the string IDs from the current tsv file
var stringIds = [];
var curTsv = fs.readFileSync("../resources/localization.tsv", { encoding: "utf8" });
var curTsvRows = curTsv.split("\n");

for (var i = 1; i < curTsvRows.length; i++) {
	var cells = curTsvRows[i].split("\t");
	stringIds.push(cells[0]);
}

// init string dictionary
var stringDictionary = {};
for (var i = 0; i < stringIds.length; i++) {
	stringDictionary[stringIds[i]] = "";
}

// read strings from the tsv we want to merge in
var srcTsv = fs.readFileSync(srcTsvFile, { encoding: "utf8" });
var srcTsvRows = srcTsv.split("\n");

var langIndex = srcTsvRows[0].split("\t").indexOf(lang);
console.log("language: " + lang + " (column " + langIndex + ")");

console.log("====");

for (var i = 0; i < srcTsvRows.length; i++) {
	var cells = srcTsvRows[i].split("\t");
	var id = cells[0];
	var str = cells[langIndex];

	if (stringDictionary[id] != undefined) {
		stringDictionary[id] = str;
		console.log(id + ": " + str);
	}
}

console.log("====");

// write out a tsv with *just* the language we care about (with id order matching the current tsv)
var outTsv = "id\t" + lang + "\n";
for (var i = 0; i < stringIds.length; i++) {
	var id = stringIds[i];
	outTsv += id + "\t" + stringDictionary[id] + "\n";
}

fs.writeFileSync("loc_merge_" + lang + ".tsv", outTsv, { encoding: "utf-8" });

console.log("done!");