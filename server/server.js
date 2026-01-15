const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ⭐ KESİN ÇÖZÜM: Diske (uploads) yazmak YOK.
// storage: multer.memoryStorage() kullanarak dosyayı RAM'de tutuyoruz.
// Bu sayede "Dosya yazılamadı" veya "İzin yok" hataları ve 502 ÇÖKMESİ tarih olur.
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.error("❌ API Key Eksik!");

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server (Memory Mode) is Online 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 Hızlı Analiz (RAM) Başladı...");

    if (!req.file) return res.status(400).json({ analysis: "Hata: Dosya yok." });

    const isPremium = req.body.premium === 'true';

    // Dosyayı diskten değil, direkt RAM'den (buffer) okuyoruz
    const base64Image = req.file.buffer.toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Güvenlik Ayarları (Gemini'yi Susturma)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let prompt = isPremium 
      ? "You are an elite dermatologist. Analyze this face strictly in English. Provide detailed routine." 
      : "You are a skincare consultant. Analyze this face in English. Recommend 3 product types (No brands).";

    console.log("🤖 Gemini'ye gönderiliyor...");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    const text = response.text();

    console.log("✅ Başarılı!");
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 HATA:", error);
    // 502 vermemek için hatayı yakalayıp ekrana basıyoruz
    res.json({ 
      analysis: `⚠️ Sunucu Hatası: ${error.message}`,
      premium: false
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});