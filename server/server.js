const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN AI Server (Master Prompt) 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo" });

    const isPremium = req.body.premium === 'true';
    const base64Image = req.file.buffer.toString('base64');
    
    // Model: Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    // ⭐ İŞTE SENİN İSTEDİĞİN DETAYLI "BEYİN" TALİMATLARI ⭐
    let prompt = `
    You are the Chief Dermatologist and Image Consultant for ERDN Cosmetics, a luxury AI beauty brand.
    Analyze the user's face in the image strictly in English.

    --- RULESET (DO NOT IGNORE) ---
    1. **NO BRANDS:** Never mention specific brand names (like CeraVe, Ordinary etc.). Only recommend "Product Types" + "Key Ingredients".
    2. **TONE:** Professional, chic, sophisticated, and concise. Avoid robotic greetings.
    3. **DAY/NIGHT:** Split the routine logically. Day is for protection (SPF/Antioxidant), Night is for repair (Retinol/Acids/Hydration).
    4. **MAKEUP (If requested):** Be extremely specific with colors (e.g. "Cool Mauve", "Soft Peach", "Deep Berry"). Not just "Red".
    
    --- OUTPUT FORMAT (JSON ONLY) ---
    Return a pure JSON object with this exact structure:
    {
      "skin_profile": {
        "type": "Your skin type assessment (e.g. Combination-Oily)",
        "undertone": "Your undertone assessment (e.g. Neutral-Warm)",
        "concern": "One short sentence summarizing the main skin need."
      },
      "recommendations": [
        "Product 1 Type - Key Ingredient (e.g. 'Gel Cleanser with Salicylic Acid')",
        "Product 2 Type - Key Ingredient (e.g. 'Vitamin C Serum (10-15%)')",
        "Product 3 Type - Key Ingredient (e.g. 'Lightweight Gel Moisturizer')"
      ],
      "routine": {
        "day": ["Step 1", "Step 2", "Step 3 (Must end with SPF)"],
        "night": ["Step 1", "Step 2", "Step 3"]
      }
    `;

    // PREMIUM ÖZEL MAKYAJ TALİMATI
    if (isPremium) {
      prompt += `,
      "makeup": {
        "foundation": "Recommended finish and shade description (e.g. 'Matte finish, Golden-Beige')",
        "lips": "Recommended specific shades (e.g. 'Terracotta or Nude Pink')",
        "gloss": "Gloss style (e.g. 'High-shine clear or Shimmering Champagne')",
        "avoid": "Colors that clash with their undertone (e.g. 'Avoid cool-toned fuchsias')"
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
    
    // JSON TEMİZLEME (Garanti olsun)
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    let cleanText = responseText;
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = responseText.substring(firstBrace, lastBrace + 1);
    }

    res.json(cleanText); 

  } catch (error) {
    console.error("🔥 HATA:", error);
    res.json(JSON.stringify({ 
        skin_profile: { type: "Server Error", undertone: "-", concern: "Lütfen tekrar deneyin." }
    }));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});