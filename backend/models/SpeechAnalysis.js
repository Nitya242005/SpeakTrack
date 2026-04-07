const mongoose = require("mongoose");

const SpeechAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  transcript: {
    type: String,
    required: true
  },
  totalWords: {
    type: Number
  },
  fillerCount: {
    type: Number
  },
  vocabularyScore: {
    type: Number
  },
  fluencyScore: {
    type: Number
  },
  duration: {
    type: Number // seconds
  },
  wpm: {
    type: Number
  },
  pauseCount: {
    type: Number
  },
  fillerDensity: {
    type: Number // per 100 words
  },
  aiAnalysis: {
    correctedSentence: String,
    grammarExplanation: String,
    tenseCorrection: String,
    fluencyTips: String,
    vocabularySuggestions: String,
    speakingSuggestions: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SpeechAnalysis", SpeechAnalysisSchema);
