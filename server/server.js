const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ⭐ DEVRİM: Diske kaydetmek yok! Fotoğrafı RAM'de (Hafızada) tutuyoruz.
// Bu işlem 502 hatasını ve çökme riskini bitirir.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const apiKey = process.env.GEMINI_API_KEY;

// API Key Kontrolü
if (!apiKey) {
  console.error("❌ HATA: GEMINI_API_KEY bulunamadı!");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Sağlık Kontrolü
app.get('/', (req, res) => {
  res.send('ERDN High-Speed Server Active 🚀');
});

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 RAM Modu: İstek işleniyor...");

    if (!req.file) {
      return res.status(400).json({ analysis: "Hata: Fotoğraf sunucuya ulaşmadı." });
    }

    const isPremium = req.body.premium === 'true';
    
    // ⭐ DOSYA OKUMA YOK. Direkt hafızadan alıyoruz.
    // Bu yöntem milisaniyeler sürer.
    const base64Image = req.file.buffer.toString('base64');
    
    console.log(`⚡ Görsel Hafızaya Alındı (${(req.file.size / 1024).toFixed(2)} KB)`);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Güvenlik Ayarları (Çökme Korumalı)
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let prompt = isPremium 
      ? "You are an elite dermatologist. Analyze this face strictly in English. Provide: 1. Skin Type 2. Undertone 3. Foundation Shade 4. Product Recommendations." 
      : "You are a skincare consultant. Analyze this face in English. Recommend 3 product types (No brands). Format: 'Product' - 'Key Ingredient'.";

    console.log("🤖 Gemini'ye gönderiliyor...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    const text = response.text();

    console.log("✅ Analiz Hazır!");
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 HATA:", error);
    // Hata olsa bile JSON dönüyoruz, 502 vermemek için
    res.json({ 
      analysis: `⚠️ Sunucu Hatası: ${error.message}`, 
      premium: false 
    });
  }
});

const PORT = process.env.PORT || 3000;
// ⭐ 0.0.0.0 ip adresine bağlayarak dış dünyadan erişimi garantile
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});