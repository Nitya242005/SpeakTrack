// backend/routes/textRoutes.js

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { analyzeText, getHistory, getAnalytics, aiProgressAnalysis } = require("../controllers/audioController");

// Protected route for speech analysis
router.post("/analyze-text", auth, analyzeText);

// Protected route for session history
router.get("/history", auth, getHistory);

// Protected route for analytics
router.get("/analytics", auth, getAnalytics);

// Protected route for coaching
router.post("/ai-progress-analysis", auth, aiProgressAnalysis);

module.exports = router;
