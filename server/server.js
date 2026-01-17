const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// --- MONGODB BAĞLANTISI (03:22'DEKİ ÇALIŞAN HALİ) ---
const mongoURI = "mongodb+srv://tahaerdin3_db_user:v1dxhuCRLJRfJHRw@cluster0.cmb2fdn.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("🚀 Veritabanı Bağlantısı Başarılı!"))
  .catch((err) => console.log("❌ Veritabanı Hatası:", err));

// --- USER ŞEMASI (O ANKİ BASİT HALİ) ---
const UserSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: { type: String },
    isPremium: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);

// --- ANALİZ ŞEMASI ---
const AnalysisSchema = new mongoose.Schema({
    userId: String,
    date: { type: Date, default: Date.now },
    skinProfile: Object,
    products: Array,
    routine: Object
});
const Analysis = mongoose.model('Analysis', AnalysisSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. ANA CİLT ANALİZİ (GEMINI 2.5 FLASH) ---
app.post('/analyze', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No photo" });
        const { email } = req.body;

        const base64Image = req.file.buffer.toString('base64');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = `You are the Chief Dermatologist for ERDN Cosmetics. Analyze the face. NO BRANDS. Return ONLY valid JSON.`;

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

        res.json({ success: true, data: analysisData });
    } catch (error) {
        console.error("ANALİZ HATASI:", error);
        res.json({ success: false, error: "Analysis failed." });
    }
});

// --- 2. MAKYAJ ANALİZİ ---
app.post('/analyze-makeup', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No photo" });

        const base64Image = req.file.buffer.toString('base64');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = `You are a high-end celebrity makeup artist. Create a look. NO BRANDS. Return ONLY JSON.`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image, mimeType: "image/jpeg" } }] }],
        });

        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        res.json({ success: true, data: JSON.parse(cleanJson) });
    } catch (error) {
        res.json({ success: false, error: "Makeup analysis failed." });
    }
});

app.get('/', (req, res) => res.send('ERDN Server Active (Restore 03:22)'));

// --- AUTH ---
app.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const newUser = new User({ fullName, email, password });
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });
        res.json({ message: "Login successful", user: { email: user.email, fullName: user.fullName } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running`));