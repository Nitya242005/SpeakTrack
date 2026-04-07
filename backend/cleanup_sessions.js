const mongoose = require("mongoose");
require('dotenv').config();

const SpeechAnalysis = require("./models/SpeechAnalysis");

async function cleanupSessions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find sessions with "AI unavailable"
    const results = await SpeechAnalysis.find({
      "aiAnalysis.grammarExplanation": "AI unavailable"
    });

    console.log(`Found ${results.length} sessions with unavailable AI.`);

    if (results.length > 0) {
      const deleteResult = await SpeechAnalysis.deleteMany({
        "aiAnalysis.grammarExplanation": "AI unavailable"
      });
      console.log(`Successfully deleted ${deleteResult.deletedCount} sessions.`);
    } else {
      console.log("No matching sessions found.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
}

cleanupSessions();
