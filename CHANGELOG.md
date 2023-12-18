## 8.7

- fix: Fix y-coordinate typo in createExitData (Pirijuamps)

## 8.6

- localization: added Ukrainian translation by leonid.codes
- feature: add apple touch icon for iOS safari
- fix: fix bug where {exit} undid the "locked" property state
- fix: fix bug where clicking on paint canvas undid drawing name changes
- docs: updated the tutorials page to include new tutorials on bitsy dialogs, the bitsy museum hack, and a bitsy handout for beginners!
- docs: update bitsy system API documentation to v0.2

## 8.5

- fix:  Multiple {pg} (pagebreak) commands break dialogue execution #190 

## 8.4

- documentation!

## 8.3

- add package.json
- add "smart quotes" to default font
- fix: if ending is cancelled, resume playing the current tune
- fix: {end} didn't update textbox position

## 8.2

- updated ascii_small.bitsyfont to use correct UTF8 codes
- add spanish translations by Florencia Rumpel Rodriguez (@\_\_rumpel)
- fix: find tools thumbnails weren't crisp in firefox
- fix: font parser wasn't use per-character height when reading lines
- fix: room order in exit tool matches order in room tool
- fix: typo in palette ID comparison during world parsing

## 8.1

- fix touch controls on mobile
- fix bug where sprites/items "under" player avatar wouldn't draw
- fix bug where stacked items don't draw correctly
- fix bug where textbox position doesn't update after script `{exit}`
- bitsycat links to bitsy.org

## 8.0

- blips (sound effects)
- tunes (music)
- change avatar per room
- change avatar and palette from dialog
- new color text effect that accepts any palette index
- added UI for tile picker / eyedropper tool in room tool
- update system APIs to v0.2:
  - new sound system APIs
  - improved rendering performance
- misc. bugfixes & tweaks

## 7.12

- allow editor panels to be resized (@seansleblanc)
- fix: alt-clicking items not selecting them (@seansleblanc)
- fix: rainbow text effect letters not showing up when dialog completed early (@seansleblanc)
- fix: room preview not updating when changing current palette (@seansleblanc)
- fix: remove empty path to fix invalid svg (@seansleblanc)
- fix: exported games breaking due to CRLF in template (equa)
- fix: replace various hard-coded constants with appropriate variables (@seansleblanc)

## 7.11

- fix bug where fade transitions alter the palette of the destination room during exit-from-script
- fix bug where textbox overflow stopped working

## 7.10

- fix bug where HTML import was broken

## 7.9

- improve exit tool layout (when all menus open)
- more robust transitions between different length palettes
- fix bug where thumbnails don't update on add / delete
- fix bug where gif recorder is disabled in play mode
- fix bug where updates are not installed
  - had to turn off service worker temporarily
- refactor to make porting easier

## 7.8

- play mode is more visually distinct
- tools are disabled during play mode
- show current room location during play mode
- fix bug where find button in paint tool overflows
- disable broken dialog preview button until I can fix it

## 7.7

- attempt to fix bug where extra frame is added to animation
- fix bug where games can't be uploaded from HTML
- url parameter for localization

## 7.6

- new layout for mobile devices

## 7.5

- add find tool shortcut to room, color, & dialog tools
- bugfix: stop adding extra spaces between code and text
- bugfix: thumbnails weren't generating after new game or import game
- refactor to share drawing data code between editor and engine

## 7.4

- new find tool!
- @seansleblanc: improved stability of persistent data storage
- bugfix: duplicating dialog fixed
- bugfix: duplicating palettes fixed
- bugfix: stop dialog tool from always opening at start

## 7.3

- save grid on/off settings between sessions
- bugfix: Samuel Fine fixed mobile touch controls
- bugfix: @seansleblanc fixed unrecoverable state from loc bug
- bugfix: extra newlines were added in dialog
- bugfix: return exit's "move" button wasn't localized
- bugfix: checkbox states were wrong on page load
- bugfix: room nav controls were broken after game data edits
- bugfix: stop deleting dialog that's still referenced

## 7.2

- new icons!
- dialog panel textboxes are sized to fit text
- localization updates
- bugfixes:
  - disable importing/exporting games while the game is playing
  - empty dialog doesn't break items and exits
  - stop exits from getting moved off-screen
  - dialog selection stopped working after playing the game
  - gif thumbnails don't break with large # of colors
  - invalid character boxes render for missing fonts
  - @seansleblanc fixed float bug with randomly generated colors
  - @seansleblanc fixed transition pixel overflow bug

