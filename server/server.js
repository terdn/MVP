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
if (!apiKey) console.error("❌ API KEY YOK!");

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server Ready 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 --- YENİ İSTEK GELDİ ---");

    // 1. DOSYA KONTROLÜ (Honor Testi)
    if (!req.file) {
      console.error("❌ Dosya hiç gelmedi!");
      return res.json({ analysis: "Hata: Sunucuya dosya ulaşmadı." });
    }
    
    // Dosya boyutunu kontrol et (0 byte ise bozuktur)
    const stats = fs.statSync(req.file.path);
    console.log(`📁 Dosya Boyutu: ${stats.size} bytes`);
    
    if (stats.size === 0) {
      return res.json({ analysis: "Hata: Gelen fotoğraf dosyası BOŞ (0 byte)." });
    }

    const isPremium = req.body.premium === 'true';
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. GÜVENLİK AYARLARI (Full Açık)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let prompt = isPremium 
      ? "You are an elite dermatologist. Analyze this face strictly in English. Provide: 1. Skin Type 2. Undertone 3. Foundation Shade 4. Product Recommendations. Keep it professional." 
      : "You are a helpful skincare assistant. Analyze this face in English. Identify Skin Type and recommend 3 product types (No brands). Keep it simple.";

    console.log("🤖 Gemini'ye soruluyor...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    
    // 3. NEDEN BOŞ? (Sorgulama)
    // Gemini cevabı neden bitirdi? (Stop? Safety? Other?)
    const finishReason = response.candidates && response.candidates[0] ? response.candidates[0].finishReason : "BİLİNMİYOR";
    console.log(`🏁 Bitiş Sebebi (FinishReason): ${finishReason}`);

    let text = "";
    try {
      if (response.text) {
          text = response.text();
      }
    } catch (e) {
      console.error("❌ Metin okunamadı (Muhtemelen bloklandı).");
    }

    // Temizlik
    fs.unlinkSync(imagePath);

    // 4. SONUÇ
    if (!text || text.trim() === "") {
      console.error("❌ ANALİZ METNİ BOŞ GELDİ.");
      // Kullanıcıya boş dönmek yerine SEBEBİ gönderiyoruz
      return res.json({ 
        analysis: `ANALİZ YAPILAMADI.\nSebep: ${finishReason}\nLütfen yüzünüzün net göründüğü, aydınlık bir fotoğraf deneyin.`,
        premium: isPremium 
      });
    }

    console.log("✅ Analiz Başarılı!");
    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 PATLAMA:", error);
    if (req.file) try { fs.unlinkSync(req.file.path) } catch(e) {};
    // Hatayı telefona bas
    res.json({ analysis: `Server Hatası: ${error.message}` }); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});