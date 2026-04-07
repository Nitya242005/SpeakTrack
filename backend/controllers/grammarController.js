const axios = require("axios");

exports.checkGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "No text provided" });
    }

    // Call LanguageTool API
    const response = await axios.post(
      "https://api.languagetool.org/v2/check",
      new URLSearchParams({
        text: text,
        language: "en-US",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const matches = response.data.matches;

    const errors = matches.map((err) => ({
      message: err.message,
      category: err.rule.category.name,
      wrongText: text.substring(err.offset, err.offset + err.length),
      suggestions: err.replacements.map((r) => r.value),
    }));

    // Count categories
    const errorSummary = {};

    errors.forEach((e) => {
      if (errorSummary[e.category]) {
        errorSummary[e.category]++;
      } else {
        errorSummary[e.category] = 1;
      }
    });

    res.json({
      message: "Grammar analysis completed",
      totalErrors: errors.length,
      errorSummary,
      errors,
    });

  } catch (err) {
    console.error("GRAMMAR ERROR:", err);

    res.status(500).json({
      message: "Grammar check failed",
      error: err.message,
    });
  }
};
