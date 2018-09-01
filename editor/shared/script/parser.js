function Parser() {
	// TODO
} // Parser()

function GameState() {

var title = "";
var room = {};
var tile = {};
var sprite = {};
var item = {};
var dialog = {};
var palette = {
	"0" : [[0,0,0],[255,0,0],[255,255,255]] //start off with a default palette (can be overriden)
};
var ending = {};
var variable = {}; // these are starting variable values -- they don't update (or I don't think they will)
var playerId = "A";

var defaultFontName = "ascii_small";
var fontName = defaultFontName;

// TODO : names, more???

//stores all image data for tiles, sprites, drawings
var imageStore = {
	source: {},
	render: {}
};

// TODO : is directly exposing these values the best idea?
this.Tiles = tile;
this.Sprites = sprite;
this.Items = item;
this.Palettes = palette;
this.ImageStore = imageStore;

} // GameState()