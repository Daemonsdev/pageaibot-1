const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

const PAGE_ACCESS_TOKEN = 'EAAPGwu9YtzoBO1UC6MxD3K32WbA25TCd5M6VBVJm4GbqzM2MZAVRxTxZAVJm0yWHZCExKsgMM76ijSZBJVRIYouEvF4eigxZAzBcfJ2qkRMKDuVWsKwfREA6pUERpNoQkIbmt4hI6NZCuyyuqB4lcrvMtQolQWclhGuTxqilh9Vgzg9Tp9FpVo6l4k4mnAQWhZCTgZDZD';
const VERIFY_TOKEN = 'pageai';

app.use(bodyParser.json());

// Dynamically load all command modules
let commands = {};
const commandsPath = path.join(__dirname, 'commands');

fs.readdirSync(commandsPath).forEach(file => {
    const command = require(path.join(commandsPath, file));
    commands[command.name] = command;
});

app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                verifyUserRole(sender_psid, () => handleMessage(sender_psid, webhook_event.message));
            } else if (webhook_event.postback) {
                verifyUserRole(sender_psid, () => handlePostback(sender_psid, webhook_event.postback));
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

function verifyUserRole(sender_psid, callback) {
    callback();
}

async function handleMessage(sender_psid, received_message) {
    let response;

    if (received_message.text) {
        let messageText = received_message.text.toLowerCase();

        // Check if the message matches a help command
        response = commands['help'].execute(messageText);
    } else if (received_message.attachments) {
        let attachment_url = received_message.attachments[0].payload.url;

        // Use AI to describe the attachment
        const aiDescription = await commands['ai'].execute(`Describe this image: ${attachment_url}`);
        response = { "text": `AI's description of the image: ${aiDescription}` };
    }

    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    let response;

    let payload = received_postback.payload;

    if (payload === 'yes') {
        response = { "text": "Thanks!" };
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." };
    }

    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    request({
        "uri": "https://graph.facebook.com/v12.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

app.listen(process.env.PORT || 3000, () => console.log('Webhook is listening'));

module.exports = app;
