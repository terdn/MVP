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

app.get('/', (req, res) => res.send('ERDN AI Server (Visual Layout Fix) 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo" });

    const isPremium = req.body.premium === 'true';
    const base64Image = req.file.buffer.toString('base64');
    
    // Model: Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        // ⭐ KİLİT NOKTA: Kutuların içine yerleşecek formatta veri istiyoruz.
        generationConfig: { responseMimeType: "application/json" }
    });

    // Senin istediğin o premium kutuların içini dolduracak bilgiler:
    let prompt = `
    Analyze as a dermatologist. Output JSON for app UI rendering.
    Structure:
    {
      "skin_profile": {
        "type": "String (e.g. Oily)",
        "undertone": "String (e.g. Neutral)",
        "concern": "String (Short summary)"
      },
      "recommendations": [
        "String (Product 1)", "String (Product 2)", "String (Product 3)"
      ],
      "routine": {
        "day": ["Step 1", "Step 2", "Step 3"],
        "night": ["Step 1", "Step 2", "Step 3"]
      }
    `;

    if (isPremium) {
      prompt += `,
      "makeup": {
        "foundation": "String (Shade advice)",
        "lips": "String (Color advice)",
        "gloss": "String (Style advice)",
        "avoid": "String (What NOT to use - be polite)"
      }
      `;
    }

    prompt += `}`;

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const responseText = result.response.text();
    // Temizlik
    const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    res.json(cleanText); 

  } catch (error) {
    console.error("🔥 HATA:", error);
    // Hata olsa bile çökmesin diye boş şablon dönüyoruz
    res.json(JSON.stringify({ 
        skin_profile: { type: "Error", undertone: "-", concern: "Server Busy" },
        recommendations: [],
        routine: { day: [], night: [] }
    }));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});