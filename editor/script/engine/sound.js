/* PITCH HELPER FUNCTIONS */
function pitchToSteps(pitch) {
	return (pitch.octave * Note.COUNT) + pitch.note;
}

function stepsToPitch(steps) {
	var pitch = { beats: 1, note: Note.C, octave: Octave[2], };

	while (steps >= Note.COUNT) {
		pitch.octave = (pitch.octave + 1) % Octave.COUNT;
		steps -= Note.COUNT;
	}

	pitch.note += steps;

	// make sure pitch isn't outside a valid range
	if (pitch.note <= Note.NONE) {
		pitch.note = Note.C;
	}
	else if (pitch.note >= Note.COUNT) {
		pitch.note = Note.B;
	}

	if (pitch.octave <= Octave.NONE) {
		pitch.octave = Octave[2];
	}
	else if (pitch.octave >= Octave.COUNT) {
		pitch.octave = Octave[5];
	}

	return pitch;
}

function adjustPitch(pitch, stepDelta) {
	return stepsToPitch(pitchToSteps(pitch) + stepDelta);
}

function pitchDistance(pitchA, pitchB) {
	return pitchToSteps(pitchB) - pitchToSteps(pitchA);
}

function isMinPitch(pitch) {
	return pitchToSteps(pitch) <= pitchToSteps({ note: Note.C, octave: Octave[2] });
}

function isMaxPitch(pitch) {
	return pitchToSteps(pitch) >= pitchToSteps({ note: Note.B, octave: Octave[5] });
}

