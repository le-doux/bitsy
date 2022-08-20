var fs = require("fs");

console.log("=== extract resource ===");

var name = "ascii_small.bitsyfont";
console.log("extracting: " + name);

var resourcesFilePath = "../../editor/script/generated/resources.js";
var resourcesJs = fs.readFileSync(resourcesFilePath, { encoding: "utf8" });
eval(resourcesJs);

// write out the file we care about
var fileSrc = Resources[name];

// hack: fix the newlines in the merged ascii_small.bitsyfont
console.log(fileSrc);
fileSrc = fileSrc.replaceAll("/n", "\n");
console.log(fileSrc);

fs.writeFileSync(name, fileSrc, { encoding: "utf-8" });

console.log("done!");