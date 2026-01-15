const express = require('express');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');

// --- HAVA YASTIĞI (CRASH ÖNLEYİCİ) ---
// Bu satırlar, sunucu ölümcül bir hata alsa bile kapanmasını engeller
process.on('uncaughtException', (err) => {
  console.error('🔥 KRİTİK HATA (Uncaught):', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 SESSİZ HATA (Unhandled):', reason);
});

// Kütüphaneyi güvenli yükle
let GoogleGenerativeAI, HarmCategory, HarmBlockThreshold;
try {
  const genAIModule = require("@google/generative-ai");
  GoogleGenerativeAI = genAIModule.GoogleGenerativeAI;
  HarmCategory = genAIModule.HarmCategory;
  HarmBlockThreshold = genAIModule.HarmBlockThreshold;
} catch (e) {
  console.error("❌ Kütüphane Yükleme Hatası:", e);
}

dotenv.config();
const app = express();

// Upload klasörü
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({ dest: 'uploads/' });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// --- TEST ROTASI ---
// Tarayıcıdan girince çalışıyorsa sunucu ayaktadır
app.get('/', (req, res) => {
  res.json({ status: "Online", message: "ERDN Server is Running", time: new Date().toISOString() });
});

app.post('/analyze', upload.single('photo'), async (req, res) => {
  let imagePath = null;
  
  try {
    console.log("📸 --- İSTEK GELDİ ---");

    if (!req.file) return res.json({ analysis: "⚠️ HATA: Dosya sunucuya ulaşmadı." });
    
    imagePath = req.file.path;
    const isPremium = req.body.premium === 'true';

    // Dosya boyutunu kontrol et
    const stats = fs.statSync(imagePath);
    console.log(`📁 Boyut: ${(stats.size / 1024).toFixed(2)} KB`);

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    
    // Model Hazırlığı
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Güvenlik Ayarları (Varsa ekle)
    let safetySettings = [];
    if (HarmCategory && HarmBlockThreshold) {
       safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];
    }

    let prompt = isPremium 
      ? "You are an elite dermatologist. Analyze this face strictly in English. Provide detailed routine." 
      : "You are a skincare consultant. Analyze this face in English. Recommend 3 product types (No brands).";

    console.log("🤖 Gemini İşleniyor...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Yapay Zeka boş cevap döndü.");

    console.log("✅ BAŞARILI CEVAP!");
    fs.unlinkSync(imagePath);
    
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 İŞLEM HATASI:", error);
    if (imagePath) try { fs.unlinkSync(imagePath) } catch(e) {};
    
    // 502 vermemek için hatayı yakalayıp JSON olarak gönderiyoruz
    res.json({ 
        analysis: `⚠️ SİSTEM HATASI:\n\n${error.message}\n\n(Bu mesajı görüyorsan sunucu çökmedi, hatayı yakaladı.)`,
        premium: false 
    }); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});