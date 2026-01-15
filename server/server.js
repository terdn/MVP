const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
// Uploads klasörü yoksa oluştur (Hata önleyici)
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
const upload = multer({ dest: 'uploads/' });

// ⭐ DÜZELTME BURADA: Senin Railway'deki ismin 'GEMINI_API_KEY'
// Eğer bu değişken yoksa hata fırlat ki loglardan görelim.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in Railway Variables!");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => {
  res.send('ERDN Cosmetics AI Server is Running 🚀');
});

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("Analyze request received..."); // Log takibi

    if (!req.file) {
      console.log("No photo received.");
      return res.status(400).json({ analysis: "No photo uploaded." });
    }

    // Mobilden gelen 'premium' verisini al
    const isPremium = req.body.premium === 'true';
    console.log(`User Type: ${isPremium ? 'Premium ($19.99)' : 'Standard'}`);

    // Fotoğrafı Base64 formatına çevir
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    // Model Seçimi (Flash modeli hızlı ve ucuzdur)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt Mühendisliği (Senin istediğin Global/İngilizce yapı)
    let prompt = "";
    if (isPremium) {
      prompt = `You are an elite dermatologist for ERDN Cosmetics. Analyze this face strictly in English.
      Format the output clearly:
      1. SKIN TYPE: (e.g., Oily, Dry, Combination)
      2. UNDERTONE: (Cool, Warm, Neutral) - Critical for makeup.
      3. FOUNDATION SHADE: Suggest general shade codes (e.g., Ivory, Beige, Espresso).
      4. LIPSTICK & BLUSH: Recommend specific colors based on skin tone.
      5. ROUTINE: A 3-step luxury skincare routine.
      Keep it professional, direct, and sophisticated.`;
    } else {
      prompt = `You are a skincare assistant. Analyze this face in English.
      Provide:
      1. Estimated Skin Type
      2. Visible Concerns (Acne, pores, etc.)
      3. One simple advice.
      Keep it short.`;
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log("Analysis success!"); // Başarılı logu

    // Temizlik: Dosyayı sunucudan sil
    fs.unlinkSync(imagePath);

    res.json({
      analysis: text,
      premium: isPremium
    });

  } catch (error) {
    console.error("GEMINI API ERROR:", error);
    // Hata detayını frontend'e de gönderelim ki görelim (Production'da kapatılır ama şu an lazım)
    res.status(500).json({ 
      analysis: `Server Error: ${error.message || "Could not connect to AI."}. Check Railway logs.` 
    });
    
    // Hata olsa bile dosyayı silmeye çalış
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});