## 7.1

- updated localization text
- bugfixes:
  - old dialog doesn't override imported dialog
  - typing in the ending dialog doesn't deselect it

## 7.0

- updated dialog panel:
  - supports nested lists and dialogs
  - set & update variable values with the expression builder
  - more functions!
- add dialogs to exits
- lock exits and endings from dialog
- exit and end from dialog
- pagebreak function
- titles can have multiple lines of dialog
- bugfixes:
  - spaces work inside nested dialog
  - functions support multiple parameters
  - unknown functions aren't deleted

## 6.5

- bugfixes:
  - @zachThePerson fixed room tool adding phantom tiles to room
  - @zachThePerson fixed error messages with chrome touch controls
  - @ragzouken duplicating drawings didn't update the finder thumbnail
  - @zachThePerson dragging out of a tool would select outside text
  - @ayolland fixed touch controls in iOS
  - @aloelazoe fixed a bug when adding new items
- localization:
  - Chinook language translation by Sequoia Edwards
  - Japanese language translation by Tokoro

## 6.4

- importing games from HTML works again
- updated about panel
- added open source license (MIT)!

## 6.3

- all resources are packaged locally to avoid cross-origin errors
  - you can download bitsy games from local copies of bitsy!
- exit tool resets when you delete a room
- invalid exits don't break the editor
- downloaded games pass w3c validation test
- download panel is sized correctly on chrome
- you can drag tool panels past the rightmost tool
- paint explorer updates when you paste new game data in
  - also it selects valid sprites when you change game data
- inventory UI resets when game restarts

## 6.2

- duplicate and delete palettes in the color tool!
- bugfixes:
  - `>=` and `<=` work correctly again
  - drawing colors update when you use the color picker
  - animations stay in time with each other when you change them
  - rooms without a defined palette don't break the game
  - deleting all palettes from game data won't break the game

## 6.1

- editor is more mobile-friendly:
  - new portrait mode layout
  - enabled touch controls for room and paint tools
  - font sizes for high dpi displays
- bugs:
  - fixed bug where you can't remove sprites from rooms
  - fixed crashes when there are no rooms
  - fixed html import bug
- improved rendering performance in chrome

## 6.0

- new combined exits & endings tool!
- exits are two-way by default
- change exit direction with one button
- new exit transition animations!
- exit thumbnails are shortcut to rooms
- toggle exits & endings visibility
- move exits & endings in room without tool open
- move exits & endings in two ways:
  - click and drag in the room
  - OR use the "move" button
- updated translations for several languages

## 5.5

- editor translated into Arabic, Chinese, and Polish
	> **shout outs to the translators!**
	>
	> - Ahmed Khalifa (Arabic)
	> - Ray Song (Chinese)
	> - Mateusz Teklak (Polish)
	>
- new Arabic pixel font
- right to left text
- bitsyfont supports variable-width fonts

## 5.4

- editor translated into Esperanto, Estonian, Hungarian, Icelandic, Russian
	> **thank you translators!!!! :)**
	>
	> - Ariel J Moody (Esperanto)
	> - Raul (Estonian)
	> - Ádám Török (Hungarian)
	> - Game Makers Iceland (Icelandic)
	> - Vinvirinvi & Onion (Russian)
	>
- link to updated Bitsy tutorial by Claire Morley
- added link to "games made with Bitsy" on itch.io

## 5.3

- performance improvements:
  - speed up game loading time with new renderer
  - improve editor responsiveness by only loading thumbnails when needed

## 5.2

- `{say}` function re-enabled
- fix weird scrolling in mobile
- default game loads correctly

## 5.1

- perf improvement: hide font data in game data by default
  - added toggle button to show/hide font data
- bugfix: avatar moved after leaving dialog
- bugfix: too many keys being ignored after leaving dialog

## 5.0

- editor translated into French, Portuguese, Spanish, Italian, Swedish, German
	> **huge thanks to the translators**
	>
	> - Peter Februar & Dorian Beaugendre (French)
	> - Bruno Silva (Portuguese)
	> - Marina Díez (Spanish & Italian)
	> - Em (Swedish)
	> - Kai Werder & Matthias Löwe (German)
	>
