const raspiCam = require('raspicam');
const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucket = "rekognition-pedro";
const imageLocation = "./images/image.jpg";
var events = require('events');
var rekognized = new events.EventEmitter();
module.exports = rekognized;

var dontKnowPersonPhrases = fs.readFileSync('./common/dontKnowPersonPhrases.txt').toString().split("\n");
var knowPersonPhrases = fs.readFileSync('./common/knowPersonPhrases.txt').toString().split("\n");

require('./awsauth.js');
const rekognition = new AWS.Rekognition(
	{logger: console}
);
const camera = new raspiCam({
    mode:"photo",
    output: imageLocation
});

module.exports.identify = function() {
    camera.start();
};

function searchFacesByImage(params) {
    rekognition.searchFacesByImage(params, function(err, data) {
        var noData = {FaceMatches: {Face:{}}};
        if (err) {
            console.log(err, err.stack);
            doesPedroKnowsthePerson(noData);
        } else {
            console.log(data.FaceMatches);
            doesPedroKnowsthePerson(data);
        };
    });
}

function doesPedroKnowsthePerson(data) {
    if (data.FaceMatches.length > 0 && 'ExternalImageId' in data.FaceMatches[0].Face) {
        var name = data.FaceMatches[0].Face.ExternalImageId;
        name = name.replace(/([A-Z])/g, ' $1');

        var phrase = pickAPhrase(knowPersonPhrases) + ' ' + name;
    } else {
        var phrase = pickAPhrase(dontKnowPersonPhrases);
    }

    rekognized.emit('rekognized', phrase);
}

function pickAPhrase (phraseList) {
    var phrase = phraseList[Math.floor(Math.random() * phraseList.length)];
    return phrase;
}

camera.on("read", function(){
    fs.readFile(imageLocation, function(err,fileData) {
        var faceParams = {};
        faceParams = {
            CollectionId: "pedro",
            FaceMatchThreshold: 90,
            Image: {
                'Bytes': fileData
            },
            MaxFaces: 1
        }
        searchFacesByImage(faceParams);
    });
});
