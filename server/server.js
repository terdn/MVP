const express = require('express');
const multer = require('multer');
const fs = require('fs');
// ⭐ GÜVENLİK AYARLARI İÇİN EK KÜTÜPHANELER
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Upload klasörü kontrolü
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/' });

// Railway'deki değişken ismin
const apiKey = process.env.GEMINI_API_KEY;

// API Anahtarı Kontrolü (Loglarda görmek için)
if (!apiKey) {
  console.error("❌ CRITICAL: GEMINI_API_KEY is missing!");
} else {
  console.log("✅ GEMINI_API_KEY detected.");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => {
  res.send('ERDN Cosmetics Server is Active & Secure 🚀');
});

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 New analysis request received...");

    if (!req.file) {
      console.log("❌ No photo.");
      return res.status(400).json({ analysis: "Error: No photo uploaded." });
    }

    // Kullanıcı Tipi (Uygulamadan gelir)
    const isPremium = req.body.premium === 'true';
    console.log(`💎 User Tier: ${isPremium ? 'PREMIUM ($19.99)' : 'STANDARD ($9.99)'}`);

    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ⭐ GÜVENLİK DUVARLARINI KALDIR (Boş cevap sorununu çözer)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    // ⭐ CEO VİZYONU: PROMPT MÜHENDİSLİĞİ
    let prompt = "";

    if (isPremium) {
      // --- PREMIUM ($19.99) ---
      // Hedef: Lüks, Detaylı, Makyaj & Undertone
      prompt = `You are an elite dermatologist and celebrity makeup artist for ERDN Cosmetics. Analyze this face strictly in English.
      
      Provide a highly detailed, structured report:
      1. **SKIN ANALYSIS**: Identify skin type (Oily/Dry/Combo) and specific conditions (Acne, texture, etc.).
      2. **UNDERTONE & SHADE**: Determine the exact undertone (Cool/Warm/Neutral) and recommend foundation shades (e.g., Ivory, Beige, Espresso).
      3. **MAKEUP PALETTE**: Suggest specific lipstick colors (e.g., Brick Red, Nude Pink) and blush tones that suit this skin tone.
      4. **LUXURY ROUTINE**: A 3-step high-end skincare routine with specific active ingredients.
      
      Tone: Professional, sophisticated, direct.`;
    } else {
      // --- STANDARD ($9.99) ---
      // Hedef: Markasız, Yüzdesiz, Şık ve Basit (Chic & Simple)
      prompt = `You are a helpful skincare consultant. Analyze this face in English.
      
      First, identify the **Skin Type** (e.g., Oily, Dry).
      
      Then, recommend **3 to 5 essential product types** based on the analysis.
      
      **RULES FOR RECOMMENDATIONS:**
      - **NO BRANDS.** Do not mention any brand names.
      - **NO PERCENTAGES.** Do not use complex numbers.
      - **FORMAT:** "Product Type" - "Description with Key Ingredient"
      
      **Examples of desired style:**
      - "Water-based Moisturizer" - "Look for a light texture enriched with Hyaluronic Acid."
      - "Gentle Cream Cleanser" - "A soothing formula containing Ceramides."
      - "Hand Cream" - "A rich formula focused on Vitamin E."
      
      Tone: Chic, simple, and clear.`;
    }

    console.log("🤖 Sending to Gemini (Safety Filters: OFF)...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Analysis success!");

    // Temizlik
    fs.unlinkSync(imagePath);
    console.log("🗑️ Photo deleted.");

    res.json({
      analysis: text,
      premium: isPremium
    });

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    if (req.file) try { fs.unlinkSync(req.file.path) } catch(e) {};
    
    res.status(500).json({ 
      analysis: `Server Error: ${error.message}. Please try again.` 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});