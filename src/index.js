var context = new AudioContext();
var sources = [];

var promises = [
	fetch('http://localhost:8000/kick.wav'),
	fetch('http://localhost:8000/hat.wav'),
	fetch('http://localhost:8000/snare.aiff')
];

var setup = new Promise(function(resolve) {
	Promise.all(promises)
	.then(function(resolved) {
		resolved.forEach(function(res) {
			var source = context.createBufferSource();
			return res.arrayBuffer().then(function(buffer) {
				console.log('i')
				return context.decodeAudioData(buffer).then(function(buffer) { // update chrome
					sources.push(source);
					source.buffer = buffer;
					source.connect(context.destination);
				})
			})
		});
		resolve();
	});
});

setup.then(function() {
	console.log(sources)
});