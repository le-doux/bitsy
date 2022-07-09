// init global audio context
var audioContext = new AudioContext();

function enableGlobalAudioContext() {
	audioContext.resume();
}

function SoundSystem() {
	var self = this;

	// volume
	var maxGain = 0.15;

	// curves for different pulse wave duties (ratios between on and off)
	var dutyCycle_1_8 = new Float32Array(256);
	for (var i = 0; i < 256; i++) {
		dutyCycle_1_8[i] = ((i / 256) * 2) - 1.75;
	}

	var dutyCycle_1_4 = new Float32Array(256);
	for (var i = 0; i < 256; i++) {
		dutyCycle_1_4[i] = ((i / 256) * 2) - 1.5;
	}

	var dutyCycle_1_2 = new Float32Array(256);
	for (var i = 0; i < 256; i++) {
		dutyCycle_1_2[i] = ((i / 256) * 2) - 1.0;
	}

	var dutyCycles = [
		dutyCycle_1_8,
		dutyCycle_1_4,
		dutyCycle_1_2 // square wave
	];

	function createPulseWidthModulator() {
		// the base oscillator: start with a sawtooth wave that we'll shape into a pulse wave
		var oscillator = audioContext.createOscillator();
		oscillator.type = "sawtooth";

		// create a gain node to control the volume of the sound
		var volumeControl = audioContext.createGain();
		volumeControl.gain.value = 0;

		// create a wave shaper that turns the sawtooth wave into a pulse
		// by mapping any negative value to -1 and any positive value to 1
		var pulseCurve = new Float32Array(256);
		for (var i = 0; i < 128; i++) {
			pulseCurve[i] = -1;
		}
		for (var i = 128; i < 256; i++) {
			pulseCurve[i] = 1;
		}

		var pulseShaper = audioContext.createWaveShaper();
		pulseShaper.curve = pulseCurve;

		var dutyShaper = audioContext.createWaveShaper();
		dutyShaper.curve = dutyCycle_1_2;

		oscillator.connect(dutyShaper);
		dutyShaper.connect(pulseShaper);
		pulseShaper.connect(volumeControl);
		volumeControl.connect(audioContext.destination);
		oscillator.start();

		return {
			oscillator: oscillator,
			volumeControl: volumeControl,
			dutyShaper: dutyShaper
		};
	}

	var pulseChannels = [createPulseWidthModulator(), createPulseWidthModulator()];

	this.setPulse = function(channel, pulse) {
		var pulseChannel = pulseChannels[channel];
		pulseChannel.dutyShaper.curve = dutyCycles[pulse];
	}

	this.setFrequency = function(channel, frequencyHz) {
		var pulseChannel = pulseChannels[channel];
		// set frequency in hertz
		pulseChannel.oscillator.frequency.setValueAtTime(frequencyHz, audioContext.currentTime);
	}

	this.setVolume = function(channel, volumeNorm) {
		var pulseChannel = pulseChannels[channel];
		pulseChannel.volumeControl.gain.value = volumeNorm * maxGain;
	}

	this.mute = function() {
		for (var i = 0; i < pulseChannels.length; i++) {
			pulseChannels[i].volumeControl.gain.value = 0;
		}
	}
}

var sound = new SoundSystem();