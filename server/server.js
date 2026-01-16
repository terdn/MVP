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

// --- MONGODB BAĞLANTISI ---
const mongoURI = "mongodb+srv://tahaerdin3_db_user:v1dxhuCRLJRfJHRw@cluster0.cmb2fdn.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("🚀 Veritabanı Bağlantısı Başarılı!"))
  .catch((err) => console.log("❌ Veritabanı Hatası:", err));

// --- ANALİZ GEÇMİŞİ (Dashboard İçin Şart) ---
const AnalysisSchema = new mongoose.Schema({
    userId: String,
    date: { type: Date, default: Date.now },
    skinProfile: { type: String, undertone: String, concern: String }, // Senin sevdiğin başlıklar
    products: [String],
    routine: { day: [String], night: [String] },
    makeup: { // Sadece burayı yeni ekledik
        foundation: { suggest: [String], avoid: [String] },
        concealer: { suggest: [String], avoid: [String] },
        lipstick: { suggest: [String], avoid: [String] },
        gloss: { suggest: [String], avoid: [String] }
    }
});
const Analysis = mongoose.model('Analysis', AnalysisSchema);

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// --- ANALİZ MOTORU ---
app.post('/analyze', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No photo" });
        
        const email = req.body.email; 
        let isPremium = false;
        if (email) {
            const user = await User.findOne({ email });
            if (user) isPremium = user.isPremium;
        }

        const base64Image = req.file.buffer.toString('base64');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // --- PROMPT (Senin sevdiğin yapı korunarak JSON'a uyarlandı) ---
        let prompt = `
        You are the Chief Dermatologist for ERDN Cosmetics. Analyze the face.
        
        IMPORTANT: Keep your tone strictly professional, medical, and concise. exactly like a medical report.
        Return ONLY valid JSON.
        
        Structure:
        {
            "skinProfile": {
                "type": "Full sentence description of skin type",
                "undertone": "Full sentence description of undertone",
                "concern": "Full sentence description of main concern"
            },
            "products": ["Product recommendation 1", "Product recommendation 2", "Product recommendation 3"],
            "routine": {
                "day": ["Step 1 detailed instruction", "Step 2 detailed instruction"],
                "night": ["Step 1 detailed instruction", "Step 2 detailed instruction"]
            }
        `;

        // Makyaj kısmı (Sadece burası yeni)
        prompt += `,
            "makeup": {
                "foundation": { "suggest": ["Finish & Shade 1", "Finish & Shade 2"], "avoid": ["Avoid this finish"] },
                "concealer": { "suggest": ["Shade description"], "avoid": ["Avoid this undertone"] },
                "lipstick": { "suggest": ["Specific Color 1", "Specific Color 2"], "avoid": ["Avoid this color"] },
                "gloss": { "suggest": ["Style/Finish"], "avoid": ["Avoid this style"] }
            }
        `;
        
        prompt += `
        }
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
        });

        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysisData = JSON.parse(cleanJson);

        // Veritabanına Kayıt
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

// --- STANDARTLAR ---
app.get('/', (req, res) => res.send('ERDN Server Active'));
app.post('/register', async (req, res) => {
    // Burası aynı kalıyor
    try {
        const { fullName, email, password, country, gender, age } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });
        const newUser = new User({ fullName, email, password, country, gender, age });
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/login', async (req, res) => {
    // Burası aynı kalıyor
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });
        res.json({ message: "Login successful", user: { email: user.email, fullName: user.fullName, isPremium: user.isPremium } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => console.log(`Server running`));