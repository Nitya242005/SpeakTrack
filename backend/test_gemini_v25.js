const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function verifyGeminiV25() {
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.5-pro"
  ];

  console.log("🚀 Starting Gemini v2.5 Verification...");

  for (const modelName of modelsToTest) {
    try {
      console.log(`🔍 Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Say 'System Online' in one sentence.");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS with ${modelName}!`);
      console.log(`[Response]: ${text}`);
    } catch (err) {
      console.error(`❌ FAILED with ${modelName}:`, err.message);
      if (err.message.includes("404")) {
          console.error(`[INFO] Model ${modelName} was not found (404). This usually means the model name is invalid or not yet released.`);
      }
    }
  }
}

verifyGeminiV25();
