const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
// RAM Modu (Hız için)
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server (Text Mode) Active 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo" });

    const isPremium = req.body.premium === 'true';
    const base64Image = req.file.buffer.toString('base64');
    
    // Model: Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Hafızandaki kurallara göre Prompt (Temiz Metin)
    let prompt = `
    You are the Chief Dermatologist for ERDN Cosmetics. Analyze the face.
    Output strictly in plain English text.
    
    RULES:
    1. NO Markdown (*, #, bolding etc.). Just plain text.
    2. NO Emojis.
    3. NO Brand names. Only product types and ingredients.
    4. Format as clear sections separated by newlines.
    
    STRUCTURE:
    SKIN PROFILE
    Type: [Assessment]
    Undertone: [Assessment]
    Concern: [One sentence summary]

    RECOMMENDED PRODUCTS (Generic)
    1. [Product Type & Key Ingredient]
    2. [Product Type & Key Ingredient]
    3. [Product Type & Key Ingredient]

    ROUTINE
    Day:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]

    Night:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]
    `;

    if (isPremium) {
      prompt += `
      MAKEUP & COLOR HARMONY (Premium Only)
      Foundation: [Suggested finish & shade]
      Lips: [Specific colors]
      Gloss: [Style]
      Avoid: [Colors to avoid]
      `;
    }

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    // Direkt metni alıyoruz, JSON parse derdi yok.
    const text = result.response.text();
    
    // Temizlik (Yıldızları ve kareleri sil)
    const cleanText = text.replace(/\*/g, "").replace(/#/g, "").trim();

    res.json({ analysis: cleanText });

  } catch (error) {
    console.error("HATA:", error);
    res.json({ analysis: "Analysis failed. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));