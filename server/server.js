const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb'); // Native Driver

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// --- NATIVE MONGODB BAĞLANTISI ---
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db, usersCollection, analysisCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('erdn-cosmetics'); 
        usersCollection = db.collection('users');
        analysisCollection = db.collection('analyses');
        console.log("🚀 Veritabanı Bağlantısı Başarılı (Native Mode)!");
    } catch (err) {
        console.log("❌ Veritabanı Hatası:", err);
    }
}
connectDB();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// --- 1. ANA CİLT ANALİZİ (TÜM GÜVENLİK VE PROMPT KORUNDU) ---
app.post('/analyze', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No photo" });
        
        const { email, deviceId } = req.body; 
        let isPremium = false;

        if (email) {
            const user = await usersCollection.findOne({ email });
            if (user) {
                // ⭐ GÜVENLİK DUVARI: TEK CİHAZ KURALI (HİÇ DEĞİŞMEDİ)
                if (user.deviceId && user.deviceId !== deviceId) {
                    return res.status(401).json({ error: "Session expired. Logged in on another device." });
                }
                isPremium = user.isPremium;
            }
        }

        const base64Image = req.file.buffer.toString('base64');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // SENİN ORİJİNAL PROMPTUN (DOKUNULMADI)
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
            // Mongoose save() yerine Native insertOne()
            await analysisCollection.insertOne({ 
                userId: email, 
                date: new Date(), 
                ...analysisData 
            });
        }

        res.json({ success: true, data: analysisData, isPremium: isPremium });

    } catch (error) {
        console.error("ANALİZ HATASI:", error);
        res.json({ success: false, error: "Analysis failed." });
    }
});

// --- 2. ANLIK MAKYAJ ANALİZİ (TÜM PROMPT KORUNDU) ---
app.post('/analyze-makeup', upload.single('photo'), async (req, res) => {
    try {
        console.log("💄 Makyaj Analizi İsteği (No-Brand Modu)...");
        if (!req.file) return res.status(400).json({ error: "No photo" });

        const base64Image = req.file.buffer.toString('base64');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = `
        You are a high-end celebrity makeup artist. Look at the user's face, lighting, and skin undertone in the photo.
        Create a cohesive makeup look RIGHT NOW.

        CRITICAL RULES:
        1. NO BRANDS: Do NOT mention any brand names (e.g. MAC, Nars). Use only descriptive terms (e.g. 'Matte Brick Red', 'Satin Finish').
        2. COLOR HARMONY: The lipstick, blush, and eyeshadow colors MUST complement each other and the user's skin undertone. They should be wearable together as a single look.
        3. AVOIDANCE: For every suggestion, strictly tell what to AVOID (e.g. "Avoid matte finish", "Avoid orange undertones").

        Return ONLY valid JSON. Structure:
        {
            "foundation": { "suggest": "Exact shade and finish", "avoid": "What to avoid" },
            "blush": { "suggest": "Color and placement (must match lips)", "avoid": "Color/Texture to avoid" },
            "eyes": { "suggest": "Eyeshadow colors and style", "avoid": "Style/Color to avoid" },
            "lips": { "suggest": "Lipstick color and texture (must match blush)", "avoid": "Color to avoid" },
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

app.get('/', (req, res) => res.send('ERDN Server Active (Mongoose-Free)'));

// --- REGISTER (ORİJİNAL MANTIK) ---
app.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, country, gender, age, deviceId } = req.body;
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });
        
        await usersCollection.insertOne({ 
            fullName, email, password, country, gender, age, deviceId, isPremium: false 
        });
        res.status(201).json({ message: "User created" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- LOGIN (ORİJİNAL MANTIK) ---
app.post('/login', async (req, res) => {
    try {
        const { email, password, deviceId } = req.body;
        const user = await usersCollection.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });
        
        if (deviceId) {
            await usersCollection.updateOne({ email }, { $set: { deviceId } });
        }
        res.json({ message: "Login successful", user: { email: user.email, fullName: user.fullName, isPremium: user.isPremium } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => console.log(`Server running`));