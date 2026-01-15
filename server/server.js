const express = require('express');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');

// ⭐ GÜVENLİ IMPORT (Çökme Önleyici)
let GoogleGenerativeAI, HarmCategory, HarmBlockThreshold;
try {
  const genAIModule = require("@google/generative-ai");
  GoogleGenerativeAI = genAIModule.GoogleGenerativeAI;
  HarmCategory = genAIModule.HarmCategory;
  HarmBlockThreshold = genAIModule.HarmBlockThreshold;
} catch (e) {
  console.error("❌ Kütüphane Hatası: @google/generative-ai yüklenemedi!", e);
}

dotenv.config();

const app = express();
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({ dest: 'uploads/' });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server Online 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  let imagePath = null;
  
  try {
    console.log("📸 İSTEK İŞLENİYOR...");

    if (!req.file) return res.json({ analysis: "⚠️ HATA: Dosya yok." });
    
    imagePath = req.file.path;
    const isPremium = req.body.premium === 'true';

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ⭐ GÜVENLİK AYARLARI (Çökme Korumalı)
    let safetySettings = [];
    if (HarmCategory && HarmBlockThreshold) {
       safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];
    } else {
      console.log("⚠️ UYARI: Güvenlik ayarları kütüphane eksikliği nedeniyle atlandı.");
    }

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

    if (!text) throw new Error("Boş cevap döndü.");

    console.log("✅ BAŞARILI!");
    fs.unlinkSync(imagePath);
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 SERVER ÇÖKTÜ:", error);
    if (imagePath) try { fs.unlinkSync(imagePath) } catch(e) {};
    
    // 502 vermemek için hatayı JSON olarak dönüyoruz
    res.json({ 
        analysis: `⚠️ SERVER HATASI:\n${error.message}\n(Lütfen package.json dosyasını kontrol et)`,
        premium: false 
    }); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});