- new fonts to display European and Asian characters
- new settings panel!
- functions to add drawings to dialog: `{printSprite}`, `{printTile}`, `{printItem}`
- `{print}` function replaces deprecated `{say}` function
- downloaded game uses game title for file name
- when creating animations, the second frame starts as a copy of the first
- touch controls work on whole exported page, not just the game window
- you can download game data as separate `.bitsy` file
- bugfix: reset didn't reset game title
- bugfix: player got stuck moving in one direction
- bugfix: sometimes game window blinked in editor during play

## 4.8

- fix broken gif recording
- add gif snapshot! (take screenshot of current room)
  - alt-click for widescreen snapshot
- fix bug with reset game

## 4.7

- alt-click a tile or sprite in the room tool to edit it in the paint tool

## 4.6

- filter drawings by name!
- fix importing new-style html

## 4.5

- new color picker tool
- page export color saved between sessions
- updated tools bar
- bugfix: wall visualization was broken

## 4.4

- wall settings for tiles apply to all rooms by default
- bugfix: error on walking into edge of room

## 4.3

- new swipe & tap mobile controls
- mobile-friendly full page game window
- adjustable game window size settings

## 4.2

- dialog text fields are expandable
- the find drawing window is resizable
- add drawings in the find drawing window
- bugs fixed:
  - when you deleted a room, exits weren't deleted
  - when you deleted a room, exit options didn't update
  - find drawing window didn't update correctly when drawing deleted
  - dialog wasn't delete when sprite was
  - tiles were being named "undefined"
  - find drawing window didn't refresh on new game

## 4.1

- bugfix: sometimes new dialog would overwrite old dialog

## 4.0

- advanced dialog options, including:
  - dialog that changes each time it's said
  - dialog that changes based on items player has
- special effects for dialog, including:
  - shaky text
  - wavy text
  - rainbow text
- items
- inventory
- you can name objects, including:
  - items
  - rooms
  - palettes
- dialog scripting language with variables
- bugfix: newline characters work in dialog
- additional bugfixes

## 3.7

- bugfix: can't add color palettes
- bugfix: games don't run on iOS

## 3.6

- bugfix: remove broken mouse controls

## 3.5

- bugfix: games with no title couldn't start

## 3.4

- new "find drawing" window
  - browse list of all tiles and sprites
- new animation preview UI
- rooms animate in edit mode

## 3.3

- drag exits and endings to move them!
- show entrances in room view
- fix exit copy bug
- exits start with valid destination

## 3.2

- move tool windows around by dragging the title bar!
- user interface redesign

## 3.1

- bugfix: duplicated rooms don't disappear

## 3.0

- add endings to your game!
- you can have multiple color palettes (one per room)
- restart the game with ctrl-r or cmd-r
- dialog textbox matches size of dialog box in game
- gif encoding doesn't freeze the whole browser tab
- bug: you could edit sprites during play mode
- fixed a bug with animated tiles

## 2.3

- easily see walls!
- high contrast colors (black grid for light backgrounds)
- remembers and restores animations you deleted
- bugs fixed:
  - temporary fix for file corruption issue
  - couldn't toggle panels in Firefox
  - wall checkbox didn't update on room change
  - exits were always visible on reload
  - new dialog was lost when switching sprites
  - duplicated drawings didn't include animation

## 2.2

- see overlay of other frame while animating
- change background color of exported game
- apply wall settings to all rooms
- bugs fixed:
  - player could escape off-screen
  - copied rooms changed each other
  - exit options didn't update correctly

## 2.1

- unlimited sprites, tiles, and rooms!

## 2.0

- flipbook-style animation!
  - animate any sprite or tile or avatar
  - check "add animation" in the paint tab
  - switch frames by selecting frame 1 or 2
- sprite/tile thumbnails
  - click a thumbnail to paint it!
- easily duplicate rooms, sprites, and tiles
- exits are easier to see
- skip dialog with any key

## 1.4

- delete sprites, tiles, and rooms!
- use "new" button to start over
- fixed bug with exits when reloading files
- fixed bug with refreshing game data

## 1.3

- re-import games from html files

## 1.2

- autosaving means you'll never lose your work!
- your open tools are remembered between sessions

## 1.1

- record gifs! (open from the toolbar)

## 1.0

- you can have multiple rooms in a game!
- add exits that connect rooms
- a toolbar for showing/hiding tool windows
- you can minimize tools
- remove sprites from a room by clicking on them
- drag to add/delete tiles from room

## 0.1

new features:

- games have touch controls!
bugfixes:
- quotation marks in dialog don't break game
- drawing on Surface devices works
- pasting new game data refreshes everything
- editor detects unsupported features
- fix autocomplete color bug in Safari
- limit number of sprites
