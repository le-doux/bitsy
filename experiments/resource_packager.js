console.log("test");

var fs = require("fs");

fs.readFile("../editor/index.html", "utf8", function (err, data) { console.log(data); });