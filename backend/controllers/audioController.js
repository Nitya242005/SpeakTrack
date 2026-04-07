const axios = require("axios");
const { analyzeWithGemini, analyzeProgressWithGemini } = require("../utils/geminiService");
const SpeechAnalysis = require("../models/SpeechAnalysis");


// ------------------------------
// TEXT ANALYSIS CONTROLLER
// ------------------------------
exports.analyzeText = async (req, res) => {
  try {
    const { text, totalTime, pauses } = req.body;
    console.log("Analyzing speech for user:", req.user.id, "| Duration:", totalTime);


    // -------------------------
    // VALIDATION
    // -------------------------
    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "No speech text received",
      });
    }


    // -------------------------
    // WORD ANALYSIS
    // -------------------------
    const words = text.split(/\s+/).filter(Boolean);

    const totalWords = words.length;
    const uniqueWords = new Set(words).size;

    const vocabularyScore = Math.round(
      (uniqueWords / totalWords) * 100
    );


    const fillerWords = [
      "um", "uh", "like", "you know", "actually", "basically",
      "literally", "hmm", "so", "well", "okay", "right",
      "i mean", "sort of", "kind of", "just", "anyway"
    ];

    let fillerCount = 0;
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      fillerCount += (text.match(regex) || []).length;
    });

    // -------------------------
    // ADVANCED METRICS
    // -------------------------
    const duration = totalTime || 1; // avoid divide by zero
    const wpm = Math.round((totalWords / duration) * 60);
    const pauseCount = (pauses || []).length;
    const fillerDensity = Number(((fillerCount / totalWords) * 100).toFixed(2));


    // -------------------------
    // BASIC GRAMMAR (LanguageTool) - Resilient to API failure
    // -------------------------
    let grammarErrors = [];
    try {
      const grammarResponse = await axios.post(
        "https://api.languagetool.org/v2/check",
        new URLSearchParams({
          text,
          language: "en-US"
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 4000 // 4s timeout for grammar check
        }
      );

      grammarErrors = grammarResponse.data.matches
        .filter(err => {
          const ignoredRules = [
            'UPPERCASE_SENTENCE_START',
            'LC_AFTER_PERIOD',
            'I_LOWERCASE',
            'SENTENCE_WHITESPACE',
            'WHITESPACE_RULE',
            'COMMA_PARENTHESIS_WHITESPACE',
            'MORFOLOGIK_RULE_EN_US', // Ignore spelling
            'EN_COMPOUNDS',           // Ignore compound suggestions
            'PUNCTUATION_PARAGRAPH_END',
            'HE_HYPHEN',             // Ignore hyphenation
            'HYPHEN_BETWEEN_NUMBERS',
            'MISSING_PERIOD',
            'UNLIKELY_OPENING_PUNCTUATION',
            'MULTIPLE_PUNCTUATION',
            'EN_QUOTES',
            'COMMA_WHITESPACE'
          ];
          return !ignoredRules.includes(err.rule.id);
        })
        .map(err => ({
          message: err.message,
          wrongText: text.substring(
            err.offset,
            err.offset + err.length
          ),
          suggestion: err.replacements[0]?.value || "No suggestion",
        }));
    } catch (ltErr) {
      console.warn("LanguageTool API failed or timed out. Skipping grammar check.");
    }


    // -------------------------
    // FLUENCY SCORE
    // -------------------------
    let fluencyScore = 100;

    if (fillerCount > 6) fluencyScore -= 20;
    if (totalWords < 25) fluencyScore -= 15;
    if (vocabularyScore < 40) fluencyScore -= 15;
    if (grammarErrors.length > 3) fluencyScore -= 20;

    fluencyScore = Math.max(0, fluencyScore);


    // -------------------------
    // GEMINI AI ANALYSIS
    // -------------------------
    // Now Gemini already returns OBJECT
    const aiAnalysis = await analyzeWithGemini(text);


    // -------------------------
    // MERGE GRAMMAR RESULTS
    // -------------------------
    const geminiMistakes = aiAnalysis.grammarMistakes || [];
    
    // Simple merge (Gemini is higher fidelity for structure)
    const combinedGrammar = [...grammarErrors, ...geminiMistakes];


    // -------------------------
    // FINAL RESPONSE
    // -------------------------
    res.json({
      message: "Speech analyzed successfully",
      analysis: {
        transcript: text,
        totalWords,
        uniqueWords,
        fillerCount,
        vocabularyScore,
        fluencyScore,
        grammarErrors: combinedGrammar,
        aiAnalysis,
        wpm,
        duration,
        pauseCount,
        fillerDensity
      },
    });

    // -------------------------
    // DB STORAGE (Background)
    // -------------------------
    try {
      await SpeechAnalysis.create({
        userId: req.user.id,
        transcript: text,
        totalWords,
        fillerCount,
        vocabularyScore,
        fluencyScore,
        aiAnalysis,
        duration,
        wpm,
        pauseCount,
        fillerDensity
      });
      console.log("Analysis saved to MongoDB for user:", req.user.id);
    } catch (dbErr) {
      console.error("DB SAVE ERROR:", dbErr);
    }

  } catch (err) {

    console.error("ANALYSIS ERROR:", err);

    return res.status(500).json({
      message: "Analysis failed",
      error: err.message,
    });
  }
};


