const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({ dest: 'uploads/' });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server Ready 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  let imagePath = null;
  
  try {
    console.log("📸 İSTEK GELDİ");

    // 1. Dosya Kontrolü
    if (!req.file) {
      // Hata olsa bile JSON dönüyoruz ki telefonda görünsün
      return res.json({ analysis: "⚠️ ERROR: Server received no photo file." });
    }
    
    imagePath = req.file.path;
    const isPremium = req.body.premium === 'true';

    // Dosya okuma
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    // Model Hazırlığı
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // GÜVENLİK AYARLARI (Hepsi Açık)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let prompt = isPremium 
      ? "You are an elite dermatologist. Analyze this face strictly in English. Provide detailed routine." 
      : "You are a skincare consultant. Analyze this face in English. Recommend 3 product types (No brands).";

    console.log("🤖 Gemini'ye soruluyor...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    let text = "";
    let finishReason = "UNKNOWN";

    // Cevabı güvenli şekilde almaya çalış
    if (response.candidates && response.candidates.length > 0) {
        finishReason = response.candidates[0].finishReason;
        if (response.candidates[0].content && response.candidates[0].content.parts) {
            text = response.candidates[0].content.parts.map(p => p.text).join(" ");
        }
    }

    // ⭐ TRUVA ATI HAMLESİ: Metin yoksa, hatayı metin gibi gönder!
    if (!text || text.trim() === "") {
        console.log(`❌ Cevap yok. Sebep: ${finishReason}`);
        text = `⚠️ DIAGNOSTIC REPORT (HATA RAPORU)\n\nGemini Cevap Vermedi.\n\nSebep (FinishReason): ${finishReason}\n\nBu hatayı görüyorsanız, yapay zeka fotoğrafı gördü ama cevap oluşturmayı reddetti.`;
    }

    console.log("✅ Cevap (veya hata) gönderiliyor.");
    
    // Temizlik
    if (imagePath) fs.unlinkSync(imagePath);

    // Sonucu gönder
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 PATLAMA:", error);
    if (imagePath) try { fs.unlinkSync(imagePath) } catch(e) {};
    
    // Server patlasa bile telefona mesaj gönder
    res.json({ 
        analysis: `⚠️ CRITICAL SERVER ERROR:\n\n${error.message}\n\nLütfen API Key'i ve Railway Loglarını kontrol et.`,
        premium: false 
    }); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});