// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Link = require('./models/Link'); // Ensure the path is correct
const axios = require('axios');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from 'public' directory (where your form should be)
app.use(express.static('public'));

// Route to handle form submission
app.post('/submit', async (req, res) => {
    const { instagramUrl, responseUrl } = req.body;
    try {
        const newLink = await Link.create({ instagramUrl, responseUrl });
        res.status(201).send('URL successfully submitted!');
    } catch (error) {
        console.error('Failed to save URL:', error);
        res.status(500).send('Failed to submit URL.');
    }
});

// Instagram Webhooks handler
app.post('/webhook', async (req, res) => {
    // Validate X-Hub-Signature here if required
    const messaging = req.body.entry[0].messaging;
    for (let message of messaging) {
        const senderId = message.sender.id;
        const textReceived = message.message.text;
        const link = await Link.findOne({ instagramUrl: textReceived });
        if (link) {
            sendMessage(senderId, `Here's your specific URL: ${link.responseUrl}`);
        } else {
            sendMessage(senderId, 'No specific URL found for this post.');
        }
    }
    res.status(200).send('EVENT_RECEIVED');
});

// Function to send message via Instagram API
async function sendMessage(recipientId, messageText) {
    const url = `https://graph.facebook.com/v9.0/me/messages`;
    const params = {
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    };
    const data = {
        recipient: { id: recipientId },
        message: { text: messageText }
    };
    try {
        await axios.post(url, data, { params });
        console.log('Message sent');
    } catch (error) {
        console.error('Failed to send message:', error.response.data);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
