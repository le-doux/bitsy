function makeTuneTool() {
	return makeToolCard("tune", function(tool) {
		tool.id = "tune";

		// todo : how do I feel about these being functions? should I rename the property?
		tool.name = function() {
			return localization.GetStringOrFallback("tune_tool", "tune");
		};

		tool.icon = "tune";
		tool.size = "m";
		tool.data = "TUNE"; // todo : what's the right naming convention?
		tool.worldData = "tune.bitsy"; // todo : is "world" a confusing name?
		tool.insertBefore = "findCheck"; // todo : name of option?
		tool.aboutPage = "./tools/tune";

		// todo : do something to re-enable the live preview?
		// trying out giving each tool its own sound player
		tool.soundPlayer = new SoundPlayer();
		tool.soundPlayer.tag = "tune_tool"; // for debugging

		var Menu = {
			COMPOSE: 0,
			INSTRUMENT: 1,
			STYLE: 2
		};
		var curMenu = Menu.COMPOSE;

		var NOTE_EDIT = {
			NONE : -1,
			ADD : 0,
			REMOVE : 1,
		};

		var NOTE_TYPE = {
			NOTE : 0,
			BLIP : 1,
		};

		var curTuneId = "0";
		var curBarIndex = 0;
		var isMelody = true;

		var curEditMode = NOTE_EDIT.NONE;
		var curNoteMode = NOTE_TYPE.NOTE;

		var isMusicPlaying = false;
		var isBarLooping = false;

		var staffY = 14;
		var octaveY = 15;
		var addBarX = 9;
		var barSelectX = 0;

		var melodyBarTileIds = null;
		var harmonyBarTileIds = null;
		var blipTileIds = [];
		var blipInvertedTileIds = [];

		var octaveTileNames = ["oct2", "oct3", "oct4", "oct5"];
		var arpeggioPatternIcons = ["arp_off", "arp_up", "arp_dwn", "arp_int5", "arp_int8"];

		var noteEdit = {
			startIndex: null,
			endIndex: null,
			curNoteId: null,
		};

		var prevPlayMode = false;
		var prevIsMouseDown = false;

		/* KEYS */
		var MusicalKey = {
			UNKNOWN: 0,
			MAJOR_PENTATONIC: 1,
			MINOR_PENTATONIC: 2,
			MAJOR_DIATONIC: 3,
			MINOR_DIATONIC: 4,
			CHROMATIC: 5
		};
		var keyNames = ["unknown", "major", "minor", "full major", "full minor", "chromatic"];
		var keyDescriptions = ["please select a key", "C major pentatonic", "C minor pentatonic", "C major diatonic", "C minor diatonic", "full keyboard"];

		// c major key notes
		var majorNotes = [Note.C, Note.D, Note.E, Note.F, Note.G, Note.A, Note.B];
		// c minor key notes
		var minorNotes = [Note.C, Note.D, Note.D_SHARP, Note.F, Note.G, Note.G_SHARP, Note.A_SHARP];

		// scales
		var pentatonicScale = [Solfa.D, Solfa.R, Solfa.M, Solfa.S, Solfa.L];
		var diatonicScale = [Solfa.D, Solfa.R, Solfa.M, Solfa.F, Solfa.S, Solfa.L, Solfa.T];

		var keys = [];
		keys[MusicalKey.MAJOR_PENTATONIC] = { notes: majorNotes, scale: pentatonicScale };
		keys[MusicalKey.MINOR_PENTATONIC] = { notes: minorNotes, scale: pentatonicScale };
		keys[MusicalKey.MAJOR_DIATONIC] = { notes: majorNotes, scale: diatonicScale };
		keys[MusicalKey.MINOR_DIATONIC] = { notes: minorNotes, scale: diatonicScale };

		var curKeyId = MusicalKey.UNKNOWN;

		function getKeyId(key) {
			for (var k in MusicalKey) {
				var id = MusicalKey[k];

				// can't match unknown or chromatic
				if (id === MusicalKey.UNKNOWN || id === MusicalKey.CHROMATIC) {
					continue;
				}

				// check that both keys have the same number of scale degrees
				if (key.scale.length != keys[id].scale.length) {
					continue;
				}

				// check for exact match of notes & scale degrees
				var isMatch = true;

				for (var i = 0; i < key.notes.length; i++) {
					if (key.notes[i] != keys[id].notes[i]) {
						isMatch = false;
					}
				}

				for (var i = 0; i < key.scale.length; i++) {
					if (key.scale[i] != keys[id].scale[i]) {
						isMatch = false;
					}
				}

				if (isMatch) {
					return id;
				}
			}

			// if there are no matches, return unknown
			return MusicalKey.UNKNOWN;
		}

		function getScaleNotes(key) {
			var keyScale = [];
			for (var note = Solfa.D; note < Solfa.COUNT; note++) {
				if (key.scale.indexOf(note) > -1) {
					keyScale.push(key.notes[note]);
				}
			}
			return keyScale;
		}

		function convertToChromatic(tune) {
			for (var i = 0; i < tune.melody.length; i++) {
				for (var j = 0; j < barLength; j++) {
					if (tune.melody[i][j].beats > 0) {
						var scaleDegree = tune.melody[i][j].note;
						tune.melody[i][j].note = tune.key.notes[scaleDegree];
					}

					if (tune.harmony[i][j].beats > 0) {
						var scaleDegree = tune.harmony[i][j].note;
						tune.harmony[i][j].note = tune.key.notes[scaleDegree];
					}
				}
			}

			tune.arpeggioPattern = ArpeggioPattern.OFF;
			tune.key = null;
		}

		function copyKey(key) {
			return {
				notes: key.notes.slice(),
				scale: key.scale.slice()
			};
		}

		function convertToKey(tune, key) {
			for (var i = 0; i < tune.melody.length; i++) {
				for (var j = 0; j < barLength; j++) {
					if (tune.melody[i][j].beats > 0) {
						var scaleDegree = key.notes.indexOf(tune.melody[i][j].note);
						if (scaleDegree != -1 && key.scale.indexOf(scaleDegree) != -1) {
							tune.melody[i][j].note = scaleDegree;
						}
						else {
							tune.melody[i][j].beats = 0;
						}
					}

					if (tune.harmony[i][j].beats > 0) {
						var scaleDegree = key.notes.indexOf(tune.harmony[i][j].note);
						if (scaleDegree != -1 && key.scale.indexOf(scaleDegree) != -1) {
							tune.harmony[i][j].note = scaleDegree;
						}
						else {
							tune.harmony[i][j].beats = 0;
						}
					}
				}
			}

			tune.key = copyKey(key);
		}

		function closestNoteInKey(noteId, key) {
			// high note!
			if (noteId >= Note.COUNT) {
				return Note.COUNT;
			}

			if (key != null) {
				var keyScale = getScaleNotes(key);
				var closestNote = null;
				for (var i = 0; i < keyScale.length; i++) {
					var isClosest = (closestNote === null) ||
						Math.abs(keyScale[i] - noteId) < Math.abs(keyScale[closestNote] - noteId);

					if (isClosest) {
						closestNote = i;
					}
				}

				return keyScale[closestNote];
			}

			return noteId;
		}

		function setNote(beatIndex, noteId, options) {
			var bar = isMelody
				? tune[curTuneId].melody[curBarIndex]
				: tune[curTuneId].harmony[curBarIndex];
			var key = tune[curTuneId].key;
			var isSolfa = (key != null);

			var beats = options.beats ? options.beats : 1;

			eraseNotesInRange(beatIndex, beatIndex + beats - 1);

			// test for high notes and keep note in range
			var octaveOffset = (noteId >= Note.COUNT) ? 1 : 0;
			noteId = (noteId % Note.COUNT);

			// set octave
			if (isMelody) {
				bar[beatIndex].octave = Octave[4] + octaveOffset;
			}
			else {
				bar[beatIndex].octave = Octave[2] + octaveOffset;
			}

			// update note
			bar[beatIndex].beats = beats;
			if (isSolfa) {
				// solfa mode
				var solfaNoteId = key.notes.indexOf(noteId);
				if (solfaNoteId != -1 && key.scale.indexOf(solfaNoteId) != -1) {
					bar[beatIndex].note = solfaNoteId;
				}
			}
			else {
				// chromatic mode
				bar[beatIndex].note = noteId;
			}

			// update effect
			if (options.noteMode && options.noteMode === NOTE_TYPE.BLIP) {
				bar[beatIndex].blip = blipTool.getSelected();
				blipTileIds[beatIndex] = undefined;
				blipInvertedTileIds[beatIndex] = undefined;
			}
			else if (bar[beatIndex].blip != undefined) {
				bar[beatIndex].blip = undefined;
			}

			// play note
			if (options.noteMode && options.noteMode === NOTE_TYPE.BLIP) {
				tool.soundPlayer.playBlip(blip[blipTool.getSelected()], { pitch: bar[beatIndex] });
			}
			else {
				tool.soundPlayer.playNote(
					{ beats: 2, note: bar[beatIndex].note, octave: bar[beatIndex].octave, },
					isMelody ? tune[curTuneId].instrumentA : tune[curTuneId].instrumentB,
					bitsy.SOUND1,
					key);
			}

			refreshGameData();

			redrawForeground = true;
			redrawBarTiles = true;
		}

		function setArpeggioTonic(pitch) {
			if (!tune[curTuneId] || isMelody) {
				return NOTE_EDIT.NONE;
			}

			var bar = tune[curTuneId].harmony[curBarIndex];
			var shouldClearArpeggio = !(bar[0].beats <= 0 || bar[0].note != pitch.note || bar[0].octave != pitch.octave);

			// clear bar
			for (var i = 0; i < barLength; i++) {
				bar[i].beats = 0;
			}

			if (!shouldClearArpeggio) {
				// set tonic
				bar[0] = pitch;
			}

			if (!isMusicPlaying) {
				tool.soundPlayer.playTune(
					tune[curTuneId],
					{ barIndex: curBarIndex, beatCount: 8, melody: false, });
			}

			refreshGameData();

			redrawBarTiles = true;

			// disable click and drag for arpeggios
			return NOTE_EDIT.NONE;
		}

		// menu
		function menuUpdate() {
			if (!tune[curTuneId]) {
				return;
			}

			// playback & tune length controls
			tool.menu.push({ control: "group" });

			tool.menu.push({
				control: "toggle",
				icon: isMusicPlaying
					? "stop"
					: "play",
				text: isMusicPlaying
					? localization.GetStringOrFallback("stop_game", "stop")
					: localization.GetStringOrFallback("play_game", "play"),
				description: "play tune from selected bar",
				id: "tunePlayToggle",
				checked : isMusicPlaying,
				onclick : function(e) {
					isMusicPlaying = e.target.checked;
					if (isMusicPlaying) {
						tool.soundPlayer.playTune(tune[curTuneId], { barIndex: curBarIndex, loop: isBarLooping });
					}
					else {
						tool.soundPlayer.stopTune();
					}
				},
			});

			tool.menu.push({
				control: "toggle",
				icon : "loop",
				text : "loop",
				description : "repeat current bar",
				id : "tuneLoopToggle", // hacky
				checked : isBarLooping,
				onclick : function(e) {
					isBarLooping = e.target.checked;

					if (isMusicPlaying) {
						tool.soundPlayer.setLooping(isBarLooping);
					}
				},
			});

			tool.menu.push({
				control: "label",
				icon: isMelody ? "instrument_melody" : "instrument_harmony",
				text: localization.GetStringOrFallback("tune_bar", "bar") + " " + (curBarIndex + 1) + " / " + tune[curTuneId].melody.length,
				description: "selected bar: " + (curBarIndex + 1) + " (" + (isMelody ? "melody" : "harmony") + ")"
			});

			tool.menu.push({
				control: "button",
				icon: "move_left",
				description: "move selected bar left",
				enabled: curBarIndex > 0,
				onclick: function() {
					// swap this bar with the one to the left
					if (curBarIndex <= 0) {
						return;
					}

					var melodyTmp = tune[curTuneId].melody[curBarIndex];
					var harmonyTmp = tune[curTuneId].harmony[curBarIndex];

					tune[curTuneId].melody[curBarIndex] = tune[curTuneId].melody[curBarIndex - 1];
					tune[curTuneId].harmony[curBarIndex] = tune[curTuneId].harmony[curBarIndex - 1];

					curBarIndex--;
					tune[curTuneId].melody[curBarIndex] = melodyTmp;
					tune[curTuneId].harmony[curBarIndex] = harmonyTmp;

					refreshGameData();
					redrawBarTiles = true;
					redrawBackground = true;
					redrawForeground = true;
				}
 			});

			tool.menu.push({
				control: "button",
				icon: "move_right",
				description: "move selected bar right",
				enabled: curBarIndex < (tune[curTuneId].melody.length - 1),
				onclick: function() {
					// swap this bar with the one to the right
					if (curBarIndex >= (tune[curTuneId].melody.length - 1)) {
						return;
					}

					var melodyTmp = tune[curTuneId].melody[curBarIndex];
					var harmonyTmp = tune[curTuneId].harmony[curBarIndex];

					tune[curTuneId].melody[curBarIndex] = tune[curTuneId].melody[curBarIndex + 1];
					tune[curTuneId].harmony[curBarIndex] = tune[curTuneId].harmony[curBarIndex + 1];

					curBarIndex++;
					tune[curTuneId].melody[curBarIndex] = melodyTmp;
					tune[curTuneId].harmony[curBarIndex] = harmonyTmp;

					refreshGameData();
					redrawBarTiles = true;
					redrawBackground = true;
					redrawForeground = true;
				}
 			});

			tool.menu.push({
				control: "button",
				icon: "add",
				description: "add empty bar to end of tune",
				enabled: (tune[curTuneId].melody.length < maxTuneLength),
				onclick: function() {
					// add new bar
					if (tune[curTuneId].melody.length >= maxTuneLength) {
						return;
					}

					tune[curTuneId].melody.push(createTuneBarData());
					tune[curTuneId].harmony.push(createTuneBarData());
					curBarIndex = (tune[curTuneId].melody.length - 1);

					refreshGameData();
					redrawBarTiles = true;
					redrawBackground = true;
					redrawForeground = true;
				}
 			});

			tool.menu.push({
				control: "button",
				icon: "copy",
				description: "make copy of selected bar and add it to the to end of tune",
				enabled: (tune[curTuneId].melody.length < maxTuneLength),
				onclick: function() {
					// copy current bar
					if (tune[curTuneId].melody.length >= maxTuneLength) {
						return;
					}

					tune[curTuneId].melody.push(createTuneBarData());
					tune[curTuneId].harmony.push(createTuneBarData());

					var nextBarIndex = (tune[curTuneId].melody.length - 1);
					copyBar(curBarIndex, nextBarIndex);

					curBarIndex = nextBarIndex;

					refreshGameData();
					redrawBarTiles = true;
					redrawBackground = true;
					redrawForeground = true;
				}
 			});

			tool.menu.push({
				control: "button",
				icon: "delete", // todo : better icon?
				description: "remove selected bar from tune",
				onclick: function() {
					// remove current bar
					tune[curTuneId].melody.splice(curBarIndex, 1);
					tune[curTuneId].harmony.splice(curBarIndex, 1);

					if (tune[curTuneId].melody.length <= 0) {
						tune[curTuneId].melody.push(createTuneBarData());
						tune[curTuneId].harmony.push(createTuneBarData());
					}

					if (curBarIndex >= tune[curTuneId].melody.length) {
						curBarIndex = tune[curTuneId].melody.length - 1;
					}

					refreshGameData();
					redrawBarTiles = true;
					redrawBackground = true;
					redrawForeground = true;
				}
			});

			tool.menu.pop({ control: "group" });

			// sub-menu select
			tool.menu.push({ control: "group" });

			tool.menu.push({
				control: "select",
				name: "tuneMenu",
				value: curMenu,
				options: [
					{
						icon: "edit",
						text: localization.GetStringOrFallback("tune_compose", "compose"),
						description: "note editing tools",
						value: Menu.COMPOSE
					},
					{
						icon: "instrument_melody",
						text: localization.GetStringOrFallback("tune_instrument", "instrument"),
						description: "instrument settings",
						value: Menu.INSTRUMENT
					},
					{
						icon: "tune",
						text: localization.GetStringOrFallback("tune_style", "style"),
						description: "tune settings",
						value: Menu.STYLE
					},
				],
				onchange: function(e) {
					curMenu = parseInt(e.target.value);
				},
			});

			tool.menu.pop({ control: "group" });

			/* SUB-MENUS */
			if (curMenu === Menu.COMPOSE) {
				/* COMPOSITION TOOLS MENU */
				// note entry mode
				tool.menu.push({ control: "group" });

				tool.menu.push({
					control: "label",
					icon : "edit",
					description : "note entry tool",
				});

				tool.menu.push({
					control: "select",
					name: "tuneNoteEntry",
					value: curNoteMode,
					options: [
						{
							icon: "note",
							text: localization.GetStringOrFallback("tune_note", "note"),
							description : "click & drag to draw notes",
							value: NOTE_TYPE.NOTE,
						},
						{
							icon: "blip",
							text: localization.GetStringOrFallback("blip_sfx", "blip"),
							description : "click to insert selected blip as a note",
							value: NOTE_TYPE.BLIP,
						},
					],
					onchange: function(e) {
						curNoteMode = parseInt(e.target.value);
					},
				});

				tool.menu.pop({ control: "group" });

				if (curKeyId != MusicalKey.UNKNOWN && curKeyId != MusicalKey.CHROMATIC) {
					// strum settings
					tool.menu.push({ control: "group", enabled: !isMelody });

					tool.menu.push({
						control: "label",
						icon: arpeggioPatternIcons[tune[curTuneId].arpeggioPattern],
						description: "harmony strum pattern (arpeggios)"
					});

					tool.menu.push({
						control: "select",
						name: "arpModeSelect",
						value: tune[curTuneId].arpeggioPattern,
						options: [
							{
								text: localization.GetStringOrFallback("tune_arp_off", "strum off"),
								value: ArpeggioPattern.OFF,
							},
							{
								text: localization.GetStringOrFallback("tune_arp_up", "strum chord (up)"),
								value: ArpeggioPattern.UP,
							},
							{
								text: localization.GetStringOrFallback("tune_arp_down", "strum chord (down)"),
								value: ArpeggioPattern.DWN,
							},
							{
								text: localization.GetStringOrFallback("tune_arp_int5", "strum interval (small)"),
								value: ArpeggioPattern.INT5,
							},
							{
								text: localization.GetStringOrFallback("tune_arp_int8", "strum interval (big)"),
								value: ArpeggioPattern.INT8
							}
						],
						onchange: function(e) {
							tune[curTuneId].arpeggioPattern = parseInt(e.target.value);

							refreshGameData();
							redrawBarTiles = true;
							redrawBackground = true;
							redrawForeground = true;

							if (!isMusicPlaying && tune[curTuneId].arpeggioPattern != ArpeggioPattern.OFF) {
								tool.soundPlayer.playTune(
									tune[curTuneId],
									{ barIndex: curBarIndex, beatCount: 8, melody: false, });
							}
						}
					});

					tool.menu.pop({ control: "group" });
				}
			}
			else if (curMenu === Menu.INSTRUMENT) {
				/* INSTRUMENT MENU */
				// melody instrument
				tool.menu.push({ control: "group", enabled: isMelody });

				tool.menu.push({
					control: "label",
					icon: "instrument_melody",
					description: "melody instrument tone"
				});

				tool.menu.push({
					control: "select",
					name: "tuneMelodyInstrument",
					value: tune[curTuneId].instrumentA,
					options: [
						{
							icon: "sqr_p2",
							text: localization.GetStringOrFallback("tune_wave_pulse2", "tone P2"),
							description: "tone A (square wave - duty 1/2)",
							value: SquareWave.P2,
						},
						{ 
							icon: "sqr_p4", 
							text: localization.GetStringOrFallback("tune_wave_pulse4", "tone P4"), 
							description: "tone B (pulse wave - duty 1/4)", 
							value: SquareWave.P4,
						},
						{
							icon: "sqr_p8",
							text: localization.GetStringOrFallback("tune_wave_pulse8", "tone P8"),
							description: "tone C (pulse wave - duty 1/8)",
							value: SquareWave.P8,
						},
					],
					onchange: function(e) {
						var pulse = parseInt(e.target.value);
						tune[curTuneId].instrumentA = pulse;
						tool.soundPlayer.playNote(
							{ beats: 1, note: Note.C, octave: Octave[4] },
							pulse,
							bitsy.SOUND2,
							tune[curTuneId].key);
						refreshGameData();
					},
				});

				tool.menu.pop({ control: "group" });

				// harmony instrument
				tool.menu.push({ control: "group", enabled: !isMelody });

				tool.menu.push({
					control: "label",
					icon: "instrument_harmony",
					description: "harmony instrument tone"
				});

				tool.menu.push({
					control: "select",
					name: "tuneHarmonyInstrument",
					value: tune[curTuneId].instrumentB,
					options: [
						{
							icon: "sqr_p2",
							text: localization.GetStringOrFallback("tune_wave_pulse2", "tone P2"),
							description: "tone A (square wave - duty 1/2)",
							value: SquareWave.P2,
						},
						{ 
							icon: "sqr_p4", 
							text: localization.GetStringOrFallback("tune_wave_pulse4", "tone P4"), 
							description: "tone B (pulse wave - duty 1/4)", 
							value: SquareWave.P4,
						},
						{
							icon: "sqr_p8",
							text: localization.GetStringOrFallback("tune_wave_pulse8", "tone P8"),
							description: "tone C (pulse wave - duty 1/8)",
							value: SquareWave.P8,
						},
					],
					onchange: function(e) {
						var pulse = parseInt(e.target.value);
						tune[curTuneId].instrumentB = pulse;
						tool.soundPlayer.playNote(
							{ beats: 1, note: Note.C, octave: Octave[2] },
							pulse,
							bitsy.SOUND2,
							tune[curTuneId].key);
						refreshGameData();
					},
				});

				tool.menu.pop({ control: "group" });
			}
			else if (curMenu === Menu.STYLE) {
				/* STYLE MENU */
				// tempo controls
				tool.menu.push({ control: "group" });

				var tempoIcon;
				switch (tune[curTuneId].tempo) {
					case Tempo.SLW:
						tempoIcon = "tempo_slow";
						break;
					case Tempo.MED:
						tempoIcon = "tempo_medium";
						break;
					case Tempo.FST:
						tempoIcon = "tempo_fast";
						break;
					case Tempo.XFST:
						tempoIcon = "tempo_turbo";
						break;
				}

				tool.menu.push({
					control: "label",
					icon: tempoIcon,
					text: localization.GetStringOrFallback("general_speed", "speed"),
					description: "tune speed (tempo)"
				});

				tool.menu.push({
					control: "select",
					name: "tuneTempo",
					value: tune[curTuneId].tempo,
					options: [
						{
							text: localization.GetStringOrFallback("tune_tempo_slow", "slow"),
							description: "60bpm (adagio)",
							value: Tempo.SLW,
						},
						{
							text: localization.GetStringOrFallback("tune_tempo_med", "medium"),
							description: "80bpm (andante)",
							value: Tempo.MED,
						},
						{
							text: localization.GetStringOrFallback("tune_tempo_fast", "fast"),
							description: "120bpm (moderato)",
							value: Tempo.FST,
						},
						{
							text: localization.GetStringOrFallback("tune_tempo_xfast", "turbo"),
							description: "160bpm (allegro)",
							value: Tempo.XFST,
						},
					],
					onchange: function(e) {
						tune[curTuneId].tempo = parseInt(e.target.value);
						if (isMusicPlaying) {
							tool.soundPlayer.setTempo(tune[curTuneId].tempo);
						}
						refreshGameData();
					},
				});

				tool.menu.pop({ control: "group" });

				// key transposition control
				if (curKeyId != MusicalKey.UNKNOWN && curKeyId != MusicalKey.CHROMATIC) {
					tool.menu.push({ control: "group" });

					var isMajorKey = (curKeyId === MusicalKey.MAJOR_PENTATONIC)
						|| (curKeyId === MusicalKey.MAJOR_DIATONIC);

					tool.menu.push({
						control: "label",
						icon: isMajorKey ? "key_majp" : "key_minp",
						text: localization.GetStringOrFallback("tune_key_basic", "mood"),
						description: "tune mood (transpose between major & minor key)"
					});

					tool.menu.push({
						control: "select",
						name: "tuneKeyTranspose",
						value: isMajorKey,
						options: [
							{
								text: localization.GetStringOrFallback("tune_key_major", "cheery"),
								description: "major key",
								value: true
							},
							{
								text: localization.GetStringOrFallback("tune_key_minor", "gloomy"),
								description: "minor key",
								value: false
							},
						],
						onchange: function(e) {
							if (e.target.value === "true") {
								// transpose to major key
								tune[curTuneId].key.notes = majorNotes.slice();
							}
							else {
								// transpose to minor key
								tune[curTuneId].key.notes = minorNotes.slice();
							}

							// update key id
							curKeyId = getKeyId(tune[curTuneId].key);

							refreshGameData();
							redrawBackground = true;
							redrawForeground = true;
						}
					});

					tool.menu.pop({ control: "group" });
				}

				// key controls
				tool.menu.push({ control: "group" });

				tool.menu.push({
					control: "label",
					icon: "settings",
					text: localization.GetStringOrFallback("tune_key", "key"),
					description: "key: " + keyNames[curKeyId] + " (" + keyDescriptions[curKeyId] + ")"
				});

				function makeKeyOption(key) {
					var option = { text : keyNames[key], description : keyDescriptions[key], value : key, };

					switch (key) {
						case MusicalKey.MAJOR_PENTATONIC:
						case MusicalKey.MINOR_PENTATONIC:
							option.description += " (basic)";
							break;
						case MusicalKey.MAJOR_DIATONIC:
						case MusicalKey.MINOR_DIATONIC:
							option.description += " (intermediate)";
							break;
						case MusicalKey.CHROMATIC:
							option.description += " (advanced)";
							break;
					}

					return option;
				}

				tool.menu.push({
					control: "select",
					name: "tuneKey",
					value: curKeyId,
					options: [
						makeKeyOption(MusicalKey.MAJOR_PENTATONIC),
						makeKeyOption(MusicalKey.MINOR_PENTATONIC),
						makeKeyOption(MusicalKey.MAJOR_DIATONIC),
						makeKeyOption(MusicalKey.MINOR_DIATONIC),
						makeKeyOption(MusicalKey.CHROMATIC),
					],
					onchange: function(e) {
						var nextKeyId = parseInt(e.target.value);
						if (nextKeyId != MusicalKey.UNKNOWN && curKeyId != nextKeyId) {
							if (nextKeyId === MusicalKey.CHROMATIC) {
								// convert from a key to chromatic
								convertToChromatic(tune[curTuneId]);
							}
							else if (curKeyId === MusicalKey.CHROMATIC) {
								// convert from chromatic scale to a key
								convertToKey(tune[curTuneId], keys[nextKeyId]);
							}
							else {
								// when converting from key to key you don't need to edit notes
								tune[curTuneId].key = copyKey(keys[nextKeyId]);
							}

							refreshGameData();
							redrawBackground = true;
							redrawForeground = true;

							curKeyId = nextKeyId;
						}
					},
				});

				tool.menu.pop({ control: "group" });
			}
		}

		function getNoteSample(bar, start, end) {
			var notes = [];
			for (var i = 0; i < barLength; i++) {
				// test for note in sample range
				var isInSampleRange =
					!(bar[i].beats <= 0) && 				// must *not* be a rest
					(i <= end) && 							// AND must start before the sample range ends
					!((i + (bar[i].beats - 1)) < start); 	// AND must *not* end before the sample range starts

				if (isInSampleRange) {
					notes.push(bar[i].note);
				}
			}

			if (notes.length <= 0) {
				return null;
			}

			var average = 0;
			for (var i = 0; i < notes.length; i++) {
				average += notes[i];
			}
			average /= notes.length;

			return Math.floor(average);
		}

		function drawBarPreview(tileId, bar, isSolfa, isSelected) {
			var bgc = isSelected ? (tileColorStartIndex + 2) : (tileColorStartIndex + 1);
			bitsy.fill(tileId, isSelected ? bgc : tileColorStartIndex);

			// bar background
			for (var y = 0; y < 6; y++) {
				for (var x = 0; x < 6; x++) {
					var pixel = ((y + 1) * bitsy.TILE_SIZE) + (x + 1);
					bitsy.set(tileId, pixel, bgc);
				}
			}

			// sampled notes
			var sampleRanges = [[0, 1], [2, 3], [4, 7], [8, 11], [12, 13], [14, 15]];
			var noteCount = isSolfa ? Solfa.COUNT : Note.COUNT;
			for (var i = 0; i < sampleRanges.length; i++) {
				var range = sampleRanges[i];
				var sample = getNoteSample(bar, range[0], range[1]);
				if (sample != null) {
					var x = Math.floor(i);
					var y = Math.floor((1 - (sample / (noteCount - 1))) * 5);
					var pixel = ((y + 1) * bitsy.TILE_SIZE) + (x + 1);
					bitsy.set(tileId, pixel, tileColorStartIndex);
				}
			}
		}

		function updateBarPreviewTiles() {
			bitsy.log("UPDATE BAR PREVIEW TILES");
			if (!tune[curTuneId]) {
				return;
			}

			var isSolfa = (tune[curTuneId].key != undefined && tune[curTuneId].key != null);

			// melody
			for (var i = 0; i < tune[curTuneId].melody.length; i++) {
				var tId = melodyBarTileIds[i];
				drawBarPreview(tId, tune[curTuneId].melody[i], isSolfa, (i === curBarIndex && isMelody));
			}

			// harmony
			for (var i = 0; i < tune[curTuneId].melody.length; i++) {
				var tId = harmonyBarTileIds[i];
				drawBarPreview(tId, tune[curTuneId].harmony[i], isSolfa, (i === curBarIndex && !isMelody));
			}
		}

		function draw(tileName, x, y, map) {
			map = (map != undefined) ? map : bitsy.MAP1;
			var tileId = tool.world.names.tile[tileName];
			var tile = tool.world.tile[tileId];
			var frame = tool.renderer.GetDrawingFrame(tile, 0);
			setTile(map, x, y, frame);
		}

		function isNoteSharp(note) {
			switch (note) {
				case Note.C_SHARP:
				case Note.D_SHARP:
				case Note.F_SHARP:
				case Note.G_SHARP:
				case Note.A_SHARP:
					return true;
					break;
				default:
					return false;
					break;
			}
		}

		function drawBarSelect() {
			// melody bars
			for (var i = 0; i < tune[curTuneId].melody.length; i++) {
				setTile(bitsy.MAP2, barSelectX + i, 0, melodyBarTileIds[i]);
			}

			// harmony bars
			for (var i = 0; i < tune[curTuneId].melody.length; i++) {
				setTile(bitsy.MAP2, barSelectX + i, 1, harmonyBarTileIds[i]);
			}
		}

		function drawNoteIndicator(noteId, tilePos) {
			// current note indicator
			if (tool.mouse.hover() && noteId != undefined && noteId > Note.NONE && noteId <= Note.COUNT) {
				var closeNote = closestNoteInKey(noteId, tune[curTuneId].key);
				var isSharp = isNoteSharp(closeNote);
				var x = 14;
				var y = 0;

				switch (closeNote) {
					case Note.COUNT:
					case Note.C:
					case Note.C_SHARP:
						draw("note_c", x, y, bitsy.MAP2);
						break;
					case Note.D:
					case Note.D_SHARP:
						draw("note_d", x, y, bitsy.MAP2);
						break;
					case Note.E:
						draw("note_e", x, y, bitsy.MAP2);
						break;
					case Note.F:
					case Note.F_SHARP:
						draw("note_f", x, y, bitsy.MAP2);
						break;
					case Note.G:
					case Note.G_SHARP:
						draw("note_g", x, y, bitsy.MAP2);
						break;
					case Note.A:
					case Note.A_SHARP:
						draw("note_a", x, y, bitsy.MAP2);
						break;
					case Note.B_SHARP:
						draw("note_b", x, y, bitsy.MAP2);
						break;
				}

				draw(isNoteSharp(closeNote) ? "sharp" : "empty", x + 1, y, bitsy.MAP2);
			}
		}

		function copyBar(srcBar, destBar) {
			for (var i = 0; i < barLength; i++) {
				// melody
				tune[curTuneId].melody[destBar][i].beats = tune[curTuneId].melody[srcBar][i].beats;
				tune[curTuneId].melody[destBar][i].note = tune[curTuneId].melody[srcBar][i].note;
				tune[curTuneId].melody[destBar][i].octave = tune[curTuneId].melody[srcBar][i].octave;
				tune[curTuneId].melody[destBar][i].blip = tune[curTuneId].melody[srcBar][i].blip;
				// harmony
				tune[curTuneId].harmony[destBar][i].beats = tune[curTuneId].harmony[srcBar][i].beats;
				tune[curTuneId].harmony[destBar][i].note = tune[curTuneId].harmony[srcBar][i].note;
				tune[curTuneId].harmony[destBar][i].octave = tune[curTuneId].harmony[srcBar][i].octave;
				tune[curTuneId].harmony[destBar][i].blip = tune[curTuneId].harmony[srcBar][i].blip;
			}
		}

		function updateBarSelect(isMouseDown, tilePos) {
			if (tilePos.y < 2 && tilePos.x < tune[curTuneId].melody.length) {
				tool.mouse.tooltip("bar " + (tilePos.x + 1) + " (" + (tilePos.y === 0 ? "melody" : "harmony") + ")");
			}

			if (!isMouseDown || prevIsMouseDown) {
				return;
			}

			if (tilePos.y < 2 && tilePos.x < tune[curTuneId].melody.length) {
				curBarIndex = tilePos.x;
				isMelody = (tilePos.y === 0);

				redrawBarTiles = true;
				redrawBackground = true;
				redrawForeground = true;
			}
		}

		function drawMusicalStaff(barLineIndex) {
			var key = null;
			var keyScale = [];
			if (tune[curTuneId]) {
				key = tune[curTuneId].key;
				if (key != null) {
					keyScale = getScaleNotes(key);
				}
			}

			var maxOctave = (isMelody || tune[curTuneId].arpeggioPattern === ArpeggioPattern.OFF) ? Octave[5] : Octave[4];

			for (var i = Note.C; i <= Note.COUNT; i++) {
				for (var x = 0; x < 16; x++) {
					var noteIndex = (i % Note.COUNT);
					var y = staffY - i;
					if (key === null || keyScale.indexOf(noteIndex) != -1) {
						if (isNoteSharp(noteIndex)) {
							draw((x % barLineIndex === 0) ? "dotb4" : "dotb", x, y);
						}
						else {
							draw((x % barLineIndex === 0) ? "dot4" : "dot", x, y);
						}
					}
					else if (x % barLineIndex === 0) {
						draw("bar", x, y);
					}
				}
			}
		}

		function drawBarNotes(curBeat) {
			if (!tune[curTuneId]) {
				return;
			}

			// key information
			var key = tune[curTuneId].key;
			var keyScale = [];
			if (key != null) {
				keyScale = getScaleNotes(key);
			}

			// bar notes
			var bar = isMelody
				? tune[curTuneId].melody[curBarIndex]
				: tune[curTuneId].harmony[curBarIndex];

			// draw beat indicator
			if (curBeat != null && (curBarIndex === curBeat.bar)) {
				var x = curBeat.beat;
				for (var i = Note.C; i <= Note.COUNT; i++) {
					var y = staffY - i;
					draw("beat", x, y, bitsy.MAP2);
				}
			}

			// draw empty octaves
			for (var i = 0; i < bar.length; i++) {
				draw("oct", i, 15, bitsy.MAP2);
			}

			var upperOctaveStart = isMelody ? Octave[5] : Octave[3];

			// draw current bar notes
			for (var i = 0; i < bar.length; i++) {
				if (key === null || key.scale.indexOf(bar[i].note) != -1) {
					var noteIndex = (key === null) ? bar[i].note : key.notes[bar[i].note];

					// draw high C up on the top of the musical staff
					if (noteIndex === Note.C && bar[i].octave >= upperOctaveStart) {
						noteIndex += Note.COUNT;
					}

					if (bar[i].beats > 0) {
						var isNotePlaying = (curBeat != null)
							&& (curBarIndex === curBeat.bar)
							&& (curBeat.beat >= i && curBeat.beat < i + bar[i].beats);

						if (bar[i].blip != undefined) {
							// todo : is it safe to remove this check now?
							if (blipTileIds && blipInvertedTileIds) {
								// blip
								if (blipTileIds[i] === undefined) {
									blipTileIds[i] = makeBlipTile(tool.soundPlayer, bar[i].blip, false);
								}
								if (blipInvertedTileIds[i] === undefined) {
									blipInvertedTileIds[i] = makeBlipTile(tool.soundPlayer, bar[i].blip, true);
								}

								setTile(bitsy.MAP2, i, staffY - noteIndex, isNotePlaying ? blipInvertedTileIds[i] : blipTileIds[i]);
							}
						}
						else if (bar[i].beats === 1) {
							// short note
							draw(isNotePlaying ? "note2" : "note", i, staffY - noteIndex, bitsy.MAP2);
						}
						else {
							// long note
							for (var j = 0; j < bar[i].beats; j++) {
								if (j === 0) {
									draw(isNotePlaying ? "note4_l" : "note3_l", i + j, staffY - noteIndex, bitsy.MAP2);
								}
								else if (j === bar[i].beats - 1) {
									draw(isNotePlaying ? "note4_r" : "note3_r", i + j, staffY - noteIndex, bitsy.MAP2);
								}
								else {
									draw(isNotePlaying ? "note4" : "note3", i + j, staffY - noteIndex, bitsy.MAP2);
								}
							}
						}

						draw(octaveTileNames[bar[i].octave], i, 15, bitsy.MAP2);
					}
				}
			}
		}

		function drawArpeggio(curBeat) {
			if (!tune[curTuneId] || isMelody) {
				return;
			}

			var bar = tune[curTuneId].harmony[curBarIndex];
			var key = tune[curTuneId].key;

			if (key === null) {
				return;
			}

			var tonic = bar[0];
			var isArpeggioPlaying = (curBeat != null) && (curBarIndex === curBeat.bar);
			var upperOctaveStart = Octave[3];

			// tonic note select
			if (tonic.beats > 0) {
				var noteIndex = key.notes[tonic.note];
				// draw high C up on the top of the musical staff
				if (noteIndex === Note.C && tonic.octave >= upperOctaveStart) {
					noteIndex += Note.COUNT;
				}

				for (var x = 0; x < 15; x++) {
					if (x === 0) {
						draw(isArpeggioPlaying ? "note4_l" : "note3_l", x, staffY - noteIndex, bitsy.MAP2);
					}
					else if (x === 14) {
						draw(isArpeggioPlaying ? "note4_r" : "note3_r", x, staffY - noteIndex, bitsy.MAP2);
					}
					else {
						draw(isArpeggioPlaying ? "note4" : "note3", x, staffY - noteIndex, bitsy.MAP2);
					}
				}
			}

			// arpeggio pattern
			if (tonic.beats > 0) {
				var arpeggioSteps = soundPlayer.getArpeggioSteps(tune[curTuneId]);
				for (var i = 0; i < arpeggioSteps.length; i++) {
					var noteIndex = key.notes[arpeggioSteps[i] % Solfa.COUNT];
					if (arpeggioSteps[i] >= Solfa.COUNT) {
						noteIndex += Note.COUNT;
					}
					var isNotePlaying = (isArpeggioPlaying && (curBeat.beat % arpeggioSteps.length) === i);
					draw(isNotePlaying ? "note2" : "note", 15, staffY - noteIndex, bitsy.MAP2);
				}
			}

			// octave
			if (tonic.beats > 0) {
				draw(octaveTileNames[tonic.octave], 0, 15, bitsy.MAP2);
			}
			else {
				draw("oct", 0, 15, bitsy.MAP2);
			}
		}

		function eraseNotesInRange(startIndex, endIndex) {
			var curTune = tune[curTuneId];
			var curBar = isMelody
				? curTune.melody[curBarIndex]
				: curTune.harmony[curBarIndex];

			for (var i = 0; i < 16; i++) {
				if (curBar[i].beats > 0) {
					var note = curBar[i];
					var noteStart = i;
					var noteEnd = i + note.beats - 1;

					if (noteStart >= startIndex && noteEnd <= endIndex) {
						// if the eraser range contains the entire note, erase it
						note.beats = 0;
					}
					else if (noteStart < startIndex && noteEnd > endIndex) {
						// if the *note* contains the eraser range, split the note in two
						curBar[endIndex + 1].note = note.note;
						curBar[endIndex + 1].octave = note.octave;
						curBar[endIndex + 1].beats = noteEnd - endIndex;
						note.beats = startIndex - noteStart;
					}
					else if (noteStart >= startIndex && noteStart <= endIndex) {
						// if the eraser range contains the note's start, move and shrink the note
						curBar[endIndex + 1].note = note.note;
						curBar[endIndex + 1].octave = note.octave;
						curBar[endIndex + 1].beats = noteEnd - endIndex;
						note.beats = 0;
					}
					else if (noteEnd >= startIndex && noteEnd <= endIndex) {
						// if the eraser range contains the note's end, shrink the note
						note.beats = startIndex - noteStart;
					}
				}
			}

			redrawForeground = true;
			redrawBarTiles = true;
		}

		function updateBarNotes(isMouseDown, tilePos, noteId) {
			if (isPlayMode || tune[curTuneId] === undefined) {
				curEditMode = NOTE_EDIT.NONE;
				noteEdit.startIndex = null;
				noteEdit.endIndex = null;
				noteEdit.curNoteId = null;
				return;
			}

			var curTune = tune[curTuneId];
			var curBar = isMelody
				? curTune.melody[curBarIndex]
				: curTune.harmony[curBarIndex];
			var curKey = curTune.key;
			var beatIndex = tilePos.x;

			if (noteId > Note.NONE && noteId < Note.COUNT) {
				var tooltip = "beat " + Math.floor((beatIndex / 4) + 1) + "." + Math.floor((beatIndex % 4) + 1);

				if (curBar[beatIndex] && curBar[beatIndex].beats > 0) {
					if (curBar[beatIndex].blip) {
						var blipId = curBar[beatIndex].blip;
						tooltip += ": ";
						if (blip[blipId].name) {
							tooltip += blip[blipId].name;
						}
						else {
							tooltip += "blip " + blipId;
						}
					}
					else {
						tooltip += " (note: " + serializeNote(
							curBar[beatIndex].note,
							tune[curTuneId].key,
							true /* useFriendlyName */) + ")";
					}
				}

				tool.mouse.tooltip(tooltip);
			}
			else if (tilePos.y === 15 && curBar[beatIndex] && curBar[beatIndex].beats > 0) {
				tool.mouse.tooltip("octave " + (curBar[beatIndex].octave + 2) + " (tap to cycle)"); 
			}

			if (isMouseDown && !prevIsMouseDown) {
				if (noteId > Note.NONE && noteId <= Note.COUNT) {
					noteEdit.startIndex = beatIndex;
					noteEdit.endIndex = beatIndex;
					noteEdit.curNoteId = closestNoteInKey(noteId, curKey);

					var collideNote = null;
					for (var i = 0; i < 16; i++) {
						if (curBar[i].beats > 0 && beatIndex >= i && beatIndex < i + curBar[i].beats) {
							collideNote = curBar[i].note;

							// convert solfa notes to chromatic
							if (curKey != null) {
								collideNote = curKey.notes[collideNote];
							}
						}
					}

					if (collideNote != null && (collideNote % Note.COUNT) === (noteEdit.curNoteId % Note.COUNT)) {
						eraseNotesInRange(noteEdit.startIndex, noteEdit.endIndex);
						refreshGameData();
						curEditMode = NOTE_EDIT.REMOVE;
					}
					else {
						setNote(noteEdit.startIndex, noteEdit.curNoteId, { noteMode: curNoteMode, });
						curEditMode = NOTE_EDIT.ADD;
					}
				}
				else if (tilePos.y === 15 && curBar[beatIndex].beats > 0) {
					// octave cycle
					curBar[beatIndex].octave++;
					if (curBar[beatIndex].octave > Octave[5]) {
						curBar[beatIndex].octave = Octave[2];
					}

					// play note or blip
					if (curBar[beatIndex].blip) {
						var curBlip = blip[curBar[beatIndex].blip];
						tool.soundPlayer.playBlip(curBlip, { pitch: curBar[beatIndex] });
					}
					else {
						tool.soundPlayer.playNote(
							{ beats: 1, note: curBar[beatIndex].note, octave: curBar[beatIndex].octave, },
							isMelody ? curTune.instrumentA : curTune.instrumentB,
							bitsy.SOUND1,
							curTune.key);
					}

					refreshGameData();

					curEditMode = NOTE_EDIT.NONE;
				}
			}
			else if (isMouseDown) {
				// disable click and drag for notes with effects
				if (curNoteMode === NOTE_TYPE.BLIP) {
					curEditMode = NOTE_EDIT.NONE;
				}

				if (curEditMode === NOTE_EDIT.ADD) {
					if (noteId > Note.NONE && noteId <= Note.COUNT) {
						noteId = closestNoteInKey(noteId, curKey);
						if (noteId != noteEdit.curNoteId) {
							// new note: start drag over
							noteEdit.startIndex = tilePos.x;
							noteEdit.endIndex = noteEdit.startIndex;
							noteEdit.curNoteId = noteId;
							setNote(noteEdit.startIndex, noteEdit.curNoteId, { noteMode: curNoteMode, });
						}
						else if (tilePos.x < noteEdit.startIndex) {
							noteEdit.startIndex = tilePos.x;
							setNote(
								noteEdit.startIndex,
								noteEdit.curNoteId,
								{ noteMode: curNoteMode, beats: (noteEdit.endIndex - noteEdit.startIndex + 1), });
						}
						else if (tilePos.x > noteEdit.endIndex) {
							noteEdit.endIndex = tilePos.x;
							setNote(
								noteEdit.startIndex,
								noteEdit.curNoteId,
								{ noteMode: curNoteMode, beats: (noteEdit.endIndex - noteEdit.startIndex + 1), });
						}
					}
				}
				else if (curEditMode === NOTE_EDIT.REMOVE) {
					if (tilePos.x < noteEdit.startIndex) {
						noteEdit.startIndex = tilePos.x;
					}
					else if (tilePos.x > noteEdit.endIndex) {
						noteEdit.endIndex = tilePos.x;
					}
					eraseNotesInRange(noteEdit.startIndex, noteEdit.endIndex);
					refreshGameData();
				}
			}
			else if (!isMouseDown && prevIsMouseDown) {
				redrawBarTiles = true;
				redrawForeground = true;

				curEditMode = NOTE_EDIT.NONE;
				noteEdit.startIndex = null;
				noteEdit.endIndex = null;
				noteEdit.curNoteId = null;
			}
		}

		function updateArpeggio(isMouseDown, tilePos, noteId) {
			if (!tune[curTuneId] || isMelody) {
				return;
			}

			var bar = tune[curTuneId].harmony[curBarIndex];
			var key = tune[curTuneId].key;

			if (key === null) {
				return;
			}

			tool.mouse.tooltip("click to select the tonic note for an arpeggio");

			if (isMouseDown && !prevIsMouseDown) {
				if (noteId != undefined && noteId > Note.NONE && noteId <= Note.COUNT && tilePos.x < 15) {
					// set the arpeggio tonic note
					var closeNote = closestNoteInKey(noteId, key);
					var octave = (closeNote >= Note.COUNT) ? Octave[3] : Octave[2];
					var solfaNote = key.notes.indexOf(closeNote % Note.COUNT);
					var tonic = {
						beats: 16, // fill the whole bar
						note: solfaNote,
						octave: octave
					};
					curEditMode = setArpeggioTonic(tonic);
				}
				else if (tilePos.y === 15 && tilePos.x === 0 && bar[0].beats > 0) {
					// octave cycle
					var tonic = { 
						beats: 16,
						note: bar[0].note,
						octave: bar[0].octave
					};
					tonic.octave++;
					if (tonic.octave > Octave[4]) {
						tonic.octave = Octave[2];
					}
					curEditMode = setArpeggioTonic(tonic);
				}

				redrawBarTiles = true;
				redrawForeground = true;
			}
		}

		var isPaletteLoaded = false;
		var redrawBarTiles = true;
		var redrawBackground = true;
		var redrawForeground = true;
		var prevBeat = null;
		var prevTilePos = null;

		function update(dt) {
			if (!tune[curTuneId]) {
				return true;
			}

			// also kind of hacky??
			// todo : also I don't think it works quite right..
			if (isPlayMode && isMusicPlaying) {
				tool.soundPlayer.stopTune();
				isMusicPlaying = false;
			}

			if (!isPlayMode) {
				tool.soundPlayer.update(dt);
			}

			if (!isPaletteLoaded) {
				bitsy.log("load palette");
				updatePaletteWithTileColors(tool.world.palette["0"].colors);
				isPaletteLoaded = true;
			}

			// mouse input
			var isMouseDown = tool.mouse.down();
			var mousePos = tool.mouse.pos();
			var tilePos = {
				x: Math.floor(mousePos.x / tilesize),
				y: Math.floor(mousePos.y / tilesize),
			};
			var noteId = (staffY - tilePos.y);

			bitsy.graphicsMode(bitsy.GFX_MAP);

			// initialize bar tiles
			if (melodyBarTileIds === null) {
				melodyBarTileIds = [];
				for (var i = 0; i < maxTuneLength; i++) {
					melodyBarTileIds.push(bitsy.tile());
				}
			}
			if (harmonyBarTileIds === null) {
				harmonyBarTileIds = [];
				for (var i = 0; i < maxTuneLength; i++) {
					harmonyBarTileIds.push(bitsy.tile());
				}
			}

			if (redrawBarTiles) {
				updateBarPreviewTiles();
				redrawBarTiles = false;
			}

			// redraw the foreground when the mouse moves to a different tile
			if (isMouseDown || JSON.stringify(tilePos) != JSON.stringify(prevTilePos)) {
				redrawForeground = true;
			}

			var curBeat = tool.soundPlayer.getBeat();
			if (curBeat != null || prevBeat != null) {
				// todo : this is kind of silly way to make this comparison probably
				var isNextBeat = JSON.stringify(curBeat) != JSON.stringify(prevBeat);
				if (isNextBeat) {
					redrawForeground = true;
				}
			}

			// draw background
			if (redrawBackground) {
				bitsy.fill(bitsy.MAP1, 0);
				if (tune[curTuneId].arpeggioPattern != ArpeggioPattern.OFF && !isMelody) {
					drawMusicalStaff(15);

					// clear the last column for the pattern preview
					for (var i = 0; i < bitsy.MAP_SIZE; i++) {
						setTile(bitsy.MAP1, 15, i, 0);
					}
				}
				else {
					drawMusicalStaff(4);
				}
				redrawBackground = false;
			}

			// draw foreground
			if (redrawForeground) {
				bitsy.fill(bitsy.MAP2, 0);
				drawBarSelect();
				if (tune[curTuneId].arpeggioPattern != ArpeggioPattern.OFF && !isMelody) {
					drawArpeggio(curBeat);
				}
				else {
					drawBarNotes(curBeat);
				}
				drawNoteIndicator(noteId, tilePos);
				redrawForeground = false;
			}

			// input
			updateBarSelect(isMouseDown, tilePos);
			if (tune[curTuneId].arpeggioPattern != ArpeggioPattern.OFF && !isMelody) {
				updateArpeggio(isMouseDown, tilePos, noteId);
			}
			else {
				updateBarNotes(isMouseDown, tilePos, noteId);
			}

			prevPlayMode = isPlayMode;
			prevIsMouseDown = isMouseDown;
			prevBeat = curBeat;
			prevTilePos = tilePos;

			return true;
		}

		tool.loop = update;
		tool.menuUpdate = menuUpdate;

		// todo : name?
		tool.onSelect = function(id) {
			curTuneId = id;
			curBarIndex = 0;
			isMelody = true;
			curKeyId = MusicalKey.CHROMATIC;

			if (curTuneId && tune[curTuneId] && tune[curTuneId].key != null) {
				curKeyId = getKeyId(tune[curTuneId].key);
			}

			redrawBarTiles = true;
			redrawBackground = true;
			redrawForeground = true;

			if (isMusicPlaying) {
				tool.soundPlayer.stopTune();
				isMusicPlaying = false;
			}
		};

		tool.add = function() {
			// should the next ID logic be in the find tool?
			var nextId = "1"; // hacky way to specify the default id..
			var idList = sortedBase36IdList(tune);
			if (idList.length > 0) {
				nextId = nextObjectId(idList);
			}

			tune[nextId] = createTuneData(nextId);

			// pick random square wave for instrument A
			tune[nextId].instrumentA = Math.floor(Math.random() * SquareWave.COUNT);

			// pick random square wave that's *different* from instrument A for instrument B
			tune[nextId].instrumentB = ((tune[nextId].instrumentA + 1)
				+ Math.floor(Math.random() * (SquareWave.COUNT - 1))) % SquareWave.COUNT;

			// hacky: need to have the tempo enum use integer values
			var tempo = [Tempo.SLW, Tempo.MED, Tempo.FST][Math.floor(Math.random() * 3)];
			tune[nextId].tempo = tempo;

			var key = Math.random() > 0.5 ? MusicalKey.MINOR_PENTATONIC : MusicalKey.MAJOR_PENTATONIC;
			tune[nextId].key = copyKey(keys[key]);

			var arp = ArpeggioPattern.UP + Math.floor(Math.random() * ArpeggioPattern.INT8);
			tune[nextId].arpeggioPattern = arp;

			// start with four empty bars
			for (var i = 0; i < 4; i++) {
				// create empty melody & harmony bars
				tune[nextId].melody.push(createTuneBarData());
				tune[nextId].harmony.push(createTuneBarData());
			}
		};

		tool.duplicate = function(id) {
			var nextId = nextObjectId(sortedBase36IdList(tune));
			tune[nextId] = createTuneData(nextId);

			// copy settings
			tune[nextId].key = copyKey(tune[id].key);
			tune[nextId].tempo = tune[id].tempo;
			tune[nextId].instrumentA = tune[id].instrumentA;
			tune[nextId].instrumentB = tune[id].instrumentB;
			tune[nextId].arpeggioPattern = tune[id].arpeggioPattern;

			// copy bars
			for (var i = 0; i < tune[id].melody.length; i++) {
				tune[nextId].melody.push(createTuneBarData());
				tune[nextId].harmony.push(createTuneBarData());
				for (var j = 0; j < 16; j++) {
					// melody
					tune[nextId].melody[i][j].note = tune[id].melody[i][j].note;
					tune[nextId].melody[i][j].octave = tune[id].melody[i][j].octave;
					tune[nextId].melody[i][j].beats = tune[id].melody[i][j].beats;
					// harmony
					tune[nextId].harmony[i][j].note = tune[id].harmony[i][j].note;
					tune[nextId].harmony[i][j].octave = tune[id].harmony[i][j].octave;
					tune[nextId].harmony[i][j].beats = tune[id].harmony[i][j].beats;
				}
			}
		};

		tool.delete = function(id) {
			if (sortedBase36IdList(tune).length <= 1) {
				alert("you can't delete your last tune!");
				return;
			}

			delete tune[id];
		};

		tool.onGameDataChange = function() {
			// force render refresh // todo : need to think about the architecture of sharing renderers
			if (tool && tool.renderer) {
				tool.renderer.ClearCache();
				melodyBarTileIds = null;
				harmonyBarTileIds = null;
				blipTileIds = [];
				blipInvertedTileIds = [];
			}
		};
	});
};