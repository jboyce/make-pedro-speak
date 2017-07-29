const AWS = require('aws-sdk');
const os = require('os');
require('./awsauth.js');

if (process.argv.length != 3)
    throw "email address must be passed on the command line.";

const emailAddress = process.argv[2];

var interfaces = os.networkInterfaces();

var addresses = [];
for (var name in interfaces) {
    for (var interface in interfaces[name]) {
        var address = interfaces[name][interface];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(name + ":" + address.address);
        }
    }
}
console.log(addresses);

var ses = new AWS.SES({apiVersion: '2010-12-01'});

ses.sendEmail({ 
   Source: emailAddress, 
   Destination: { ToAddresses: [ emailAddress ] },
   Message: {
       Subject: { Data: 'IP Address of your Raspberry Pi' },
       Body: { Text: { Data: addresses.toString() } }
   }
}, (err, data) => { if(err) throw err });
