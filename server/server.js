const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ⭐ RAM MODU: Diske yazmak yok, hız var.
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.error("❌ HATA: API Key bulunamadı!");

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN AI Server Online (Production) 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 FİNAL ANALİZ İSTEĞİ GELDİ...");

    if (!req.file) {
      return res.status(400).json({ analysis: "Hata: Fotoğraf yok." });
    }

    const isPremium = req.body.premium === 'true';
    
    // RAM'den okuma (Saniyeler sürer)
    const base64Image = req.file.buffer.toString('base64');
    console.log(`⚡ Görsel işleniyor (${(req.file.size / 1024).toFixed(2)} KB)...`);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Güvenlik Ayarları (Sansürsüz)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let prompt = isPremium 
      ? "You are an elite dermatologist. Analyze this face strictly in English. Provide: 1. Skin Type 2. Undertone 3. Foundation Shade 4. Product Recommendations." 
      : "You are a skincare consultant. Analyze this face in English. Recommend 3 product types (No brands). Format: 'Product Type' - 'Key Ingredient'. Keep it chic.";

    console.log("🤖 Gemini'ye soruluyor...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    const text = response.text();

    console.log("✅ ANALİZ BAŞARILI!");
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 HATA:", error);
    res.json({ 
      analysis: `Sunucu Hatası: ${error.message}`, 
      premium: false 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});