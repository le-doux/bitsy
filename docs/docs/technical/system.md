# Bitsy System

## v0.2

### About

These APIs are the base layer on which the bitsy engine is built. When combined with a JavaScript intepreter, they define the system requirements for bitsy.

The web implementation of these APIs is found in `editor/script/system/system.js` ([source](https://github.com/le-doux/bitsy/blob/main/editor/script/system/system.js)). I've also written a standalone desktop implementation called [bitsybox](https://ledoux.itch.io/bitsybox) ([source](https://github.com/le-doux/bitsybox)).

NOTE: Currently these are experimental and likely to change significantly from version to version - at least until they reach v1.0.

## Specification

### System Object

`bitsy`

All of the functions and constants of the bitsy system are members of the `bitsy` global object. This object represents the bitsy system and must be provided by the host system for the engine to run.

### Constants

These constants are special values used by bitsy system functions.

#### Memory Blocks

Memory blocks are virtual locations in system memory used by certain functions to specify what memory they are changing. Currently the exact meaning of "memory block location" is not defined, so these constants should essentially be treated as arbitrary IDs.

`bitsy.VIDEO`

Location of the main display memory for bitsy when accessing pixels individually (see [Graphics Modes](#graphics-modes)).

`bitsy.TEXTBOX`

Location of the text display memory for bitsy (where the textbox is drawn). Seperate memory is required since it may not share the same internal resolution as the main display.

`bitsy.MAP1`

Location of the background tilemap.

`bitsy.MAP2`

Location of the foreground tilemap.

`bitsy.SOUND1`

Location of sound channel 1.

`bitsy.SOUND2`

Location of sound channel 2.

#### Graphics Modes

There are two graphics modes for the main display.

`bitsy.GFX_VIDEO`

In video mode, every pixel on the main display can be written to individually. This is used for screen transition effects.

`bitsy.GFX_MAP`

In tilemap mode, instead of directly writing to pixels you write tile IDs into tilemap memory. This is used for normal gameplay.

#### Text Modes

There are two text display modes as well.

`bitsy.TXT_HIREZ`

The internal resolution of the textbox display is 2x the main display. This is the default mode.

`bitsy.TXT_LOREZ`

The internal resolution of the textbox display is *the same* as the main display. Games can request this display mode via settings.

#### Size

Constant size values.

`bitsy.TILE_SIZE`

The size of tiles in pixels.

`bitsy.MAP_SIZE`

The size of tilemaps in tiles.

`bitsy.VIDEO_SIZE`

The size of the main display in pixels.

#### Button Codes

Bitsy has six gamepad buttons for input.

`bitsy.BTN_UP`

Up arrow or W on keyboard, swipe up on touch screen, d-pad up on gamepad.

`bitsy.BTN_DOWN`

Down arrow or S on keyboard, swipe down on touch screen, d-pad down on gamepad.

`bitsy.BTN_LEFT`

Left arrow or A on keyboard, swipe left on touch screen, d-pad left on gamepad.

`bitsy.BTN_RIGHT` 

Right arrow or D on keyboard, swipe right on touch screen, d-pad right on gamepad.

`bitsy.BTN_OK`

"Any key" on keyboard, tap on touch screen, face buttons on gamepad. (Used to advance dialog.)

`bitsy.BTN_MENU`

Ctrl+R on keyboard, no touch control yet, start button on gamepad. (Restarts the game.)

#### Pulse Waves

Bitsy's virtual soundchip supports three different pulse waves for audio output.

`bitsy.PULSE_1_8`

Pulse wave with 1/8 duty.

`bitsy.PULSE_1_4`

Pulse wave with 1/4 duty.

`bitsy.PULSE_1_2`

Pulse wave with 1/2 duty (aka square wave).

### IO (Input / Output)

`bitsy.log(message)`

Writes the string `message` to the debug console.

`bitsy.button(code)`

Returns `true` if the button referred to by `code` is held down (see [Button Codes](#button-codes)). Otherwise it returns `false`.

`bitsy.getGameData()`

Returns the game data as a string.

`bitsy.getFontData()`

Returns the default font data as a string.

### Graphics

`bitsy.graphicsMode(mode)`

Sets the current graphics display `mode` (see [Graphics Modes](#graphics-modes)), and also returns the current graphics mode. If no `mode` input is given, just returns the current mode without changing it.

`bitsy.textMode(mode)`

Sets the current text display `mode` (see [Text Modes](#text-modes)), and also returns the current text mode. If no `mode` input is given, just returns the current mode without changing it.

`bitsy.color(color, r, g, b)`

Sets the color in the system palette at index `color` to a color defined by the color parameters `r` (red), `g` (green), and `b` (blue). These values must be between 0 and 255. (For example, `bitsy.color(2, 0, 0, 0)` sets the color at index 2 to black and `bitsy.color(2, 255, 255, 255)` set the color at the same index to white.)

`bitsy.tile()`

Allocates a new tile and returns its memory block location.

`bitsy.delete(tile)`

Deletes the tile at the specified memory block location.

`bitsy.fill(block, value)`

Fills an entire memory `block` with a number `value`. Can be used to clear blocks such as video memory, tilemap memory, and tile memory.

`bitsy.set(block, index, value)`

Sets the value at `index` within a memory `block` with a number `value`.

`bitsy.textbox(visible, x, y, w, h)`

Updates the textbox display settings. If `visible` is `true` the textbox is rendered, otherwise it's hidden. The textbox's position (relative the main display's coordinate space) is defined by `x` and `y`. And the size of the textbox (in its internal resolution) is defined by `w` (width) and `h` (height). Omitted parameters are unchanged (For example, you can just reveal the textbox without changing its position and size using `bitsy.textbox(true)`).

### Sound

`bitsy.sound(channel, duration, frequency, volume, pulse)`

Updates all audio settings for one sound `channel` (either `bitsy.SOUND1` or `bitsy.SOUND2`). The `duration` is in milliseconds, `frequency` is in decihertz (dHz), `volume` must be between 0 and 15, and `pulse` is one of the pulse wave constants (see [Pulse Waves](#pulse-waves)).

`bitsy.frequency(channel, frequency)`

Sets the `frequency` for one sound `channel`. Units are decihertz (dHz).

`bitsy.volume(channel, volume)`

Sets the `volume` for one sound `channel`. Volume must be between 0 and 15 (inclusive).

### Events

`bitsy.loop(fn)`

The system will call function `fn` on every update loop. It will attempt to run at 60fps, but `fn` will also receive an input parameter `dt` with the delta time since the previous loop (in milliseconds).