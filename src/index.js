const context = new AudioContext();

///\\\ *** SEQUENCER *** \\\///

const buffers = {};

const samples = {
	kick: 'http://localhost:8000/kick.wav',
	hat: 'http://localhost:8000/hat.wav',
	snare: 'http://localhost:8000/snare.wav'
};

// fetch samples
const samplePromises = [ fetch(samples.kick), fetch(samples.hat), fetch(samples.snare) ]; // Object.values

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

///\\\ *** CANVAS *** \\\///

const sequence = { kick: [], snare: [], hat: [] };

function createTrack(canvas, sample, colour) {
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = colour;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const barWidth = canvas.width / 8; // 8 bar phrase
	
	for (let i = 1 ; i < 8 ; i++) {
		ctx.beginPath();
		ctx.strokeStyle = 'white';
		ctx.moveTo(barWidth * i, 0);
		ctx.lineTo(barWidth * i, canvas.height);
		ctx.stroke();
	}

	canvas.addEventListener('click', function(event) {
		const canvasRect = canvas.getBoundingClientRect();

		const clickPos = {
			x: event.clientX - canvasRect.left,
			y: event.clientY - canvasRect.top
		};

		ctx.fillStyle = 'white';
		ctx.fillRect(clickPos.x, 0, 5, canvas.height);

		sequence[sample].push(clickPos.x / barWidth);
	});
}

createTrack(document.getElementById('kick-track'), 'kick', 'black');
createTrack(document.getElementById('snare-track'), 'snare', 'green');
createTrack(document.getElementById('hat-track'), 'hat', 'red');

///\\\ *** INTERACTION *** \\\///

window.onkeydown = function(event) {
	switch(event.keyCode) {
	    case 65:
	    	playPhrase(0, sequence);
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