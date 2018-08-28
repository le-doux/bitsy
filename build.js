var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
	files: './editor/**', // use the glob format
	platforms: ['osx64', 'win32'], //, 'win64']
	macIcns: './editor/shared/icons/bitsy.icns',
	winIco : './editor/shared/icons/bitsy.ico',
});

nw.build().then(function () {
	console.log('all done!');
}).catch(function (error) {
	console.error(error);
});