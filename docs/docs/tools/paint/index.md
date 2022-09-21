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

For details of the individual paint features, please refer to the following pages:

- [avatar paint](/tools/paint/avatarPaint)
- [tile paint](/tools/paint/tilePaint)
- [sprite paint](/tools/paint/spritePaint)
- [item paint](/tools/paint/itemPaint)