'use strict';

var config = require("config");

const { IncomingWebhook } = require('@slack/client');
const url = config.get("contracts.DAI.slack_webhook_url");
const webhook = new IncomingWebhook(url);


exports.http = (request, response) => {
  // Send simple text to the webhook channel
  webhook.send('Hello there', function(err, res) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('Message sent: ', res);
    }
  });

  response.status(200).send('{"status":"OK"}');
};
