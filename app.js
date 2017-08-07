const AWS = require('aws-sdk');
const Stream = require('stream')
const Speaker = require('speaker')
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);

require('./awsauth.js');
const polly = new AWS.Polly();

const port = 8000;
app.use(express.static('client'))
app.use(bodyParser.text());
app.post('/speak', function (req, res) {
	console.log('received: ' + req.body);
	speak(req.body);
	res.send(req.body);	
});

server.listen(port, function () {
  console.log('Listening on port ' + port)
});

function speak(text) {
	io.emit('speakingStarted', { text: text });
	
	const formattedText = `<speak>
<prosody volume="+10dB">
${text}
</prosody>
</speak>`;

	const params = {
		TextType: "ssml",
		Text: formattedText,
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
			console.log(err.code)
		} else if (data) {
			if (data.AudioStream instanceof Buffer) {
                var bufferStream = new Stream.PassThrough();
				bufferStream.end(data.AudioStream)

				bufferStream.on('readable', function() {
					var chunk;
					while (null !== (chunk = bufferStream.read())) {
						speaker.write(chunk);
					}
					setTimeout(() => io.emit('speakingStopped'), 2000);
				});
			}
		}
	});
}
