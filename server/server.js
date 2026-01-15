const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN AI Server (JSON Mode) 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo" });

    const isPremium = req.body.premium === 'true';
    const base64Image = req.file.buffer.toString('base64');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ⭐ SADECE SAF VERİ İSTİYORUZ (JSON)
    // Emojisiz, işaretsiz, sadece bilgi.
    let prompt = `
    You are a dermatological AI. Analyze the image.
    Return ONLY a valid JSON object. Do NOT use Markdown. Do NOT use emojis.
    
    Structure:
    {
      "skin_profile": {
        "type": "String (e.g. Oily)",
        "undertone": "String (e.g. Cool Olive)",
        "concern": "String (Short summary)"
      },
      "recommendations": [
        "String (Product Type 1 - Key Ingredient)",
        "String (Product Type 2 - Key Ingredient)",
        "String (Product Type 3 - Key Ingredient)"
      ],
      "routine": {
        "day": ["Step 1", "Step 2", "Step 3"],
        "night": ["Step 1", "Step 2", "Step 3"]
      }
    `;

    // PREMIUM İSE MAKYAJI EKLE
    if (isPremium) {
      prompt += `,
      "makeup": {
        "foundation": "String (Suggested shades)",
        "lips": "String (Suggested colors)",
        "gloss": "String (Suggested style)",
        "avoid": "String (Colors to gently avoid)"
      }
      `;
    }

    prompt += `
    }
    Fill the data professionally. English only. No intros.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }]
    });

    let text = result.response.text();
    
    // Temizlik (Bazen ```json diye başlar, onu siliyoruz)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    res.json(JSON.parse(text));

  } catch (error) {
    console.error("HATA:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));