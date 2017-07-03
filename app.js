const AWS = require('aws-sdk');
const Stream = require('stream')
const Speaker = require('speaker')
require('./awsauth.js');

const polly = new AWS.Polly();

const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 16000
});

const params = {
    Text: "You forgot a semicolon.",
    OutputFormat: 'pcm',
    VoiceId: 'Ivy'
};

polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
        console.log(err.code)
    } else if (data) {
        if (data.AudioStream instanceof Buffer) {
            // Initiate the source
            var bufferStream = new Stream.PassThrough()
            // convert AudioStream into a readable stream
            bufferStream.end(data.AudioStream)
            // Pipe into Player
            bufferStream.pipe(speaker)
        }
    }
});