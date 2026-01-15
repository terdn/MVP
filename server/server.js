const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
// ⭐ YENİ: Kayıt formundan gelen metinleri okuyabilmek için bu iki satırı ekledik
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// --- MEVCUT VERİTABANI SİMÜLASYONU ---
// Gerçek bir DB (MongoDB gibi) bağlayana kadar trial bilgilerini burada tutacağız
let users = []; 

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server (Trial + Analysis Mode) Active 🚀'));

// ⭐ YENİ: 72 SAAT TERIAL BAŞLATMA KOMUTU (RegisterScreen'den buraya gelir)
app.post('/api/start-trial', (req, res) => {
    const { fullName, email, country } = req.body;
    
    const newUser = {
        fullName,
        email,
        country,
        trialStartDate: Date.now(), // Kayıt anındaki zamanı milisaniye olarak tutar
    };

    users.push(newUser);
    console.log(`🚀 Yeni Trial Başladı: ${fullName} (${country})`);
    
    // Telefona "Başarılı" sinyali gönderir
    res.json({ success: true, message: "72h Trial Started" });
});

// ⭐ YENİ: SÜRE KONTROL KOMUTU (Her girişte telefon buraya sorar)
app.post('/api/check-status', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) return res.json({ status: 'no_user' });

    const seventyTwoHours = 72 * 60 * 60 * 1000; // Milisaniye cinsinden 72 saat
    const now = Date.now();
    
    if (now - user.trialStartDate > seventyTwoHours) {
        res.json({ status: 'expired' }); // 72 saat bitti
    } else {
        res.json({ status: 'active' }); // Deneme süresi devam ediyor
    }
});

// --- ANALİZ MOTORUN (HİÇ DOKUNMADIK, OLDUĞU GİBİ DURUYOR) ---
app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo" });

    const isPremium = req.body.premium === 'true';
    const base64Image = req.file.buffer.toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = `
    You are the Chief Dermatologist for ERDN Cosmetics. Analyze the face.
    Output strictly in plain English text.
    
    RULES:
    1. NO Markdown (*, #, bolding, italics etc.). Just plain text.
    2. NO Emojis.
    3. NO Brand names. Only product types and ingredients.
    4. Format as clear sections separated by empty lines.
    
    STRUCTURE:
    SKIN PROFILE
    Type: [Assessment]
    Undertone: [Assessment]
    Concern: [One sentence summary]

    RECOMMENDED PRODUCTS (Generic)
    1. [Product Type & Key Ingredient]
    2. [Product Type & Key Ingredient]
    3. [Product Type & Key Ingredient]

    ROUTINE
    Day:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]

    Night:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]
    `;

    if (isPremium) {
      prompt += `
      MAKEUP & COLOR HARMONY (Premium Only)
      Foundation: [Suggested finish & shade]
      Lips: [Specific colors to use]
      Gloss: [Style recommendation]
      Avoid: [Specific colors to avoid]
      `;
    }

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
      safetySettings: safetySettings,
    });

    const text = result.response.text();
    const cleanText = text.replace(/\*/g, "").replace(/#/g, "").trim();
    res.json({ analysis: cleanText });

  } catch (error) {
    console.error("HATA:", error);
    res.json({ analysis: "Analysis failed. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));