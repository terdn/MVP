const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User'); 

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// --- MONGODB BAĞLANTISI (GÜVENLİ) ---
// Not: Şifreyi artık .env dosyasından çekiyoruz
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("🚀 Veritabanı Bağlantısı Başarılı!"))
  .catch((err) => console.log("❌ Veritabanı Hatası:", err));


// --- ANALİZ GEÇMİŞİ ŞEMASI ---
const AnalysisSchema = new mongoose.Schema({
    userId: String,
    date: { type: Date, default: Date.now },
    skinProfile: { type: String, undertone: String, concern: String },
    products: [String],
    routine: { day: [String], night: [String] },
    // Makeup alanı şemada duruyor, analizden gelen veriyi buraya basıyoruz
    makeup: { 
        foundation: { suggest: [String], avoid: [String] },
        concealer: { suggest: [String], avoid: [String] },
        lipstick: { suggest: [String], avoid: [String] },
        gloss: { suggest: [String], avoid: [String] }
    }
});
const Analysis = mongoose.model('Analysis', AnalysisSchema);


const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


// --- 1. ANA CİLT ANALİZİ (GÜVENLİK KONTROLLÜ & MARKA YASAKLI) ---
app.post('/analyze', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No photo" });
        
        // Frontend'den hem email hem de deviceId istiyoruz
        const { email, deviceId } = req.body; 
        
        let isPremium = false;
        if (email) {
            const user = await User.findOne({ email });
            
            // ⭐ GÜVENLİK DUVARI: TEK CİHAZ KURALI
            if (user) {
                // Eğer veritabanındaki ID ile gelen ID uyuşmuyorsa, başkası girmiş demektir.
                if (user.deviceId && user.deviceId !== deviceId) {
                    return res.status(401).json({ error: "Session expired. Logged in on another device." });
                }
                isPremium = user.isPremium;
            }
        }

        const base64Image = req.file.buffer.toString('base64');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // PROMPT GÜNCELLENDİ: MARKA YASAK (NO BRANDS)
        let prompt = `
        You are the Chief Dermatologist for ERDN Cosmetics. Analyze the face.
        IMPORTANT: Keep your tone strictly professional, medical, and concise. exactly like a medical report.
        
        CRITICAL RULE: NO BRANDS. Do NOT recommend specific brand names (e.g. Cerave, La Roche Posay). Use only INGREDIENTS (e.g. Salicylic Acid, Niacinamide).

        Return ONLY valid JSON.
        
        Structure:
        {
            "skinProfile": {
                "type": "Full sentence description of skin type",
                "undertone": "Full sentence description of undertone",
                "concern": "Full sentence description of main concern"
            },
            "products": ["Ingredient recommendation 1", "Ingredient recommendation 2", "Ingredient recommendation 3"],
            "routine": {
                "day": ["Step 1 detailed instruction", "Step 2 detailed instruction"],
                "night": ["Step 1 detailed instruction", "Step 2 detailed instruction"]
            }
        }
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
        });

        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysisData = JSON.parse(cleanJson);

        if (email) {
            const newAnalysis = new Analysis({ userId: email, ...analysisData });
            await newAnalysis.save();
        }

        res.json({ success: true, data: analysisData, isPremium: isPremium });

    } catch (error) {
        console.error("ANALİZ HATASI:", error);
        res.json({ success: false, error: "Analysis failed." });
    }
});


// --- 2. ANLIK MAKYAJ ANALİZİ (HARMONY & AVOID & MARKA YASAKLI) ---
app.post('/analyze-makeup', upload.single('photo'), async (req, res) => {
    try {
        console.log("💄 Makyaj Analizi İsteği (No-Brand Modu)...");
        if (!req.file) return res.status(400).json({ error: "No photo" });

        const base64Image = req.file.buffer.toString('base64');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // PROMPT GÜNCELLENDİ: MARKA YASAK (NO BRANDS)
        let prompt = `
        You are a high-end celebrity makeup artist. Look at the user's face, lighting, and skin undertone in the photo.
        Create a cohesive makeup look RIGHT NOW.

        CRITICAL RULES:
        1. NO BRANDS: Do NOT mention any brand names (e.g. MAC, Nars). Use only descriptive terms (e.g. 'Matte Brick Red', 'Satin Finish').
        2. COLOR HARMONY: The lipstick, blush, and eyeshadow colors MUST complement each other and the user's skin undertone. They should be wearable together as a single look.
        3. AVOIDANCE: For every suggestion, strictly tell what to AVOID (e.g. "Avoid matte finish", "Avoid orange undertones").

        Return ONLY valid JSON. Structure:
        {
            "foundation": { 
                "suggest": "Exact shade and finish", 
                "avoid": "What to avoid" 
            },
            "blush": { 
                "suggest": "Color and placement (must match lips)", 
                "avoid": "Color/Texture to avoid" 
            },
            "eyes": { 
                "suggest": "Eyeshadow colors and style", 
                "avoid": "Style/Color to avoid" 
            },
            "lips": { 
                "suggest": "Lipstick color and texture (must match blush)", 
                "avoid": "Color to avoid" 
            },
            "vibe": "A very short name for this look (e.g. 'Clean Girl')"
        }
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
        });

        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const makeupData = JSON.parse(cleanJson);

        res.json({ success: true, data: makeupData });

    } catch (error) {
        console.error("MAKYAJ ANALİZ HATASI:", error);
        res.json({ success: false, error: "Makeup analysis failed." });
    }
});


// --- STANDART ENDPOINTLER ---
app.get('/', (req, res) => res.send('ERDN Server Active'));


// --- REGISTER (CİHAZ KAYITLI) ---
app.post('/register', async (req, res) => {
    try {
        // deviceId parametresini de alıyoruz
        const { fullName, email, password, country, gender, age, deviceId } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });
        
        // Yeni kullanıcıyı kaydederken Cihaz Kimliğini de yazıyoruz
        const newUser = new User({ fullName, email, password, country, gender, age, deviceId });
        await newUser.save();
        
        res.status(201).json({ message: "User created" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


// --- LOGIN (TAHTA GEÇİŞ - UPDATE DEVICE ID) ---
app.post('/login', async (req, res) => {
    try {
        // Giriş yapan cihazın ID'sini alıyoruz
        const { email, password, deviceId } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });
        
        // ⭐ KRİTİK HAMLE: Yeni giren cihaz, artık "Aktif Cihaz" olur.
        // Veritabanındaki deviceId güncellenir. Eski cihazın yetkisi düşer.
        if (deviceId) {
            user.deviceId = deviceId;
            await user.save();
        }

        res.json({ message: "Login successful", user: { email: user.email, fullName: user.fullName, isPremium: user.isPremium } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => console.log(`Server running`));