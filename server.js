require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');

const app = express();
connectDB(); // Connect to MongoDB

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        console.log("Webhook verified");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error('Failed verification. Make sure the verification tokens match.');
        res.sendStatus(403);             
    }  
});

app.post('/webhook', (req, res) => {
    let body = req.body;
    if (body.object === 'instagram') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            // Process the Instagram event here
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
