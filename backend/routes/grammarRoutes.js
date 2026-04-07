const express = require("express");
const router = express.Router();

const { checkGrammar } = require("../controllers/grammarController");
const auth = require("../middleware/authMiddleware");

// Protected grammar route
router.post("/check", checkGrammar);

module.exports = router;
