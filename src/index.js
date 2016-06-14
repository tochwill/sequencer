const context = new AudioContext();

///\\\ *** SEQUENCER *** \\\///

const buffers = {};

const samples = {
	kick: 'http://localhost:8000/kick.wav',
	hat: 'http://localhost:8000/hat.wav',
	snare: 'http://localhost:8000/snare.wav'
};

// fetch samples
const samplePromises = [ fetch(samples.kick), fetch(samples.hat), fetch(samples.snare) ];

Promise.all(samplePromises).then((sampleResponses) => {
	sampleResponses.forEach((response, i) => {
		response.arrayBuffer().then((arrayBuffer) => {
			context.decodeAudioData(arrayBuffer, (audioBuffer) => {
				buffers[Object.keys(samples)[i]] = audioBuffer;
			});
		});
	});
});

// create source in audio context and add audio buffer to it
function playSample(sample, bar) {
	var time = bar * 0.46; // about 130 bpm 
	var source = context.createBufferSource();
	source.buffer = buffers[sample];
	source.connect(context.destination);
	source.start(context.currentTime + time);
}

function playPhrase(firstBar, noteObject) {
	for (sample in noteObject) {
		noteObject[sample].forEach((bar) => {
			playSample(sample, bar + firstBar);
		});	
	}
}

// sequences
const intro = { kick: [ 0, 1, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 5, 6, 7 ] };

const verse = {
	kick: [ 0, 1, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 5, 6, 7 ],
	hat: [ 0.5, 0.75, 1.5, 1.75, 2.5, 2.75, 3.5, 3.75, 4.5, 4.75, 5.5, 5.75, 6.5, 6.75, 7.5, 7.75 ],
	snare: [ 1, 3, 5, 7 ]
};

function playIntro(firstBar) {
	playPhrase(firstBar, intro);
}

function playVerse(firstBar) {
	playPhrase(firstBar, verse)

	if (firstBar < 200) {
		playVerse(firstBar + 8, verse);	
	}
}

///\\\ *** SYNTHESIZER *** \\\///

// create a filter and a gain node
const filterNode = context.createBiquadFilter();
filterNode.type = 'lowpass';
filterNode.frequency.value = 10000;
filterNode.connect(context.destination);

const filterVal = document.getElementById('filterVal');

filterVal.addEventListener('input', function(event) {
	filterNode.frequency.value = event.target.value;
});

const gainNode = context.createGain();
gainNode.gain.value = 0.5;
gainNode.connect(filterNode);

// play oscillator of given frequency
function playOscillator(frequency) {
	var oscillator = context.createOscillator();
	oscillator.type = 'square';
	oscillator.frequency.value = frequency;
	oscillator.connect(gainNode);
	oscillator.start(context.currentTime);
	oscillator.stop(context.currentTime + 0.25);
}

///\\\ *** INTERACTION *** \\\///

window.onkeydown = function(event) {
	switch(event.keyCode) {
	    case 65:
	    	playIntro(0);
	    	playIntro(8);
	        playVerse(16);
	        break;
	    case 72:
	        playOscillator(65.41);
	        break;
	    case 74:
	        playOscillator(73.42);
	        break;
	    case 75:
	        playOscillator(87.31);
	        break;
	    case 76:
	        playOscillator(98.00);
	        break;
	    default:
	        break;
	}
};