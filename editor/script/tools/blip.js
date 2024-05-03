// todo : is this the right place for this function to live?
function makeBlipTile(soundPlayer, blipId, invert) {
	// todo : should this go in a utility file?
	function toPixelIndex(x, y) {
		return (y * bitsy.TILE_SIZE) + x;
	}

	var blipSamples = soundPlayer.sampleBlip(blip[blipId], 8);
	var c1 = invert ? 16 : 18;
	var c2 = invert ? 18 : 16;
	var tId = bitsy.tile();

	for (var i = 0; i < bitsy.TILE_SIZE * bitsy.TILE_SIZE; i++) {
		bitsy.set(tId, i, c2);
	}

	// draw waveform
	for (var i = 0; i < blipSamples.frequencies.length; i++) {
		var freq = 1 + Math.floor(blipSamples.frequencies[i] * 4);
		for (var j = 0; j < freq; j++) {
			bitsy.set(tId, toPixelIndex(i, 3 - j), c1);
			bitsy.set(tId, toPixelIndex(i, 4 + j), c1);
		}
	}

	return tId;
}

function makeBlipTool() {
	return makeToolCard("blip", function(tool) {
		tool.id = "blip";

		// todo : how do I feel about these being functions? should I rename the property?
		tool.name = function() {
			return localization.GetStringOrFallback("blip_sfx", "blip");
		};

		tool.icon = "blip";
		tool.size = "s";
		tool.data = "BLIP";
		tool.worldData = "blip.bitsy";
		tool.insertBefore = "findCheck";
		tool.aboutPage = "./tools/blip";

		tool.soundPlayer = new SoundPlayer();
		tool.soundPlayer.tag = "blip_tool"; // for debugging

		var selectedId = null;

		var BlipGenerator = {
			NONE : -1,
			PICKUP : 0,
			GREET : 1,
			BLOOP : 2,
			BLEEP : 3,
			MAGIC : 4,
			MEOW : 5,
			RANDOM : 6,
			MUTATE : 7,
			COUNT : 8,
		};

		var blipNames = ["pick up", "greeting", "bloop", "bleep", "magic", "meow", "random", "mutate"];
		var blipDescriptions = [
			"sounds an item might make when you pick it up",
			"sounds a sprite could say hello with",
			"lower pitched, rounder sounds",
			"higher pitched, tinnier sounds",
			"weird sounds",
			"I'm a cat",
			"who knows???",
			"make a new blip from the selected one, with random tweaks"
		];

		var curGenerator = BlipGenerator.PICKUP;
		var blipPreviewTileId = null;

		function randInt(min, max) {
			var val = min + Math.floor((max - min) * Math.random());
			return val;
		}

		// keep blip time parameters within a reasonable range (unit is milliseconds)
		function clampBlipParam(val) {
			var val = Math.max(Math.min(val, 480), 32);
			return val;
		}

		function generate() {
			var curBlip = blip[selectedId];

			switch (curGenerator) {
				case BlipGenerator.PICKUP:
					var oct = randInt(Octave[3], Octave.COUNT);
					curBlip.pitchA = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					curBlip.pitchB = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					curBlip.pitchC = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					curBlip.envelope.attack = randInt(64, 128);
					curBlip.envelope.decay = randInt(64, 128);
					curBlip.envelope.sustain = randInt(2, 10);
					curBlip.envelope.length = randInt(64, 192);
					curBlip.envelope.release = randInt(64, 160);
					curBlip.beat.time = randInt(32, 96);
					curBlip.beat.delay = 0;
					curBlip.instrument = randInt(SquareWave.P8, SquareWave.COUNT);
					curBlip.doRepeat = false;
					break;
				case BlipGenerator.GREET:
					var oct = randInt(Octave[2], Octave.COUNT);
					curBlip.pitchA = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					curBlip.pitchB = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					curBlip.pitchC = { beats: 0, note : Note.C, octave : Octave[4], };
					curBlip.envelope.attack = randInt(64, 128);
					curBlip.envelope.decay = randInt(64, 128);
					curBlip.envelope.sustain = randInt(2, 10);
					curBlip.envelope.length = randInt(64, 192);
					curBlip.envelope.release = randInt(64, 160);
					curBlip.beat.time = randInt(32, 96);
					curBlip.beat.delay = 0;
					curBlip.instrument = randInt(SquareWave.P8, SquareWave.COUNT);
					curBlip.doRepeat = false;
					break;
				case BlipGenerator.BLOOP:
					curBlip.pitchA = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : Octave[2], };
					curBlip.pitchB = { beats: 0, note : Note.C, octave : Octave[4], };
					curBlip.pitchC = { beats: 0, note : Note.C, octave : Octave[4], };
					curBlip.envelope.attack = randInt(0, 64);
					curBlip.envelope.decay = randInt(0, 64);
					curBlip.envelope.sustain = randInt(2, 10);
					curBlip.envelope.length = randInt(32, 128);
					curBlip.envelope.release = randInt(0, 64);
					curBlip.beat.time = 0;
					curBlip.beat.delay = 0;
					curBlip.instrument = SquareWave.P2;
					curBlip.doRepeat = false;
					break;
				case BlipGenerator.BLEEP:
					var oct = randInt(Octave[4], Octave.COUNT - 1);
					curBlip.pitchA = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					curBlip.pitchB = { beats: 0, note : Note.C, octave : Octave[4], };
					curBlip.pitchC = { beats: 0, note : Note.C, octave : Octave[4], };
					curBlip.envelope.attack = randInt(0, 64);
					curBlip.envelope.decay = randInt(0, 64);
					curBlip.envelope.sustain = randInt(2, 10);
					curBlip.envelope.length = randInt(32, 128);
					curBlip.envelope.release = randInt(0, 64);
					curBlip.beat.time = 0;
					curBlip.beat.delay = 0;
					curBlip.instrument = randInt(SquareWave.P8, SquareWave.P2);
					curBlip.doRepeat = false;
					break;
				case BlipGenerator.MAGIC:
					curBlip.pitchA = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : randInt(Octave[2], Octave.COUNT), };
					curBlip.pitchB = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : randInt(Octave[2], Octave.COUNT), };
					curBlip.pitchC = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : randInt(Octave[2], Octave.COUNT), };
					curBlip.envelope.attack = randInt(64, 256);
					curBlip.envelope.decay = randInt(64, 256);
					curBlip.envelope.sustain = randInt(2, 10);
					curBlip.envelope.length = randInt(64, 256);
					curBlip.envelope.release = randInt(64, 256);
					curBlip.beat.time = randInt(32, 160);
					curBlip.beat.delay = randInt(32, 192);
					curBlip.instrument = randInt(SquareWave.P8, SquareWave.COUNT);
					curBlip.doRepeat = Math.random() > 0.33;
					break;
				case BlipGenerator.MEOW:
					var oct = randInt(Octave[4], Octave.COUNT);
					curBlip.pitchA = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					curBlip.pitchB = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, };
					// sometimes throw in a third pitch to spice things up
					curBlip.pitchC = (Math.random() > 0.75)
						? { beats: 1, note : randInt(Note.C, Note.COUNT), octave : oct, }
						: { beats: 0, note : Note.C, octave : Octave[4], };
					curBlip.envelope.attack = randInt(32, 96);
					curBlip.envelope.decay = randInt(64, 128);
					curBlip.envelope.sustain = randInt(2, 10);
					curBlip.envelope.length = randInt(64, 192);
					curBlip.envelope.release = randInt(64, 160);
					curBlip.beat.time = randInt(32, 64);
					curBlip.beat.delay = randInt(32, 128);
					curBlip.instrument = randInt(SquareWave.P8, SquareWave.COUNT);
					curBlip.doRepeat = Math.random() > 0.75;
					break;
				case BlipGenerator.RANDOM:
					curBlip.pitchA = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : randInt(Octave[2], Octave.COUNT), };
					curBlip.pitchB = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : randInt(Octave[2], Octave.COUNT), };
					curBlip.pitchC = { beats: 1, note : randInt(Note.C, Note.COUNT), octave : randInt(Octave[2], Octave.COUNT), };
					curBlip.envelope.attack = randInt(0, 480);
					curBlip.envelope.decay = randInt(0, 480);
					curBlip.envelope.sustain = randInt(0, 15);
					curBlip.envelope.length = randInt(0, 480);
					curBlip.envelope.release = randInt(0, 480);
					curBlip.beat.time = randInt(0, 480);
					curBlip.beat.delay = randInt(0, 480);
					curBlip.instrument = randInt(SquareWave.P8, SquareWave.COUNT);
					curBlip.doRepeat = Math.random() > 0.5;
					break;
				case BlipGenerator.MUTATE:
					curBlip.pitchA = adjustPitch(curBlip.pitchA, randInt(-2, 2));
					curBlip.pitchB = adjustPitch(curBlip.pitchB, randInt(-2, 2));
					curBlip.pitchC = adjustPitch(curBlip.pitchC, randInt(-2, 2));
					// todo : greater range for these?
					curBlip.envelope.length = clampBlipParam(curBlip.envelope.length + randInt(-64, 64));
					curBlip.beat.time = clampBlipParam(curBlip.beat.time + randInt(-64, 64));
					curBlip.beat.delay = clampBlipParam(curBlip.beat.delay + randInt(-64, 64));
					break;
			}

			tool.soundPlayer.playBlip(curBlip);
			blipPreviewTileId = null;
		}

		// feels hacky to duplicate this from engine
		function drawRoom(roomName) {
			var roomId = tool.world.names.room[roomName];
			var room = tool.world.room[roomId];

			for (var y = 0; y < mapsize; y++) {
				for (var x = 0; x < mapsize; x++) {
					var tileId = room.tilemap[y][x];
					if (tileId != "0") {
						var tile = tool.world.tile[tileId];
						var frame = tool.renderer.GetDrawingFrame(tile, 0);
						setTile(bitsy.MAP1, x, y, frame);
					}
				}
			}
		}

		// copied from tune tool
		function draw(tileName, x, y, map) {
			map = (map != undefined) ? map : bitsy.MAP1;
			var tileId = tool.world.names.tile[tileName];
			var tile = tool.world.tile[tileId];
			var frame = tool.renderer.GetDrawingFrame(tile, 0);
			setTile(map, x, y, frame);
		}

		// also copied from tune tool
		var octaveTileNames = ["oct2", "oct3", "oct4", "oct5"];

		var prevIsMouseDown = false;
		var prevPlayMode = false;

		var blipSamples = null;

		function copyBlip(srcId, destId) {
			blip[destId].pitchA = blip[srcId].pitchA;
			blip[destId].pitchB = blip[srcId].pitchB;
			blip[destId].pitchC = blip[srcId].pitchC;
			blip[destId].envelope.attack = blip[srcId].envelope.attack;
			blip[destId].envelope.decay = blip[srcId].envelope.decay;
			blip[destId].envelope.sustain = blip[srcId].envelope.sustain;
			blip[destId].envelope.length = blip[srcId].envelope.length;
			blip[destId].envelope.release = blip[srcId].envelope.release;
			blip[destId].beat.time = blip[srcId].beat.time;
			blip[destId].beat.delay = blip[srcId].beat.delay;
			blip[destId].instrument = blip[srcId].instrument;
			blip[destId].doRepeat = blip[srcId].doRepeat;
		}

		var isPaletteLoaded = false;
		var redrawBackground = true;
		var redrawForeground = true;
		var prevBlipState = null;

		tool.loop = function(dt) {
			if (!isPaletteLoaded) {
				bitsy.log("load palette");
				updatePaletteWithTileColors(tool.world.palette["0"].colors);
				isPaletteLoaded = true;
			}

			if (!isPlayMode) {
				tool.soundPlayer.update(dt);
			}

			tool.mouse.tooltip("tap to play blip!");
			var isMouseDown = tool.mouse.down();
			var mousePos = tool.mouse.pos();
			var tilePos = {
				x: Math.floor(mousePos.x / tilesize),
				y: Math.floor(mousePos.y / tilesize),
			};

			bitsy.graphicsMode(bitsy.GFX_MAP);

			if (redrawBackground) {
				bitsy.log("draw blip bg");
				for (var y = 0; y < 16; y++) {
					for (var x = 0; x < 16; x++) {
						draw("dot", x, y);
					}
				}
				redrawBackground = false;
			}

			if (selectedId != null) {
				var curBlip = blip[selectedId];

				if (curBlip) {
					if (blipPreviewTileId === null) {
						blipPreviewTileId = makeBlipTile(tool.soundPlayer, selectedId, false);
						redrawForeground = true;
					}

					// todo: is it bad to do this every frame?
					var lengthNorm = Math.min(curBlip.envelope.length / 480, 1);
					var sampleCount = 2 + (2 * Math.ceil(7 * lengthNorm));
					blipSamples = tool.soundPlayer.sampleBlip(curBlip, sampleCount);

					// draw waveform
					if (blipSamples != null) {
						// use the current playing blip progress to animate playback
						var curSampleIndex = -1;
						var blipState = tool.soundPlayer.getBlipState();
						// bitsy.log(blipState);
						if (blipState != null && blipState.blip.id === selectedId) {
							var blipProgress = blipState.timer / blipState.duration;
							curSampleIndex = Math.floor(blipProgress * blipSamples.frequencies.length);

							// redraw while animating
							redrawForeground = true;
						}
						else if (prevBlipState != null && blipState === null) {
							// also redraw once after animating
							redrawForeground = true;
						}

						prevBlipState = blipState;

						if (redrawForeground) {
							bitsy.fill(bitsy.MAP2, 0);

							var offsetX = Math.floor((16 - blipSamples.frequencies.length) / 2);
							for (var i = 0; i < blipSamples.frequencies.length; i++) {
								var peak = 1;
								peak += (blipSamples.frequencies[i] * 5);
								peak += (blipSamples.amplitudes[i] * 2);
								peak = Math.floor(peak);
								for (var j = 0; j < peak; j++) {
									if (j === (peak - 1)) {
										draw(i == curSampleIndex ? "wave_t2" : "wave_t", offsetX + i, 7 - j, bitsy.MAP2);
										draw(i == curSampleIndex ? "wave_b2" : "wave_b", offsetX + i, 8 + j, bitsy.MAP2);
									}
									else {
										draw(i == curSampleIndex ? "wave_m2" : "wave_m", offsetX + i, 7 - j, bitsy.MAP2);
										draw(i == curSampleIndex ? "wave_m2" : "wave_m", offsetX + i, 8 + j, bitsy.MAP2);
									}
								}
							}

							setTile(bitsy.MAP2, 15, 0, blipPreviewTileId);

							redrawForeground = false;
						}
					}

					// tap to preview sound
					if (isMouseDown && !prevIsMouseDown) {
						tool.soundPlayer.playBlip(curBlip);
					}
				}
			}

			prevIsMouseDown = isMouseDown;
			prevPlayMode = isPlayMode;

			return true;
		};

		tool.menuUpdate = function() {
			if (selectedId === undefined || selectedId === null || blip[selectedId] === undefined) {
				return;
			}

			var curBlip = blip[selectedId];

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "button",
				icon: "play",
				// text: localization.GetStringOrFallback("play_game", "play"),
				description: "play blip",
				onclick : function(e) {
					tool.soundPlayer.playBlip(curBlip);
				},
			});

			tool.menu.push({
				control: "label",
				text: localization.GetStringOrFallback("blip_tool", "blip-o-matic"),
				description: "sound generator for regenerating or adding blips (" + blipNames[curGenerator] + ": " + blipDescriptions[curGenerator] + ")"
			});

			// todo : I don't need to generate these each time do I?
			var blipTypeOptions = []
			for (var i = BlipGenerator.NONE + 1; i < BlipGenerator.COUNT; i++) {
				blipTypeOptions.push({ text: blipNames[i], description: blipDescriptions[i], value: i });
			}

			tool.menu.push({
				control: "select",
				description: "select sound effect category",
				name: "blipRandomType",
				value: curGenerator,
				options: blipTypeOptions,
				onchange: function(e) {
					curGenerator = parseInt(e.target.value);
				}
			});

			tool.menu.push({
				control: "button",
				icon: "blip",
				description: "regenerate blip",
				onclick : function(e) {
					generate()
				},
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				icon: "tune",
				text: localization.GetStringOrFallback("blip_pitch", "pitch"),
				description: "adjust the pitch"
			});
			tool.menu.push({
				control: "button",
				icon: "arrow_down",
				description: "lower pitch",
				enabled: !(isMinPitch(curBlip.pitchA) || isMinPitch(curBlip.pitchB) || isMinPitch(curBlip.pitchC)),
				onclick : function() {
					curBlip.pitchA = adjustPitch(curBlip.pitchA, -1);
					curBlip.pitchB = adjustPitch(curBlip.pitchB, -1);
					curBlip.pitchC = adjustPitch(curBlip.pitchC, -1);
					tool.soundPlayer.playBlip(curBlip);
					refreshGameData();
					blipPreviewTileId = null;
				}
			});
			tool.menu.push({
				control: "button",
				icon: "arrow_up",
				description: "higher pitch",
				enabled: !(isMaxPitch(curBlip.pitchA) || isMaxPitch(curBlip.pitchB) || isMaxPitch(curBlip.pitchC)),
				onclick : function() {
					curBlip.pitchA = adjustPitch(curBlip.pitchA, 1);
					curBlip.pitchB = adjustPitch(curBlip.pitchB, 1);
					curBlip.pitchC = adjustPitch(curBlip.pitchC, 1);
					tool.soundPlayer.playBlip(curBlip);
					refreshGameData();
					blipPreviewTileId = null;
				}
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				icon: "play",
				text: localization.GetStringOrFallback("general_length", "length"),
				description: "adjust the total play time (duration)"
			});
			tool.menu.push({
				control: "button",
				icon: "sub",
				description: "shorter",
				enabled: curBlip.envelope.length > 32,
				onclick: function() {
					curBlip.envelope.length = clampBlipParam(curBlip.envelope.length - 32);
					tool.soundPlayer.playBlip(curBlip);
					refreshGameData();
					blipPreviewTileId = null;
				}
			});
			tool.menu.push({
				control: "button",
				icon: "add",
				description: "longer",
				enabled: curBlip.envelope.length < 480,
				onclick: function() {
					curBlip.envelope.length = clampBlipParam(curBlip.envelope.length + 32);
					tool.soundPlayer.playBlip(curBlip);
					refreshGameData();
					blipPreviewTileId = null;
				}
			});
			tool.menu.pop({ control: "group" });

			tool.menu.push({ control: "group" });
			tool.menu.push({
				control: "label",
				icon: "tempo_fast",
				text: localization.GetStringOrFallback("general_speed", "speed"),
				description: "adjust the time between each pitch change"
			});
			tool.menu.push({
				control: "button",
				icon: "sub",
				description: "slower",
				enabled: curBlip.beat.time < 480,
				onclick: function() {
					curBlip.beat.time = clampBlipParam(curBlip.beat.time + 32);
					tool.soundPlayer.playBlip(curBlip);
					refreshGameData();
					blipPreviewTileId = null;
				}
			});
			tool.menu.push({
				control: "button",
				icon: "add",
				description: "faster",
				enabled: curBlip.beat.time > 32,
				onclick: function() {
					curBlip.beat.time = clampBlipParam(curBlip.beat.time - 32);
					tool.soundPlayer.playBlip(curBlip);
					refreshGameData();
					blipPreviewTileId = null;
				}
			});
			tool.menu.pop({ control: "group" });
		};

		tool.onSelect = function(id) {
			selectedId = id;
			blipPreviewTileId = null;
			redrawForeground = true;
		};

		tool.add = function() {
			var nextId = "1"; // hacky way to specify the default id..
			var idList = sortedBase36IdList(blip);
			if (idList.length > 0) {
				nextId = nextObjectId(idList);
			}

			blip[nextId] = createBlipData(nextId);

			// when mutating, copy the current blip data into the new one so
			// we can start with that and then randomly tweak it a little
			if (curGenerator === BlipGenerator.MUTATE) {
				copyBlip(selectedId, nextId);
			}

			selectedId = nextId;
			blip[selectedId].name = CreateDefaultName(blipNames[curGenerator], blip);
			generate();
		};

		tool.duplicate = function(id) {
			var nextId = nextObjectId(sortedBase36IdList(blip));
			blip[nextId] = createBlipData(nextId);
			copyBlip(selectedId, nextId);
			selectedId = nextId;
		};

		tool.delete = function(id) {
			if (sortedBase36IdList(blip).length <= 1) {
				alert("you can't delete your last blip!");
				return;
			}

			delete blip[id];
		};

		tool.onGameDataChange = function() {
			// force render refresh // todo : need to think about the architecture of sharing renderers
			if (tool && tool.renderer) {
				tool.renderer.ClearCache(false);
				blipPreviewTileId = null;
			}
		};
	});
}