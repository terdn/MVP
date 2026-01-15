const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN AI Server (Visual Format V3) 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 ANALİZ İSTEĞİ: ERDN Özel Formatı...");

    if (!req.file) return res.status(400).json({ analysis: "Hata: Fotoğraf yok." });

    const isPremium = req.body.premium === 'true';
    const base64Image = req.file.buffer.toString('base64');
    
    // Gemini 2.5 Flash (2026 Standardı)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    // ⭐ CEO VİZYONU: KUTUCUKLU & ORGANİZE YAPI ⭐
    let prompt = `
    You are the head dermatologist and image consultant for "ERDN Cosmetics".
    Analyze the user's face strictly in English.
    
    Your output MUST follow this specific structure using Markdown formatting (bolding, bullet points):

    ---
    ### 🧬 1. SKIN PROFILE
    * **Skin Type:** [e.g., Combination / Oily / Dry]
    * **Undertone:** [e.g., Cool Olive / Warm Neutral]
    * **Key Concern:** [One sentence summary]
    *(Brief, professional explanation of why you think this)*

    ---
    ### 🧪 2. PRODUCT RECOMMENDATIONS (No Brands)
    *Suggest 3-5 specific product types based on ingredients.*
    * **[Product Type]:** Rich in [Key Ingredient] to [benefit].
    * **[Product Type]:** Contains [Key Ingredient] for [benefit].
    * **[Product Type]:** With [Key Ingredient] to target [concern].

    ---
    ### ☀️ 3. THE ROUTINE (Day & Night)
    **☀️ Morning Ritual:**
    1. [Step 1]
    2. [Step 2]
    3. Sun Protection (Crucial)

    **🌙 Evening Ritual:**
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]

    ---
    ### 🎨 4. COLOR HARMONY (Makeup)
    * **✅ Best Shades:** [Color 1], [Color 2], [Color 3]
    * **⚠️ Shades to Avoid:** [Color 1], [Color 2] (Polite suggestion)
    
    ---
    *Keep the tone sophisticated, encouraging, and clear. Avoid generic "bot" language. Use bold text for emphasis.*
    `;

    console.log("🤖 Gemini'ye ERDN Şablonu gönderiliyor...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const response = await result.response;
    res.json({ analysis: response.text(), premium: isPremium });

  } catch (error) {
    console.error("🔥 HATA:", error);
    res.json({ analysis: `Sunucu Hatası: ${error.message}`, premium: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});