// ------------------------------
// FETCH HISTORY
// ------------------------------
exports.getHistory = async (req, res) => {
  try {
    const history = await SpeechAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (err) {
    console.error("HISTORY FETCH ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch history",
      error: err.message
    });
  }
};


// ------------------------------
// ANALYTICS CALCULATIONS
// ------------------------------
exports.getAnalytics = async (req, res) => {
  try {
    const sessions = await SpeechAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: 1 }); // Sort oldest to newest for trends

    if (!sessions || sessions.length === 0) {
      return res.json({
        success: true,
        data: {
          totalSessions: 0,
          avgFluency: 0,
          avgVocabulary: 0,
          totalFillers: 0,
          trends: { dates: [], fluency: [], vocabulary: [], fillers: [], totalWords: [] },
          insights: ["Start your first session to see analytics!"]
        }
      });
    }

    // Basic Stats
    const totalSessions = sessions.length;
    let totalFluency = 0;
    let totalVocab = 0;
    let totalFillers = 0;

    // Trend Arrays
    const dates = [];
    const fluencyTrend = [];
    const vocabularyTrend = [];
    const fillerTrend = [];
    const totalWordsTrend = [];

    sessions.forEach(s => {
      totalFluency += s.fluencyScore || 0;
      totalVocab += s.vocabularyScore || 0;
      totalFillers += s.fillerCount || 0;

      dates.push(new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      fluencyTrend.push(Number(s.fluencyScore) || 0);
      vocabularyTrend.push(Number(s.vocabularyScore) || 0);
      fillerTrend.push(Number(s.fillerCount) || 0);
      totalWordsTrend.push(Number(s.totalWords) || 0);
    });

    const avgFluency = Math.round(totalFluency / totalSessions);
    const avgVocabulary = Math.round(totalVocab / totalSessions);

    // Insight Logic
    const insights = [];
    if (avgFluency < 70) insights.push("Your fluency score is below target. Try speaking slower and focusing on sentence connection.");
    if (totalFillers / totalSessions > 5) insights.push("You are using many filler words. Practice pausing intentionally instead of saying 'um' or 'like'.");
    if (avgVocabulary < 65) insights.push("Try incorporating more diverse vocabulary to boost your Vocab IQ.");
    if (fluencyTrend.length > 2 && fluencyTrend[fluencyTrend.length-1] > fluencyTrend[fluencyTrend.length-2]) {
      insights.push("Great job! Your fluency is on an upward trend.");
    }

    res.json({
      success: true,
      data: {
        totalSessions,
        avgFluency,
        avgVocabulary,
        totalFillers,
        trends: {
          dates,
          fluency: fluencyTrend,
          vocabulary: vocabularyTrend,
          fillers: fillerTrend,
          totalWords: totalWordsTrend
        },
        insights
      }
    });

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({
      message: "Failed to generate analytics",
      error: err.message
    });
  }
};


// ------------------------------
// AI PROGRESS ANALYSIS
// ------------------------------
exports.aiProgressAnalysis = async (req, res) => {
  try {
    // 1. Fetch History (Limit 15)
    const history = await SpeechAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .limit(15);

    if (!history || history.length === 0) {
      return res.status(400).json({
        message: "Not enough session data for AI progress analysis."
      });
    }

    // 2. Prepare Data for AI
    const formattedData = history.map(h => ({
      date: h.createdAt,
      stats: {
        totalWords: h.totalWords,
        wpm: h.wpm || 'N/A',
        fluency: h.fluencyScore,
        vocabulary: h.vocabularyScore,
        fillers: h.fillerCount,
        pauseCount: h.pauseCount || 0,
        fillerDensity: h.fillerDensity || 0
      },
      insights: h.aiAnalysis
    }));

    // 3. Call AI
    const aiImpact = await analyzeProgressWithGemini(formattedData);

    res.json({
      success: true,
      analysis: aiImpact
    });

  } catch (err) {
    console.error("AI PROGRESS ERROR:", err);
    res.status(500).json({
      message: "AI Progress Analysis failed",
      error: err.message
    });
  }
};


