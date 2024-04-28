// models/Link.js
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    instagramUrl: { type: String, required: true, unique: true },
    responseUrl: { type: String, required: true }
});

module.exports = mongoose.model('Link', linkSchema);
