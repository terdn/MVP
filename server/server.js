const express = require('express');
const multer = require('multer');
const fs = require('fs');
// ⭐ KRİTİK KÜTÜPHANELER: Güvenlik ayarlarını yönetmek için gerekli
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Fotoğraf deposu oluştur
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
const upload = multer({ dest: 'uploads/' });

// API Anahtarın
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.error("❌ CRITICAL: GEMINI_API_KEY eksik!");

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server Ready & Unblocked 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 --- YENİ ANALİZ İSTEĞİ ---");

    if (!req.file) {
      return res.status(400).json({ analysis: "Hata: Fotoğraf sunucuya ulaşmadı." });
    }

    const isPremium = req.body.premium === 'true';
    console.log(`💎 Müşteri Tipi: ${isPremium ? 'PREMIUM' : 'STANDARD'}`);

    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ⭐ CEO STRATEJİSİ: "ASLA ENGELLEME" AYARLARI (BLOCK_NONE) ⭐
    // Bu ayarlar, AI'ın cilt analizini 'hassas içerik' sanıp susmasını %100 engeller.
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    // ⭐ PROMPT MÜHENDİSLİĞİ (SENİN VİZYONUN)
    let prompt = "";

    if (isPremium) {
      // PREMIUM ($19.99): İngilizce, Lüks, Detaylı, Undertone, Marka
      prompt = `You are an elite dermatologist and celebrity makeup artist. Analyze this face strictly in English.
      Provide a highly detailed, structured report:
      1. **SKIN ANALYSIS**: Identify skin type (Oily/Dry/Combo) and specific conditions.
      2. **UNDERTONE & SHADE**: Determine exact undertone (Cool/Warm/Neutral) and recommend foundation shades.
      3. **MAKEUP PALETTE**: Suggest specific lipstick colors and blush tones.
      4. **LUXURY ROUTINE**: A 3-step high-end skincare routine with active ingredients.
      Tone: Professional, sophisticated, direct.`;
    } else {
      // STANDARD ($9.99): İngilizce, Markasız, Yüzdesiz, Şık ve Basit
      prompt = `You are a helpful skincare consultant. Analyze this face in English.
      1. Identify **Skin Type** (e.g., Oily, Dry).
      2. Recommend **3 to 5 essential product types** based on the analysis.
      
      **RULES:**
      - **NO BRANDS.** Do not mention brand names.
      - **NO PERCENTAGES.**
      - **FORMAT:** "Product Type" - "Description with Key Ingredient"
      
      **Examples:**
      - "Water-based Moisturizer" - "Look for a light texture enriched with Hyaluronic Acid."
      - "Gentle Cream Cleanser" - "A soothing formula containing Ceramides."
      
      Tone: Chic, simple, and clear.`;
    }

    console.log("🤖 Gemini'ye filtressiz istek gönderiliyor...");
    
    // İsteği gönderirken 'safetySettings' parametresini ekliyoruz
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings, // <-- İŞTE KİLİT NOKTA BURASI
    });

    const response = await result.response;
    const text = response.text();
    
    // Cevap kontrolü
    if (!text) {
      throw new Error("Gemini cevap döndüremedi (Hala boş).");
    }

    console.log("✅ Analiz Başarılı!");
    fs.unlinkSync(imagePath); // Temizlik

    res.json({ analysis: text, premium: isPremium });

  } catch (error) {
    console.error("🔥 HATA:", error);
    // Hata olsa bile dosyayı temizle
    if (req.file) try { fs.unlinkSync(req.file.path) } catch(e) {};
    
    // Telefona hatayı bildir
    res.json({ analysis: `Server Error: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});