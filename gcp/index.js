

var config = require("config");
var fs = require("fs")
var Web3 = require("web3")
const { IncomingWebhook } = require('@slack/client');

const url = config.get("contracts.DAI.slack_webhook_url");
const webhook = new IncomingWebhook(url);

var daiAbi = JSON.parse(fs.readFileSync('daiAbi.json'));

var web3 = new Web3();

function decodeEvent(event, body) {
    var topics = event.inputs.filter(v => v.indexed)
    var data = event.inputs.filter(v => !v.indexed)

    var decodableTopics = body.topics.slice(1);

    var eventParams = {}
    for (var i in topics) {
        value = web3.eth.abi.decodeParameter(topics[i].type, decodableTopics[i])
        eventParams[topics[i].name] =  value;
    }

    var dataValues = web3.eth.abi.decodeParameters(data.map(v => v.type),  body.data)
    for (var i = 0; i < data.length; i++) {
        eventParams[data[i].name] = dataValues[i]
    }

    return eventParams;
}

function decodeEventFromAbi(abi, encodedEvent) {
    var eventsByKey = {}
    for (var index in abi) {
        var entry = abi[index]
        if (entry.type == 'event') {
            var key = web3.eth.abi.encodeEventSignature(entry);
            eventsByKey[key] = entry
        }
    }
    
    var event = eventsByKey[encodedEvent.topics[0]]
    return {"name":event.name, "data":decodeEvent(event, encodedEvent)}
}


exports.http = (request, response) => {
  console.log('hola');
  value = decodeEventFromAbi(daiAbi, request.body)
  // Send simple text to the webhook channel
  webhook.send(
    " webhook <<" + JSON.stringify(value) + ">>", function(err, res) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('Message sent: ', res);
    }
  });

  response.status(200).send('{"status":"OK"}');
};
