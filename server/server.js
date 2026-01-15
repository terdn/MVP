const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require('dotenv');
// ⭐ YENİ EKLEME: Mail göndermek için kütüphane
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// --- MEVCUT VERİTABANI SİMÜLASYONU ---
let users = []; 

// ⭐ YENİ EKLEME: Mail Postacısı Ayarları
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'senin_erdn_mailin@gmail.com', // Buraya kurumsal gmail'ini yaz
    pass: 'senin_uygulama_sifren'      // Gmail'den aldığın 16 haneli uygulama şifresi
  }
});

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => res.send('ERDN Server (Trial + Analysis + Mail) Active 🚀'));

// ⭐ GÜNCELLENDİ: Hoş Geldin Maili Eklenen Kayıt Kapısı
app.post('/api/start-trial', (req, res) => {
    const { fullName, email, country } = req.body;
    const firstName = fullName.split(' ')[0]; // Alisha ismini yakalamak için
    
    const newUser = {
        fullName,
        email,
        country,
        trialStartDate: Date.now(),
    };

    users.push(newUser);
    console.log(`🚀 Yeni Trial Başladı: ${fullName} (${country})`);
    
    // 📧 Mail İçeriği (Senin istediğin samimi ve doğal dil)
    const mailOptions = {
      from: '"ERDN Cosmetics" <senin_erdn_mailin@gmail.com>',
      to: email,
      subject: `Welcome to ERDN, ${firstName}`,
      text: `Hi ${firstName}, welcome to the family. Your 72-hour access is now active. We’re here to help you understand your skin better and find what truly works for you. Take your time, explore the features, and enjoy your journey with ERDN.`
    };

    // Arka planda maili gönder (Kullanıcıyı bekletmez)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("❌ Mail Hatası:", error);
      else console.log("✅ Mail Gönderildi: " + info.response);
    });

    res.json({ success: true, message: "72h Trial Started" });
});

app.post('/api/check-status', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.json({ status: 'no_user' });

    const seventyTwoHours = 72 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (now - user.trialStartDate > seventyTwoHours) {
        res.json({ status: 'expired' });
    } else {
        res.json({ status: 'active' });
    }
});

// --- ANALİZ MOTORUN (HİÇ DOKUNULMADI) ---
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