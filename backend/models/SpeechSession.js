// backend/models/SpeechSession.js

const mongoose = require("mongoose");

const speechSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    transcript: {
        type: String,
        required: true,
        trim: true
    },

    // Number of filler words (um, uh, like, etc.)
    fillerCount: {
        type: Number,
        required: true
    },

    // Number of hesitation pauses detected
    hesitationCount: {
        type: Number,
        required: true
    },

    // Words per minute
    wpm: {
        type: Number,
        required: true
    },

    // Percentage of unique words in transcript
    vocabularyRichness: {
        type: Number,
        required: true
    },

    // Final AI-generated score (0–100)
    fluencyScore: {
        type: Number,
        required: true
    },

    // List of improvement suggestions
    suggestions: [
        {
            type: String,
            trim: true
        }
    ],

    // For future dashboard filters
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("SpeechSession", speechSessionSchema);
