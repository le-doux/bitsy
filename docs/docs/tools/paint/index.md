# Paint

## Description

The paint tool is where you can create and edit all the objects in your game, such as people to interact with, items to pick up, and background decorations. 
All drawings can be edited and animated, and each category of drawing has additional behaviour, described in the sections below. 

To edit any drawing, click the pixels in the main paint canvas to toggle them on or off. All drawings use the 'background color' set up in the [colors tool](../color) as the background color. 
Then, tiles use the 'tiles color', and avatars, sprites, and items use the 'sprite color' as the foreground. 
Since you can put any of your drawings in any room, the background and foreground colors will update automatically depending on which room you are currently in. 

All the drawings you create can be found here by navigating through the tabs and arrow buttons at the top of the tool, but you can also access them from the [find tool](../find).

If you have the [room tool](../room) open, you can also hold alt + click on a drawing in the room to open it in the paint tool. 

### Avatar

The avatar is who you control when playing the game. Because Bitsy games are single player there is only one avatar in the game. 
However, you can optionally choose to use one of your sprites in each room in place of your avatar in [room settings](../room/roomSettings). 

### Tile

Tiles are used to decorate your rooms. You can create as many tiles as you like, and for each one you can place as many as you like in your rooms. 
Tiles can be set as 'wall', which means that the avatar is unable to walk through them. 

### Sprite

Sprites are people or objects in your game that you can talk to. You can give them [dialog](../dialog) that plays out when the avatar walks up to them. You can also assign a sound effect that plays when the dialog begins. 
You can create as many sprites as you like, however you can only have one version of each sprite in the game. 
So if for example you want two cats with their own dialog, you would need to create two separate cat sprites. 

### Item

Items are things that you can pick up. An in-game inventory will count the number of each type of item the avatar has collected, which you can then use in some of the advanced dialog settings, or as a condition for an exit or ending. You can place as many copies of an item as you like in each room.  

## Features

### Avatar paint

![avatar paint diagram](.images/paintDiagram01.JPG)

1. **Avatar name**. The name of the [avatar](../paint/#avatar) within the Bitsy editor. Used e.g. in the [find tool](../find). The avatar name cannot be changed.

2. **Find drawing button**. Opens the find tool on the avatar tab.

3. **Paint canvas**. Edit the currently selected drawing by clicking the pixels to toggle them on / off. Any changes are also updated immediately in the [room tool](../room).

4. **Show / hide grid**. Toggle a pixel grid on / off in the paint canvas. The grid is not displayed when playing the game.

5. **Avatar animation**. Opens the animation panel where you can edit two animation frames. Select frame 1 or frame 2 to edit it in the paint window. The preview shows how the animation will look when playing the game.


### Tile paint

![tile paint diagram](.images/paintDiagram02.JPG)

1. **Tile name**. The name of this current [tile](../paint/#tile) within the Bitsy editor. Used e.g. in the [find tool](../find).

2. **Previous / next tile buttons**. Navigate between all the tiles you have created.

3. **Add tile button**. Creates a new tile. The paint tool will automatically switch view to that tile.

4. **Duplicate tile button**. Creates a copy of the current tile. The paint tool will automatically switch view to that tile.

5. **Delete tile button**. Deletes the current tile. A warning message will display before permanent deletion.

6. **Find tile button**. Opens the find tool on the tile tab to display all the tiles you have created.

7. **Paint canvas**. Edit the currently selected tile by clicking the pixels to toggle them on / off. Any changes are also updated immediately in the [room tool](../room).

8. **Show / hide grid**. Toggle a pixel grid on / off in the paint canvas. The grid is not displayed when playing the game.

9. **Tile animation**. Opens the animation panel where you can edit two animation frames. Select frame 1 or frame 2 to edit it in the paint window. The preview shows how the animation will look when playing the game.


### Sprite paint

![sprite paint diagram](.images/paintDiagram03.JPG)

1. **Sprite name**. The name of this current [sprite](../paint/#sprite) within the Bitsy editor. Used e.g. in the [find tool](../find).

2. **Previous / next sprite buttons**. Navigate between all the sprites you have created.

3. **Add sprite button**. Creates a new sprite. The paint tool will automatically switch view to that sprite.

4. **Duplicate sprite button**. Creates a copy of the current sprite. The paint tool will automatically switch view to that sprite.

5. **Delete sprite button**. Deletes the current sprite. A warning message will display before permanent deletion.

6. **Find sprite button**. Opens the find tool on the sprite tab to display all the sprites you have created.

7. **Paint canvas**. Edit the currently selected sprite by clicking the pixels to toggle them on / off. Any changes are also updated immediately in the [room tool](../room).

8. **Show / hide grid**. Toggle a pixel grid on / off in the paint canvas. The grid is not displayed when playing the game.

9. **Sprite dialog**. The [dialog](../dialog) that is displayed when the player walks into this sprite.

10. **Sprite animation**. Opens the animation panel where you can edit two animation frames. Select frame 1 or frame 2 to edit it in the paint window. The preview shows how the animation will look when playing the game.

11. **Sound effect button**. Choose a [blip sound effect](../blipomatic) that will play when the player walks into this sprite. Choose none if you do not want a sound effect.

12. **Dialog selection toggle**. Click this button to show a dropdown menu of all the dialogs you have created. Clicking it again will allow you to edit the current dialog.

13. **Dialog editor button**. Opens the dialog tool for more advanced dialog options.


### Item paint

![item paint diagram](.images/paintDiagram04.JPG)

1. **Item name**. The name of this current [item](../paint/#item) within the Bitsy editor. Used e.g. in the [find tool](../find).

2. **Previous / next item buttons**. Navigate between all the items you have created.

3. **Add item button**. Creates a new item. The paint tool will automatically switch view to that item.

4. **Duplicate item button**. Creates a copy of the current item. The paint tool will automatically switch view to that item.

5. **Delete item button**. Deletes the current item. A warning message will display before permanent deletion.

6. **Find item button**. Opens the find tool on the item tab to display all the items you have created.

7. **Paint canvas**. Edit the currently selected sprite by clicking the pixels to toggle them on / off. Any changes are also updated immediately in the [room tool](../room).

8. **Show / hide grid**. Toggle a pixel grid on / off in the paint canvas. The grid is not displayed when playing the game.

9. **Item dialog**. The [dialog](../dialog) that is displayed when the player walks into this item.

10. **Item animation**. Opens the animation panel where you can edit two animation frames. Select frame 1 or frame 2 to edit it in the paint window. The preview shows how the animation will look when playing the game.

11. **Sound effect button**. Choose a [blip sound effect](../blipomatic) that will play when the player walks into this item. Choose none if you do not want a sound effect.

12. **Open inventory**. Opens the [inventory tool](/tools/inventory/).

13. **Dialog selection toggle**. Click this button to show a dropdown menu of all the dialogs you have created. Clicking it again will allow you to edit the current dialog.

14. **Dialog editor button**. Opens the dialog tool for more advanced dialog options.