function SoundPlayer() {
	// frequencies (in hertz) for octave 0 (or is it octave 4?)
	var frequencies = [
		261.7, // middle C
		277.2,
		293.7,
		311.2,
		329.7,
		349.3,
		370.0,
		392.0,
		415.3,
		440.0,
		466.2,
		493.9,
	];

	// tempos are calculated as the duration of a 16th note, rounded to the nearest millisecond
	var tempos = {};
	tempos[Tempo.SLW] = 250; // 60bpm (adagio)
	tempos[Tempo.MED] = 188; // ~80bpm (andante) [exact would be 187.5 ms]
	tempos[Tempo.FST] = 125; // 120bpm (moderato)
	tempos[Tempo.XFST] = 94; // ~160bpm (allegro) [exact would be 93.75 ms]

	// arpeggio patterns expressed in scale degrees
	var arpeggioPattern = {};
	arpeggioPattern[ArpeggioPattern.UP] = [0, 2, 4, 7];
	arpeggioPattern[ArpeggioPattern.DWN] = [7, 4, 2, 0];
	arpeggioPattern[ArpeggioPattern.INT5] = [0, 4];
	arpeggioPattern[ArpeggioPattern.INT8] = [0, 7];

	this.getArpeggioSteps = function(tune) { return arpeggioPattern[tune.arpeggioPattern]; };

	function isPitchPlayable(pitch, key) {
		if (pitch.beats <= 0) {
			return false;
		}

		if (key === undefined || key === null) {
			return true;
		}

		// test if note is in the scale
		return (key.scale.indexOf(pitch.note) > -1)
			&& (key.notes[pitch.note] > Note.NONE)
			&& (key.notes[pitch.note] < Note.COUNT);
	}

	function pitchToChromatic(pitch, key) {
		if (pitch === undefined || pitch === null) {
			return null;
		}

		if (key === undefined || key === null) {
			return pitch;
		}

		// convert from solfa
		var octaveOffset = (pitch.note >= Solfa.COUNT) ? 1 : 0;

		return {
			beats: pitch.beats,
			octave: pitch.octave + octaveOffset,
			// todo : what about the scale limits?
			note: key.notes[(pitch.note % Solfa.COUNT)],
			blip: pitch.blip
		};
	}

	function makePitchFrequency(pitch) {
		// todo : this clamp shouldn't be required.. there's a bug in the pitch shifting somewhere
		var note = Math.max(0, pitch.note);
		var octave = (pitch.octave != undefined ? pitch.octave : Octave[4]);

		var octaveMin = Octave[2];
		var octaveMax = Octave[5];

		// make sure octave is in valid range
		octave = Math.max(octaveMin, Math.min(octave, octaveMax));
		var distFromMiddleC = octave - 2;

		var freq = frequencies[note] * Math.pow(2, distFromMiddleC);

		if (isNaN(freq)) {
			bitsy.log("invalid frequency " + pitch, "sound");
		}

		return freq;
	}

	var maxVolume = 15; // todo : should this be a system constant?
	var noteVolume = 5;

	var curTune = null;
	var isTunePaused = false;
	var barIndex = -1;
	var curArpeggio = [];

	var beat16 = 0;
	var beat16Timer = 0;
	var beat16Index = 0;

	// special settings
	var isLooping = false;
	var isMelodyMuted = false;
	var maxBeatCount = null;
	var muteTimer = 0; // allow temporary muting of all notes

	function arpeggiateBar(bar, key, pattern) {
		var arpeggio = [];

		if (key != undefined && key != null && isPitchPlayable(bar[0], key)) {
			for (var i = 0; i < arpeggioPattern[pattern].length; i++) {
				var pitch = { beats: 1, note: bar[0].note + arpeggioPattern[pattern][i], octave: bar[0].octave };
				arpeggio.push(pitchToChromatic(pitch, key));
			}
		}

		for (var i = 0; i < arpeggio.length; i++) {
			bitsy.log(i + ": " + serializeNote(arpeggio[i].note));
		}

		return arpeggio;
	};

	function playNote(pitch, instrument, options) {
		if (pitch.beats <= 0) {
			return;
		}

		var channel = bitsy.SOUND1;
		if (options != undefined && options.channel != undefined) {
			channel = options.channel;
		}

		var key = null;
		if (options != undefined && options.key != undefined) {
			key = options.key;
		}

		var beatLen = beat16;
		if (options != undefined && options.beatLen != undefined) {
			beatLen = options.beatLen;
		}

		if (isPitchPlayable(pitch, key)) {
			var freq = makePitchFrequency(pitchToChromatic(pitch, key));
			bitsy.sound(channel, (pitch.beats * beatLen), freq * 100, noteVolume, instrument);
		}
	}

	function sfxFrequencyAtTime(sfx, time) {
		var beatDelay = sfx.blip.beat.delay;
		var beatTime = sfx.blip.beat.time;
		var delta = Math.max(0, time - beatDelay) / beatTime;

		var pitchDelta = sfx.blip.doRepeat
			? (delta % sfx.frequencies.length)
			: Math.min(delta, sfx.frequencies.length - 1);

		sfx.pitchIndex = Math.floor(pitchDelta);
		var curFreq = sfx.frequencies[sfx.pitchIndex];

		// TODO : consider for future update
		// if (sfx.blip.doSlide) {
		// 	var nextPitchIndex = (sfx.pitchIndex + 1) % sfx.frequencies.length;
		// 	var nextFreq = sfx.frequencies[nextPitchIndex];
		// 	var d = pitchDelta - sfx.pitchIndex;
		// 	curFreq = curFreq + ((nextFreq - curFreq) * d);
		// }

		return curFreq;
	}

	function sfxVolumeAtTime(sfx, time) {
		var volume = 0;

		// use envelope settings to calculate volume
		var attack = sfx.blip.envelope.attack;
		var decay = sfx.blip.envelope.decay;
		var length = sfx.blip.envelope.length;
		var release = sfx.blip.envelope.release;
		if (time < attack) {
			// attack
			var t = time / attack;
			volume = Math.floor(sfxPeakVolume * t);
		}
		else if (time < attack + decay) {
			// decay
			var t = (time - attack) / decay;
			var d = sfx.blip.envelope.sustain - sfxPeakVolume;
			volume = Math.floor(sfxPeakVolume + (d * t));
		}
		else if (time < attack + decay + length) {
			// sustain
			volume = sfx.blip.envelope.sustain;
		}
		else if (time < attack + decay + length + release) {
			// release
			var t = (time - (attack + decay + length)) / release;
			volume = Math.floor(sfx.blip.envelope.sustain * (1 - t));
		}
		else {
			volume = 0;
		}

		return volume;
	}

	function updateSfx(dt) {
		// try limiting the max change per frame
		dt = Math.min(dt, 32);
		var isAnyBlipPlaying = false;

		if (activeSfx != null) {
			isAnyBlipPlaying = true;
			var sfx = activeSfx;

			sfx.timer += dt;
			if (sfx.timer >= sfx.duration) {
				sfx.timer = sfx.duration;
			}

			if (sfx.frequencies.length > 0) {
				// update pitch
				var prevPitchIndex = sfx.pitchIndex;
				var freq = sfxFrequencyAtTime(sfx, sfx.timer);
				if (prevPitchIndex != sfx.pitchIndex) {
					// pitch changed!
					bitsy.frequency(bitsy.SOUND1, freq * 100);
				}

				// update volume envelope
				bitsy.volume(bitsy.SOUND1, sfxVolumeAtTime(sfx, sfx.timer));
			}

			if (sfx.timer >= sfx.duration) {
				// turn off sound
				bitsy.volume(bitsy.SOUND1, 0);
				activeSfx = null;
			}
		}

		if (isMusicPausedForBlip && !isAnyBlipPlaying) {
			isMusicPausedForBlip = false;
		}
	}

	function updateTune(dt) {
		if (curTune === undefined || curTune === null) {
			return;
		}

		beat16Timer += dt;

		if (muteTimer > 0) {
			muteTimer -= dt;
		}

		if (beat16Timer >= beat16) {
			beat16Timer = 0;
			beat16Index++;

			if (beat16Index >= 16) {
				beat16Index = 0;

				if (!isLooping) {
					barIndex = (barIndex + 1) % curTune.melody.length;

					if (curTune.arpeggioPattern != ArpeggioPattern.OFF && curTune.key != null) {
						curArpeggio = arpeggiateBar(curTune.harmony[barIndex], curTune.key, curTune.arpeggioPattern);
					}
				}
			}

			if (muteTimer <= 0) {
				if (!isMelodyMuted) {
					// melody note
					var pitchA = curTune.melody[barIndex][beat16Index];
					if (pitchA.beats > 0) {
						// since they're played on the same channel, any melody note will cancel a blip
						activeSfx = null;
					}

					if (pitchA.blip != undefined && pitchA.beats > 0) {
						playBlip(blip[pitchA.blip], { interruptMusic: false, pitch: pitchA, key: curTune.key });
					}
					else {
						playNote(pitchA, curTune.instrumentA, { channel: bitsy.SOUND1, key: curTune.key });
					}
				}

				if (curTune.arpeggioPattern === ArpeggioPattern.OFF) {
					// harmony note
					var pitchB = curTune.harmony[barIndex][beat16Index];
					if (pitchB.blip != undefined && pitchB.beats > 0) {
						playBlip(blip[pitchB.blip], { interruptMusic: false, pitch: pitchB, key: curTune.key });
					}
					else {
						playNote(pitchB, curTune.instrumentB, { channel: bitsy.SOUND2, key: curTune.key });
					}
				}
				else {
					var arpPitch = curArpeggio[beat16Index % curArpeggio.length];
					if (arpPitch != undefined && arpPitch.beats > 0) {
						playNote(arpPitch, curTune.instrumentB, { channel: bitsy.SOUND2, beatLen: beat16 });
					}
				}
			}

			if (maxBeatCount != null && beat16Index >= (maxBeatCount - 1)) {
				// stop playback early
				curTune = null;
			}
		}
	}

	this.update = function(dt) {
		updateSfx(dt);
		if (!isTunePaused && !isMusicPausedForBlip) {
			updateTune(dt);
		}
	};

	this.playTune = function(tune, options) {
		curTune = tune;
		beat16Timer = 0;
		beat16Index = -1;
		barIndex = 0;

		isLooping = false;
		isMelodyMuted = false;
		maxBeatCount = null;

		// special options for the editor
		if (options != undefined) {
			if (options.barIndex != undefined) {
				barIndex = options.barIndex;
			}

			if (options.loop != undefined) {
				isLooping = options.loop;
			}

			if (options.melody != undefined) {
				isMelodyMuted = !options.melody;
			}

			if (options.beatCount != undefined) {
				maxBeatCount = options.beatCount;
			}
		}

		// update tempo
		beat16 = tempos[curTune.tempo];

		if (curTune.arpeggioPattern != ArpeggioPattern.OFF && curTune.key != null) {
			curArpeggio = arpeggiateBar(curTune.harmony[barIndex], curTune.key, curTune.arpeggioPattern);
		}
	};

	this.isTunePlaying = function() {
		return curTune != null;
	};

	this.getCurTuneId = function() {
		if (curTune) {
			return curTune.id;
		}

		return null;
	};

	this.stopTune = function() {
		curTune = null;
	};

	this.pauseTune = function() {
		isTunePaused = true;
	};

	this.resumeTune = function() {
		isTunePaused = false;
	};

	this.getBeat = function() {
		if (curTune == null) {
			return null;
		}

		return {
			bar : barIndex,
			beat : beat16Index,
		};
	};

	this.getBlipState = function() {
		return activeSfx;
	};

	this.playNote = function(pitch, instrument, channel, key) {
		beat16 = tempos[Tempo.SLW];
		muteTimer = beat16;
		playNote(pitch, instrument, { channel: channel, key: key });
	};

	this.setTempo = function(tempo) {
		beat16 = tempos[tempo];
	};

	this.setLooping = function(looping) {
		isLooping = looping;
	};

	/* SOUND EFFECTS */
	var sfxPeakVolume = 10; // todo : is this a good value?
	var activeSfx = null;
	var isMusicPausedForBlip = false;

	function createSfxState(blip, pitch, isPitchRandomized) {
		// bitsy.log("init sfx blip: " + blip.id);

		var sfxState = {
			blip : blip,
			pitchIndex : -1,
			frequencies : [],
			timer : 0,
			duration : 0,
		};

		// is it weird to track this both in the system *AND* the engine?
		sfxState.duration = (blip.envelope.attack + blip.envelope.decay + blip.envelope.length + blip.envelope.release);

		// adjust starting pitch
		var step = 0;
		if (pitch != null) {
			step = pitchDistance(blip.pitchA, pitch);
		}
		else if (isPitchRandomized > 0) {
			step = Math.floor(Math.random() * 6);
		}

		if (blip.pitchA.beats > 0) {
			sfxState.frequencies.push(makePitchFrequency(adjustPitch(blip.pitchA, step)));
		}
		if (blip.pitchB.beats > 0) {
			sfxState.frequencies.push(makePitchFrequency(adjustPitch(blip.pitchB, step)));
		}
		if (blip.pitchC.beats > 0) {
			sfxState.frequencies.push(makePitchFrequency(adjustPitch(blip.pitchC, step)));
		}

		return sfxState;
	}

	function playBlip(blip, options) {
		// default to pausing music while the blip plays (except when playing a blip as *part* of music)
		isMusicPausedForBlip = (options === undefined || options.interruptMusic === undefined) ? true : options.interruptMusic;

		// always play blips on channel 1
		var channel = bitsy.SOUND1;

		// other options
		var pitch = (options === undefined || options.pitch === undefined) ? null : options.pitch;
		var isPitchRandomized = (options === undefined || options.isPitchRandomized === undefined) ? false : options.isPitchRandomized;
		var key = (options != undefined && options.key != undefined) ? options.key : null;

		activeSfx = createSfxState(blip, pitchToChromatic(pitch, key), isPitchRandomized);
		bitsy.log("play blip: " + activeSfx.frequencies);

		bitsy.sound(
			channel,
			activeSfx.duration * 10, // HACK : mult by 10 is to avoid accidentally turning off early
			activeSfx.frequencies.length > 0 ? (activeSfx.frequencies[0] * 100) : 0,
			0, // volume
			activeSfx.blip.instrument);
	};

	this.playBlip = playBlip;

	this.isBlipPlaying = function() {
		return isMusicPausedForBlip; // todo : rename this variable?
	};

	// todo : should any of this stuff be moved into the tool code?
	this.sampleBlip = function(blip, sampleCount) {
		var sfx = createSfxState(blip, null, false);

		var minFreq = makePitchFrequency({ note: Note.C, octave: Octave[2] });
		var maxFreq = makePitchFrequency({ note: Note.B, octave: Octave[5] });

		// sample the frequency of the sound
		var frequencySamples = [];
		for (var i = 0; i < sampleCount; i++) {
			if (sfx.frequencies.length > 0) {
				var t = Math.floor((i / sampleCount) * sfx.duration);
				// get frequency at time
				var freq = sfxFrequencyAtTime(sfx, t);
				// normalize the sample
				freq = freq / (maxFreq - minFreq);

				frequencySamples.push(freq);
			}
			else {
				frequencySamples.push(0);
			}
		}

		// sample the volume envelope
		var amplitudeSamples = [];
		for (var i = 0; i < sampleCount; i++) {
			var t = Math.floor((i / sampleCount) * sfx.duration);
			amplitudeSamples.push(sfxVolumeAtTime(sfx, t) / maxVolume);
		}

		return {
			frequencies: frequencySamples,
			amplitudes: amplitudeSamples
		};
	};
}