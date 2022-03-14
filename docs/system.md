# Bitsy System API v0.1 #

## About ##
These APIs are the base on which the Bitsy engine is built. They are currently experimental and likely to change significantly from version to version - at least until I reach a v1.0. The web implementation of these APIs is found in `editor/script/engine/system.js`.

### IO (Input / Output) ###
`bitsyLog(message, category)`

`bitsyGetButton(buttonCode`

### Graphics ###
`bitsySetGraphicsMode(mode)`

`bitsySetColor(paletteIndex, r, g, b)`

`bitsyResetColors()`

`bitsyDrawBegin(bufferId)`

`bitsyDrawEnd()`

`bitsyDrawPixel(paletteIndex, x, y)`

`bitsySetPixelAtIndex(paletteIndex, pixelIndex)`

`bitsyDrawTile(tileId, x, y)`

`bitsyDrawTextbox(x, y)`

`bitsyClear(paletteIndex)`

`bitsyAddTile()`

`bitsyResetTiles()`

`bitsySetTextboxSize(w, h)`

### Events ###
`bitsyOnLoad(fn)`

`bitsyOnQuit(fn)`

`bitsyOnUpdate(fn)`