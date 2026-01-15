const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// RAM MODU: Hız ve Stabilite
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.error("❌ HATA: API Key bulunamadı!");

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN AI Server (2026 Edition - v2.5 PROMPT V2) 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 ANALİZ İSTEĞİ GELDİ (Premium Prompt Modu)...");

    if (!req.file) return res.status(400).json({ analysis: "Hata: Fotoğraf yok." });

    const isPremium = req.body.premium === 'true';
    const base64Image = req.file.buffer.toString('base64');
    
    // Gemini 2.5 Flash (En güncel model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    // ⭐ İŞTE YENİ, "HAVALI" PROMPT ⭐
    // Excel listesi yerine, şık ve akıcı bir metin istiyoruz.
    let prompt = "";

    if (isPremium) {
      // PREMIUM: Detaylı ama şık
      prompt = `You are a world-class luxury skincare concierge. Analyze this face. 
      Output strictly in English. 
      DO NOT provide a title or heading like "Analysis Report". Start directly.
      Be concise, chic, and editorial. Focus on the "vibe" of the skin.
      Identify the skin type and undertone in a sophisticated way.
      Suggest 3-4 curated, high-end product *types* based on ingredients (e.g., "A Hyaluronic Acid Serum", "A Peptide Moisturizer"). 
      ABSOLUTELY NO SPECIFIC BRAND NAMES.
      Format as elegant paragraphs, not a dry numbered list. Keep it punchy.`;
    } else {
      // STANDART: Kısa ve öz
      prompt = `You are a chic skincare consultant. Analyze this face in English.
      DO NOT use a title. Keep it very short and punchy. "Less is more."
      Identify the main skin concern in one sentence.
      Recommend exactly 3 essential product types (e.g., "Gel Cleanser with Salicylic Acid").
      NO BRAND NAMES. NO LONG EXPLANATIONS. Just the essentials in a minimalist style.`;
    }

    console.log("🤖 Gemini'ye 'Premium Tarzda' soruluyor...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    const text = response.text();

    console.log("✅ ANALİZ BAŞARIYLA GELDİ (Premium Tarz)!");
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 HATA DETAYI:", error);
    res.json({ analysis: `Sunucu Hatası: ${error.message}`, premium: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});