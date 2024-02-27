# How to Make a Locked Door

There are many different variations of a locked door. This guide will explain the basics.

<img width="400" alt="demo_gif" src="https://github.com/le-doux/bitsy/assets/15849522/77eee9fa-bc19-4d2b-a8d9-0e8d9f5390b6">

(In this example, the door is not open to you unless you have a membership id card.)

### Step 1 
To start, open the room view and place objects around as you like. In this example, the cat will function as our locked door. The membership id card is the key. Note that the card is an "item" and we have changed its name to "card".

<img width="400" alt="room_view" src="https://github.com/le-doux/bitsy/assets/15849522/585ca8e1-998a-46db-94bf-768a4826ae22">


### Step 2
Select exits & endings in the room view, and open the exits & endings tools if it's not already open (click the little arrow next to it). Create an exit, and place an entrance and exit before and after your locked door. You may also place these in different rooms depending on your game. Click the gear for the first exit to add logic for the locked door.

<img width="400" alt="exit_one" src="https://github.com/le-doux/bitsy/assets/15849522/9d2de816-fdb8-41b6-bc10-c146e80f2e22">


### Step 3
With the gear selected in the exits & endings tool, you can click "+ add lock". This will populate the dialogue editor with some simple logic for your locked door.

<img width="200" alt="exit_ending"  src= "https://github.com/le-doux/bitsy/assets/15849522/41204217-9d91-48b2-9b48-5513c47e0908">


### Step 4 
In the dialogue editor, you can write specific text and logic for when the player has the key and when they do not have the key. You can adjust the logic depending on the needs of your game. In this example, notice that we set the specific item to be "card" and the player must have at least one of them.

<img width="200" alt="dialogue_editor"  src="https://github.com/le-doux/bitsy/assets/15849522/4770f100-334d-4196-a7a7-d6455765969a">
<img width="200" alt="dialogue_editor_two"  src="https://github.com/le-doux/bitsy/assets/15849522/d8f54561-e968-448d-aff2-4845fcc131ac">
