const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models (priority)
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro"
];

// Default fallback
function getDefaultResponse() {
  return {
    correctedSentence: "",
    grammarExplanation: "AI unavailable",
    grammarMistakes: [],
    tenseCorrection: "",
    fluencyTips: "",
    vocabularySuggestions: "",
    speakingSuggestions: ""
  };
}

// Try to repair broken JSON
function repairJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    let jsonText = match[0];

    // Fix common issues
    jsonText = jsonText
      .replace(/\n/g, "")
      .replace(/\t/g, "")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    return JSON.parse(jsonText);

  } catch {
    return null;
  }
}

// Main function
async function analyzeWithGemini(text) {

  const prompt = `
You are a elite communication coach specializing in SPOKEN eloquence.
The input is a RAW TRANSCRIPT from a live speech-to-text recording.

CRITICAL INSTRUCTIONS:
1. FORGET WRITTEN MECHANICS: Ignore all missing leading capitals, hyphens, and punctuation. STT engines often fail at these; do NOT report them.
2. LOGICAL SPEECH ONLY: Focus on actual vocal errors: tense mismatches, subject-verb agreement, and word choice.
3. FLOW & PACING: Identify where the speaker is circular or repetitive in their thoughts.
4. NATURAL SPOKEN POLISH: Suggest a version that is natural for an English speaker to SAY aloud, not a formal written essay.

Input Transcript: "${text}"

Return ONLY valid JSON:
{
  "correctedSentence": "A polished, natural version for spoken delivery",
  "grammarExplanation": "Focus on actual linguistic structure, NOT casing/punctuation",
  "grammarMistakes": [
    { "message": "Example: 'He go' → 'He went' (Tense mismatch)", "wrongText": "The original spoken snippet", "suggestion": "The corrected snippet" }
  ],
  "tenseCorrection": "Identify specific tense flipping if present",
  "fluencyTips": "How to sound more confident and rhythmic",
  "vocabularySuggestions": "Stronger spoken alternatives for basic vocabulary",
  "speakingSuggestions": "Strategic advice for delivery and overall impact"
}

Do NOT add explanation outside the JSON.
Do NOT add markdown blocks.
`;

  for (const modelName of MODELS) {

    try {

      console.log("🔍 Trying:", modelName);

      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);

      const raw = result.response.text();

      console.log("[Gemini][Raw]:", raw);

      // 1️⃣ Try normal parse
      try {
        const parsed = JSON.parse(raw);

        console.log("[Gemini][Parsed]:", parsed);

        return parsed;

      } catch (e) {

        console.warn("[Gemini] Normal parse failed");

        // 2️⃣ Try repair
        const repaired = repairJSON(raw);

        if (repaired) {

          console.log("[Gemini][Repaired]:", repaired);

          return repaired;
        }

        console.warn("[Gemini] Repair failed");
      }

    } catch (err) {
      console.warn(`❌ Failed with ${modelName}:`, err.message);
    }
  }

  console.error("🚨 All Gemini attempts failed");
  return getDefaultResponse();
}

async function analyzeProgressWithGemini(historyData) {
  const prompt = `
You are an advanced AI communication coach.
Analyze the user's speaking performance history over time.
The data includes multiple sessions with specific metrics.

User History Data:
${JSON.stringify(historyData, null, 2)}

Your task is to:
1. Identify high-level trends (Summary)
2. Call out specific metrics that improved (Improvements)
3. Identify dips or recurring weaknesses (Weak Areas)
4. Explain the user's behavioral pattern (Pattern)
5. Provide a data-driven 3-step action plan (Action Plan)
6. Set one measurable goal for the next session (Next Goal)

Return STRICT JSON ONLY:
{
  "summary": "...",
  "improvements": ["...", "..."],
  "weakAreas": ["...", "..."],
  "pattern": "...",
  "actionPlan": ["...", "...", "..."],
  "nextGoal": "..."
}

Do NOT add markdown blocks or prose.
`;

  for (const modelName of MODELS) {
    try {
      console.log("🔍 [Progress] Trying:", modelName);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      
      try {
        return JSON.parse(raw);
      } catch (e) {
        const repaired = repairJSON(raw);
        if (repaired) return repaired;
      }
    } catch (err) {
      console.warn(`❌ [Progress] Failed with ${modelName}:`, err.message);
    }
  }

  return {
    summary: "Historical analysis incomplete due to technical reasons.",
    improvements: ["N/A"],
    weakAreas: ["N/A"],
    pattern: "N/A",
    actionPlan: ["Continue practicing to generate more data."],
    nextGoal: "Complete 1 session"
  };
}

module.exports = { analyzeWithGemini, analyzeProgressWithGemini };





