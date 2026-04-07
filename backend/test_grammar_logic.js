require('dotenv').config();
const { analyzeWithGemini } = require('./utils/geminiService');

async function testGrammarLogic() {
  const testTranscript = "He go to school yesterday and he have two apple.";
  
  console.log("🚀 Testing Enhanced Grammar Analysis...");
  console.log("Input:", testTranscript);
  
  const result = await analyzeWithGemini(testTranscript);
  
  console.log("\n📊 AI ANALYSIS RESULTS:");
  console.log(JSON.stringify(result, null, 2));
  
  if (result.grammarMistakes && result.grammarMistakes.length > 0) {
    console.log("\n✅ SUCCESS: Gemini identified specific grammar mistakes.");
    result.grammarMistakes.forEach((m, i) => {
      console.log(`Mistake ${i+1}: "${m.wrongText}" -> "${m.suggestion}" (${m.message})`);
    });
  } else {
    console.warn("\n⚠️ WARNING: No grammar mistakes identified. Gemini might be too lenient or the input was too clean.");
  }
}

testGrammarLogic();
