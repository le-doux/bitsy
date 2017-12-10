var fs = require('fs');

console.log("hello");

var svg = "";
svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + '\n';
svg += '<svg width="60" height="80" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">' + '\n';
svg += '<rect width="10" height="10" fill="#000"/>' + '\n';
svg += '</svg>' + '\n';

fs.writeFile("font/svg0.svg", svg);

console.log("svg done!");