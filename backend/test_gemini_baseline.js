const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function verifyGeminiSupport() {
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-2.5-flash"
  ];

  console.log("🚀 Starting Gemini Support Verification...");

  for (const modelName of modelsToTest) {
    try {
      console.log(`🔍 Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("test");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS with ${modelName}!`);
    } catch (err) {
      console.error(`❌ FAILED with ${modelName}:`, err.message);
    }
  }
}

verifyGeminiSupport();
