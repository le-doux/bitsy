# Bitsy System API v0.1 #

## About ##
These APIs are the base on which the Bitsy engine is built. They are currently experimental and likely to change significantly from version to version - at least until I reach v1.0. The web implementation of these APIs is found in [`editor/script/engine/system.js`](https://github.com/le-doux/bitsy/blob/main/editor/script/engine/system.js).

### IO (Input / Output) ###

`bitsyLog(message, category)`

Writes `message` to the debug console. The optional `category` is used for filtering debug messages from different sources such as the system, engine, and editor.

`bitsyGetButton(buttonCode)`

Returns `true` if the button referred to by `buttonCode` is down.

The button codes are:
* `0 // UP`: Up arrow or W on keyboard, swipe up on touch screen, d-pad up on gamepad
* `1 // DOWN`: Down arrow or S on keyboard, swipe down on touch screen, d-pad down on gamepad
* `2 // LEFT`: Left arrow or A on keyboard, swipe left on touch screen, d-pad left on gamepad
* `3 // RIGHT`: Right arrow or D on keyboard, swipe right on touch screen, d-pad right on gamepad
* `4 // OK`: (Advances dialog) "Any key" on keyboard, tap on touch screen, face buttons on gamepad
* `5 // MENU / RESTART`: (Restarts game) Ctrl+R on keyboard, no touch control yet, start button gamepad

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