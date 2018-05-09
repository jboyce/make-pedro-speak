const AWS = require('aws-sdk');
const Stream = require('stream');
const Speaker = require('speaker');
const socket = require('./io').io();

require('./awsauth.js');
const polly = new AWS.Polly(
	//{logger: console}
);

module.exports.speak = function(text){
	socket.emit('speakingStarted', { text: text });
	
	const ssmlMessage = `<speak>
        <prosody volume="+10dB">
        ${text}
        </prosody>
        </speak>`;

	const params = {
		TextType: "ssml",
		Text: ssmlMessage,
		OutputFormat: 'pcm',
		VoiceId: 'Ivy'
	};

	const speaker = new Speaker({
		channels: 1,
		bitDepth: 16,
		sampleRate: 16000
	});

	polly.synthesizeSpeech(params, (err, data) => {
		if (err) {
			console.log(err.code);
		} else if (data) {
			console.log("retrieved audio buffer from aws.");

			if (data.AudioStream instanceof Buffer) {
                var bufferStream = new Stream.PassThrough();
				bufferStream.end(data.AudioStream);

				bufferStream.on('readable', function() {
					var chunk;
					while (null !== (chunk = bufferStream.read())) {
						console.log("Writing")
						speaker.write(chunk);
						console.log("Stopping")
						speaker.end();
					}
					setTimeout(() => socket.emit('speakingStopped'), 2000);
				});
			}
		}
	});
}