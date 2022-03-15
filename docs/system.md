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
* `5 // MENU / RESTART`: (Restarts game) Ctrl+R on keyboard, no touch control yet, start button on gamepad

### Graphics ###

`bitsySetGraphicsMode(mode)`

Sets the current graphics mode. There are two: mode `0` is pixel mode (where you can set individual pixels on the screen), mode `1` is tile mode (where you set tiles in the tile map).

`bitsySetColor(paletteIndex, r, g, b)`

Sets a color in the system palette (shared by both text and tile rendering).

`bitsyResetColors()`

Empties the system palette of all colors.

`bitsyDrawBegin(bufferId)`

Selects a drawing buffer that any following draw functions will act on. Buffer `0` is always the screen buffer, buffer `1` is the textbox buffer, and `2` and above are tiles. (Note: I'm not sure about the "buffer" name, but I was trying to think of something generic that could encompass the screen, textbox, and tiles and that's what I've come up with for now - it might change later.)

`bitsyDrawEnd()`

Deselects the current drawing buffer, if there is one. Any additional draw functions will fail. This gives the host system a chance to do any clean up or commit actions it needs to do with the buffer before rendering.

`bitsyDrawPixel(paletteIndex, x, y)`

Set the pixel at `x` and `y` (within the current drawing buffer) to the palette color at `paletteIndex`. The screen buffer (`0`) can only use this in pixel mode (`0`).

`bitsySetPixelAtIndex(paletteIndex, pixelIndex)`

Set the pixel at `pixelIndex` (within the current drawing buffer) to the palette color at `paletteIndex`. This treats the buffer as a one-dimensional array of pixels, so the indexing starts at the top left corner of the buffer and moves along the x-axis, wrapping around at the width of the buffer. (Note: Having two pixel drawing functions is a bit redundant.)

`bitsyDrawTile(tileId, x, y)`

Puts the tile `tileId` in the current buffer's tile map at `x` and `y`. Only valid for the screen buffer (`0`) in tile mode (mode `1`).

`bitsyDrawTextbox(x, y)`

Draws the textbox in the current buffer at `x` and `y`. Only valid for the screen buffer (`0`) in tile mode (mode `1`).

`bitsyClear(paletteIndex)`

Clears the current buffer with the color at `paletteIndex`.

`bitsyAddTile()`

Adds a new tile and returns its id number if there is space, otherwise returns `null`.

`bitsyResetTiles()`

Empties all tiles and resets the id numbers.

`bitsySetTextboxSize(w, h)`

Sets the width `w` and height `h` of the textbox buffer.

### Events ###

`bitsyOnLoad(fn)`

`bitsyOnQuit(fn)`

`bitsyOnUpdate(fn)`