<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Starfarer's Relay</title>
<style>
body { background:black; }
</style>
</head>
<body>
<script>
// Bitsy v7.12 game data
var exportedGameData = `
! BITSY VERSION 7.12

PAL 0
0,0,0
255,255,255
40,40,100
220,220,150

ROOMS 3
NAME Sector Alpha
0,0 1,0 1,0 1,0 1,0 1,0 1,0 1,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0

NAME Sector Beta
0,0 1,0 1,0 1,0 1,0 1,0 1,0 1,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0

NAME Sector Gamma
0,0 1,0 1,0 1,0 1,0 1,0 1,0 1,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0
0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0

TILES 2
0
00011000
00111100
01111110
01111110
01111110
00111100
00011000
00000000
1
11111111
10000001
10011001
10000001
10011001
10000001
11111111
00000000

SPRITES 4
A
00011000
00111100
01100110
01000010
01011010
01111110
00111100
00000000
NAME Starfarer
DLG startDialog
ROOM 0
POS 1,1

B
00011000
00111100
00100100
00111100
00100100
00111100
00011000
00000000
NAME AlphaTech
DLG alphaDialog
ROOM 0
POS 6,3

C
00111100
01000010
10011001
10011001
10011001
01000010
00111100
00000000
NAME BetaSyn
DLG betaDialog
ROOM 1
POS 3,4

D
00100100
01111110
11111111
11111111
11111111
01111110
00100100
00000000
NAME Core Guardian
DLG finalDialog
ROOM 2
POS 4,4

ITEMS 2
I shuttleCore
00001000
00011100
00101010
01000001
01000001
00101010
00011100
00001000
DLG gotCore

J beaconKey
00001000
00011100
00100010
01011101
01011101
00100010
00011100
00001000
DLG gotKey

ENDITEMS

DLG startDialog
"You've reached the Relay Outpost.  
Mission 1: Retrieve the lost Shuttle Core from Sector Alpha.  
Your journey begins."

DLG alphaDialog
"The malfunctioning drones hover anxiously.  
Task: Locate the Shuttle Core hidden in this sector."

DLG gotCore
"You recovered the Shuttle Core!  
Return to the Relay Outpost…  
…but the Beta Gate has opened. Proceed to Sector Beta."

DLG betaDialog
"Sector Beta hums with static storms.  
Task: Find the Beacon Key to activate the Gamma Jump."

DLG gotKey
"You found the Beacon Key!  
The path to Sector Gamma is unlocked."

DLG finalDialog
"The Core Guardian awakens.  
Final Quest: Present the Core and Beacon.  
A pause… then acceptance.  
'Sector stabilized. Starfarer, your duty is fulfilled.'  
—END—"

ENDDLG

END
`;
</script>
<script src="https://bitsy.org/engine/bitsy.js"></script>
</body>
</html>
