require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

// 🔥 MAIN ANALYZE ENDPOINT
app.post("/analyze", upload.single("photo"), async (req, res) => {
  try {
    let { premium } = req.body;

    // STRING “true" → boolean true
    premium = premium === "true" || premium === true;

    console.log("🔥 Foto alındı:", req.file.path);
    const imageBuffer = fs.readFileSync(req.file.path);

    // --- PROMPT BUILDER ---
    let prompt = `
      You are ERDN AI Skin Consultant.
      Analyze the user's face and provide:
      - Skin type
      - Skin concerns
      - Ingredient-only product recommendations
      - Short skincare routine
      Add: "Photos are deleted after analysis. Not medical advice."
    `;

    if (premium) {
      prompt += `
        --- PREMIUM MODE ACTIVE ---
        Provide ALSO:
        - Undertone analysis
        - Foundation HEX shade
        - Concealer HEX shade
        - Blush, bronzer, lipstick color recommendations
        - Eyeshadow & brow color harmony
      `;
    }

    // --- API CALL ---
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
    ]);

    const text = result.response.text();

    fs.unlinkSync(req.file.path); // foto silinsin

    return res.json({
      premium,
      analysis: text,
    });

  } catch (err) {
    console.log("❌ AI ERROR:", err);

    if (req.file) fs.unlinkSync(req.file.path);

    return res.status(500).json({
      analysis: "AI processing failed. Check API key or connection.",
    });
  }
});

// --- GLOBAL PORT ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 ERDN GLOBAL AI SERVER RUNNING @${PORT}`);
});
