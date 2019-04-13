/*
---- from exit.js ----
TODO:
X customize "marker 1" and "marker 2" names
X add ending dialog
X add script data type
	- name is PRG (possible alternates are SC and SCR)
X handle multi-line scripts in endings
X add effects
X new ID system for scripts (then everything else)
X bug: delete associated scripts when you delete the marker!
	- also do endings!
X bug: markers don't clear when game is reset (what about game data? I don't think so!)
X better exit placement
X update "moving" text
X show / hide effects
X BUG: exits in exit tool don't update when game data changes!!!
- add exit options
	- transition effect
	- lock
	- dialog
	- customize?
- rename exit tool and exit.js
X need to re-render exits on palette change
- update panel prefs for v6.0
- localization
- one thing I really need is a universal script editor component (but maybe it's not worth it just yet?)
- thoughts to consider:
	- should avatar be set by room, instead of by exit / script? (or both?)
	- how should {end} and {exit} functions work - end immediately or not? contain ending dialog or not?
		- if I have {narrate} does that solve my problems or create more? what about controlling dialog position (top, middle, bottom)?
	- should I stop stripping out un-identified functions?
- don't forget to add some more helper functions: {setItem}, other??
- adding official plugin support would be super cool
- need to make it so the exit tool doesn't refresh all the time and lose your selection state SO easily (catalogue when this happens)
- should I add {return value}?
X TODO : maintain state of return exit, so it doesn't get lost as you toggle stuff?
- SOMEDAY.. rename dialog -> dialogue?

PLAN:
v6
- new exit tool
- exit transition effects
v7
- exit scripting
- new script tag (PRG)
- IDs
- effects
- add {setItem} function
v8
- multiple sprites
- {changeAvatar}

THOUGHTS ON {return}:
- what should it break out of? the whole script? the nearest code block? what about dialog blocks? functions?
- should code blocks REALLY be able to contain multiple statements within them???
	when thinking about functions should it look like:
		{func name : param1 param2 => {
			{a}
			{b}
			{c}
		}}
	OR
		{func name : param1 param2 =>
			{a}
			{b}
			{c}
		} // in this case --- is un-bracketed text dialog? ALSO: should I have used an explicit {dialog} block from the get-go?

{dialog
	SOME DIALOG
	GOES HERE
}

{
	- bool ?
		{dialog
			SAY THIS {doInDialog}
		}
	- else
		{dialog
			SAY THAT
		}
		{doTheOther}
}

TODO:
- advanced exit TODO:
	X play dialog on (before?) exit
	X script return values
	X lock exits on return false
	- {changeAvatar} function
	X room transitions system
	- {nextTransition} function
	- change how sprites work?
		- allow multiple?
		- allow switching of avatar
	- consider changes to scripting format
		X return values
		X {} multi-line blocks (functions??)
		- deprecate """ blocks?
		- replace DLG with SCRIPT (name?) blocks?
		- bigger API? scene objects?? structs??
	- consider "triggers" AKA script-only exits
		EXT 0,0 NULL DLG dlg_id (or something) (what about? TRG 0,0 dlg_id)

=== object and function notation ideas ===
-- anonymous object
{obj var1=a var2=b} // create instance
{obj : var1=a var2=b} // with separator
-- named object
{obj name : var1=a var2} // define prototype (globally?)
{new name var2=c} // create instance
-- access object properties
{obj1.x = 5} // set
{2 == obj1.y} // test value
{obj1.func a b} // call method
-- anonymous function
fx = {func param1 param2 => body} // create
{fx a b} // invoke
{func : param1 param2 => body} // create with separator
-- named function
{func name : param1 param2 => body} // define (globally?)
{name a b} // invoke

transition system notes
- fade: black, white, color?
- slide: left, right, up, down
- other? fuzz, wave, flash, pie circle, circle collapse (cartoon end), other??
- this basically requires a post-processing effect
- TODO
	- make sure it is pixel bound to the correct resolution 128 x 128
	- try a few effects!
	- try limiting the frame rate!
	- make real transition manager object

changeAvatar notes
// TODO : this is kind of hacky
// - needs to work with names too
// - should it work only on the drawing? or other things too??
// - need to think about how the sprite model should work (multiple sprites?)
// 		- will avatars still need to be unique in a multi sprite world?
// - need a way to detect the sprite ID / name in code {avatarName} (or something???)

NOTES
- now would also be a good time to consider adding code commenting
- should exit dialog be regular dialog?? or "narration"?? or should there be a variable/function to control it?
- improve the two-way arrows for exits
- should I allow multiple copies of sprites?
- should I have enums or something for the exit types / transition types: exit.locked, exit.no_transition, exit.fade_white???

- exit dialog
	- file format
	- new script functions
	- UI control

NOTES / ideas:
- stop room tool relying on "curRoom" -- give it an internal state
- show exit count to help navigation??
- should I have direct exit value manipulation (room + coords) as dropdowns?
- better logic for initial placement of entrance / exit for door
- there is some kind of bug with the title disappearing off of games

TODO advanced exits:
- transition animations
- swap characters
X play dialog
X lock based on return value

plan for advanced exits:
- exits can have an associated dialog
	EXT 13,4 0 7,9 DLG EXT_15
- if the dialog script returns true you can enter it.. otherwise it's cancelled
- it can play dialog as normal
- other features are new functions
	- {changeAvatar}
	- {nextTransition}
- detect supported scripts and show UI for that
	- arbitrary scripts can be run through "custom" plaintext

advanced exit notes:
- should there be a "trigger" option where there is no actual exit.. just a script that's run?



--- from editor.js ---
PERF NOTES:
- loading idea: use long animations to create the loading animation
- handle parsing performance (especially LARGE fonts)
- load hidden thumbnails over time

X bug where big fonts slow down re-writing the game data (toggle to show the font data?)
	- cause: writing a ton of data into the game data text box
		fixes: hide/show font in game data, make "async" re-write of textbox (will that work?)
X asian font : NS_ERROR_DOM_QUOTA_REACHED: Persistent storage maximum size reached
	- ideas: don't save fonts in the game data until download ... just store the names (note: could cause some bugs)

POST 5.0 longer term:
- desktop apps
- homepage (bitsy.org)
- arabic pixel font
- scripting documentation
- fix perf of game data box (async writing?)
- perf of sprite selector
- loading screen
- controls screen
- async loading
- parsing module
- game data object w/ event subscription
- rendering module w/ image lookup methods
- EXITS + rooms + script update
- choice dialog
- music editor

Loading sprites
- black or blue background?
- how to store loading images? DRW?
-- DRW isn't preserved or rendered
---
SPR a
00000000
00000000
01010001
01110001
01110010
01111100
00111100
00100100
DLG SPR_0
POS 0 5,7

SPR b
00000000
00000000
00100000
00100000
00111000
00100100
00100100
00111000
POS 0 6,7

SPR c
00000000
00000000
00000000
00010000
00000000
00010000
00010000
00011000
POS 0 7,7

SPR d
00000000
00000000
00010000
00010000
00111000
00010000
00010000
00011000
POS 0 8,7

SPR e
00000000
00000000
00000000
00011100
00100000
00011000
00000100
00111000
POS 0 9,7

SPR f
00000000
00000000
00000000
00010100
00010100
00010100
00001000
00110000
POS 0 10,7
---

TEST desktop editor:
- feature: drag tools past edge of window
- feature: visual room select
- feature: copy sprites w/ room
- bug: duplicate drawing -> weird thumbnail formatting

TODO:
make branch off of: https://github.com/le-doux/bitsy/commit/e2ab6cb15ac328ad9cd596edcfc6c89e2caed2b4
https://stackoverflow.com/questions/7167645/how-do-i-create-a-new-git-branch-from-an-old-commit

CONFIRMED BUGS
- iOS editor is broken again
- bug with mobile (iOS safari) not loading itch games every time
- animation bugs: https://twitter.com/skodone/status/942019687550017542

TODO: touch controls
X figure out scaling (_test windows / android)
X rename touch event handlers
- need more feedback for swiping controls (partial swipe, bump, select character)
X swipe movements are too large

SPOTTED BUGS
- start a new game, old dialog sticks around (no repro)
- need to improve UI to teach how new dialog works
- bug with room names? (investigate)
- confusing that you can't add new items in the inventory window (rename them too?)
- becklespinax: Not sure what causes it but sometimes when writing dialogue that uses the new text effects I'll go to play the scene and it won't fire the dialogue attached to the sprite when interacted with. (no repro yet)
- weird ghost tiles in exit map
- overlapping entrance & exit things on regular map
- ending undefined bug (how repro?)
- but sometimes when pushing an arrow key just once, the avatar will keep moving in the direction until it runs into a wall/sprite

NEW FEATURE IDEAS
- plugin
- import / export tiles
- editor behaves odd in playtest mode -- disable more stuff (and make it more clear!)
- need newlines in endings

NOTES WHILE GETTING READY TO RELEASE
- need to redo GIF recording (snapshots, animation, text effects)

Notes on controlled walking
- need to respond to direction buttons even if you haven't lifted all the other buttons

Other notes / feature ideas
- string demarcation in programming language
- comments for programming language
- documentation for programming language
- WASD / arrow keys should only control game when the game has focus?
- not always clear when the editor is play-mode vs edit-mode (visuals? turn off editor controls? other?)
- multiple avatars
- multiple exits when you got different items
- arrange windows more freely (vertical)
- mobile version
- better organization tools for tiles (e.g. naming, re-ordering them, grouping them (folders?), searching, etc.)
- dialog when you change rooms
- different color for character sprite vs everything else?
- game ends after dialog from sprite (add to scripting)

BUGS / FEEDBACK:
* Thank you @adamledoux for Bitsy, it is so relaxing to use. Are you aware that in Safari deleted rooms do not disappear from the exit list?
* @videodante: @adamledoux Hey! I was just wondering if it's possible to change the room size in bitsy, or if not, if you'd consider adding that?
--> e.g. changing size of tiles wld change room size to compensate & vice versa. basically a picker of room px, tile px, and num tiles.
* mobile issues (ios)
* hmm I need to add a setting to turn off mouse controls since it breaks more unconventional games
* I also wonder, have you considered a more mobile friendly editor with vertically stacking collapsable tabs? I'd love to use bitsy on the go.
* Thank you, That would be very helpful. On iOS and android you could replace it with a swipe to move like @increpare's puzzlescript.
* finally inventory feature with branching becz it was so hard to do that now. If u can add the same sprite in diff scenes it will be great
* mailing list for game jams?
* Art: Non-english characters
* Yukon: Endings on sprites
* radiosoap: dialog portraits
* Edited: 1) variables 2) map of connected rooms 3) transparent avatar background
* Mimic: While working on the game, there were a few things I think would improve the editor. One would be the ability to copy sections within the map and paste it in other sections, so this would speed up tile placement. The second thing is the naming of the rooms and endings. It would have been nice to edit the names for the sake of organization. This as well as the ability to move the tiles in the find drawing window. Other then that, the editor helps make games quite quickly. :)
* zetef: I really did not thought about that, but it would be cool if in the future update you can change the player's speed in a specific room, or all the rooms. I enjoyed your tool!
* thetoolong: if a first time player of bitsy... and i like the top-down aspect. you should add more colors and some king of simple coding (like scratch) to make more complex games.
* saranomy: Is it possible to add a dialog to the exit itself? So, when player walks into exit (teleport tile), it will force player to read important messages before going to the next room. This feature will add dialog box into "exits" window in the editor.
* anoobus5 I was wondering if you could add a feature where you could link rooms, as creating 5-9 exits for each room gets tedious after a while.

? music (how)

NEW NOTES
- can't put ending on top of sprite (should you be able to? trigger ending by talking to sprite)
- a way to share tilesets would be cool

v3.4 to do
- show/hide animation on edit map

NEW TODO
- update TODOs from project and community
- draggable entrances
- iOS mobile bug
- android freezing bug
- ? default workspaces
- drawing selector
- aliases
- better gif async
- (publish gif library)

new usability ideas
- tiles in grid so you can see more
- Oh and possibly a way to "toggle" the placement of endings or exits, so you can put multiples of the same one in a room without having to scroll up and so down to select it each time

v3.1 bugs
- prev/next and tile preview don't work together (old bug)

editor UI problems to solve
- unusable on mobile
- gif UI is terrible and not findable
- prev / next buttons everywhere are a pain to use if you have a lot of stuff
- can't see all the tiles you want to work on
- dialog UI could be improved
- feedback for exits and ending creation is not good enough

v4 features
- refactor
	- modularize engine
		- engine
		- renderer
		- game-data
		- parser
		X font
	- modularize editor
		X exporter
		- ???
- re-do UI
	- think through ALL existing features and how they work together (or not)
	- make everything MORE VISIBLE


TODO NOW
- email leaf

v5 candidate features
- music / sfx tool
- room map
- fancier animations (transitions, arrow, walk?, etc)
- character pathing (why am I the only one that wants this???)

USABILITY THREAD
- bug: nasty corruption bug still exists
- bug: test things in firefox
- bug: (firefox?) if you write dialog after placing a sprite, the textfield clears itself (no repro)
- editable room names
- line breaks for dialog
- downloadable Bitsy (electron?)
- RPG mechanics: enemies, items???
- walls maintain wall status everywhere once checked (even when you add new rooms)
	- maybe needs a file format change: a universal wall specifier that can be overridden?
- music / sfx tool (bleepy bloopy piano track)
	- http://marcgg.com/blog/2016/11/01/javascript-audio/#
- dialog choices
- dialog "reply" from your character
- dialog changes with repetition
- dialog branching
- better support for side-scrolling games???? (e.g. gravity mode (jump? ramps? ladders?))
from laura michet
- map for rooms
- want to see all my tiles at once
- character limit on sprite dialog (sort of fixed with the dialog box textarea)

my ideas
- transition animations
- walking animations
- bobbing arrow animations
- dialog open close animations
- new pass on UI
- new dialog editor / preview pane
	- bigger dialog box textbox?

- BUG: after play mode, avatar ends up in wrong room
- name rooms, sprites, etc (esp rooms tho)
- make it show/hide exits, instead of "add" exits
- BUG: removing sprite from world doesn't work once you go back into playmode
- BUG: exit highlighting is on by default when engine starts up?
- ONGOING: decrease duplicate code between tile / sprites
- selection box? copy paste?
- would be cool to select sprites and then find out who they are / what they say?
- how do extra characters end up in the room maps?

now what?
- sharing features in the games
	- gif recording
	- linkbacks to editor
	- twitter api sharing
	- link to bitsy list

- add preview canvas for rooms
- the UI is getting cluttered :(
- is the skip dialog too easy? should I fast forward instead? use specific buttons? (maybe this should be playtested)

from twitter
- look at puzzlescript gist hosting of gamedata (from kool.tools)

- async gif processings (IN PROGRESS)
- undo / redo
- improve color input for browsers that only accept text
	- hash or no-hash hex
	- rgb with commas
- add instruction on publishing the game (itchio shoutout)

- bug: some sort of bad things happen when you delete room 0


TODO BACKLOG
- export straight to itchio (is there a developer api?)
- better icon for exits
- character paths

old ideas
	#shortcut to sets?
	#default tileset
	#clear tilemap
	#clear tileset
	? animate player movement
	? player face left/right
	?? bouncing arrow
	? sprite walking paths
	?? narrative blocks
	?? STRICT MODE where text can only fit on one page

- room transition animations

first bitsy tweet: https://twitter.com/adamledoux/status/787434344776241153
*/