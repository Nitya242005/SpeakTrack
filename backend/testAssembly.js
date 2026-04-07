const { AssemblyAI } = require("assemblyai");

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

(async () => {
  try {
    const res = await client.transcripts.create({
      audio_url: "https://storage.googleapis.com/aai-web-samples/5sec.wav"
    });

    console.log("API WORKING:", res);
  } catch (err) {
    console.error("API ERROR:", err.message);
  }
})();
