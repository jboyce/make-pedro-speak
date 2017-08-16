const AWS = require('aws-sdk');
const httpsAgent = require('https').Agent
const keepAliveAgent = new httpsAgent({maxSockets:1, keepAlive:true})

// Load AWS credentials
AWS.config.loadFromPath(__dirname + '/awscreds.json');

AWS.config.update({
    httpOptions: { agent: keepAliveAgent }
});
