const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Uploads klasörü kontrolü
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/' });

// ⭐ KRİTİK DÜZELTME: Railway Variable ismin 'GEMINI_API_KEY'
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing in Railway Variables!");
} else {
  console.log("✅ GEMINI_API_KEY detected successfully.");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => {
  res.send('ERDN Cosmetics AI Server is Active & Ready 🚀');
});

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 Analysis request received...");

    if (!req.file) {
      console.log("❌ No photo received.");
      return res.status(400).json({ analysis: "Error: No photo uploaded." });
    }

    // Abonelik Tipi Kontrolü
    // Uygulama 'true' string olarak gönderir
    const isPremium = req.body.premium === 'true';
    console.log(`💎 User Tier: ${isPremium ? 'PREMIUM ($19.99)' : 'STANDARD ($9.99)'}`);

    // Görüntü İşleme
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    // Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ⭐ PROMPT MÜHENDİSLİĞİ (CEO VİZYONU - GÜNCELLENDİ)
    let prompt = "";

    if (isPremium) {
      // --- PREMIUM ($19.99) ---
      // Lüks, Detaylı, Marka, Undertone
      prompt = `You are an elite dermatologist and celebrity makeup artist for ERDN Cosmetics. Analyze this face strictly in English.
      Provide a highly detailed, structured report:
      
      1. **SKIN ANALYSIS**: Identify skin type (Oily/Dry/Combo) and specific conditions (Acne, Rosacea, texture).
      2. **UNDERTONE & SHADE**: Determine the exact undertone (Cool/Warm/Neutral) and recommend foundation shades (e.g., Ivory, Beige, Espresso).
      3. **MAKEUP PALETTE**: Suggest specific lipstick colors (e.g., Brick Red, Nude Pink) and blush tones that suit this skin tone perfectly.
      4. **LUXURY ROUTINE**: A 3-step high-end skincare routine with specific active ingredients.
      
      Tone: Professional, sophisticated, direct.`;
    } else {
      // --- STANDARD ($9.99) - YENİ "ŞIK & BASİT" FORMAT ---
      // Marka YOK. Yüzde YOK. Sadece "Ürün Tipi" ve "İçerik Betimlemesi".
      prompt = `You are a helpful skincare consultant. Analyze this face in English.
      
      First, identify the Skin Type (e.g., Oily, Dry).
      
      Then, recommend 3 to 5 essential product types based on the analysis.
      For each recommendation, describe the product type and the key ingredient simply and elegantly.
      
      Rules:
      - NO brand names.
      - NO complex percentages.
      - Format: "Product Type" - "Description"
      
      Examples of desired style:
      - "Water-based Moisturizer" - "Look for a light texture enriched with Hyaluronic Acid."
      - "Gentle Cream Cleanser" - "A soothing formula containing Ceramides."
      - "Hand Cream" - "A rich formula focused on Vitamin E."
      
      Tone: Chic, simple, and clear.`;
    }

    // AI İsteği
    console.log("🤖 Sending to Gemini AI...");
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
    
    console.log("✅ Analysis generated successfully.");

    // GİZLİLİK: Fotoğrafı sil
    fs.unlinkSync(imagePath);
    console.log("🗑️ Photo deleted from server.");

    res.json({
      analysis: text,
      premium: isPremium
    });

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    // Hata olsa bile dosyayı temizle
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    res.status(500).json({ 
      analysis: "Server Error: Could not generate analysis. Please try again." 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});