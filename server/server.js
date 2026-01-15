const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// RAM Modu (Hızlı)
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => res.send('ERDN Test Server Online 🚀'));

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    console.log("📸 TEST İSTEĞİ GELDİ!");

    if (!req.file) {
      console.log("❌ Dosya yok.");
      return res.status(400).json({ analysis: "Hata: Dosya sunucuya gelmedi." });
    }

    console.log(`✅ Dosya RAM'e alındı. Boyut: ${req.file.size} bytes`);
    
    // --- YAPAY ZEKA FİŞİNİ ÇEKTİK (TEST İÇİN) ---
    // Gemini'ye gitmiyoruz. Sadece bağlantıyı doğruluyoruz.
    
    const fakeAnalysis = `
    🎉 BAĞLANTI BAŞARILI! (TEST MODU)
    
    CEO Taha Erdin, sistemin çalışıyor.
    Şu an bu mesajı görüyorsan:
    1. Telefonun fotoğrafı başarıyla gönderdi.
    2. Sunucun dosyayı başarıyla aldı.
    3. 502 Hatası çözüldü.
    
    Sorun "Gemini Kütüphanesi"ndeymiş. Şimdi bunu gördüysen, Gemini'yi tekrar bağlayacağız.
    `;

    console.log("✅ Test cevabı gönderiliyor...");
    
    // Gecikme simülasyonu (1 saniye)
    await new Promise(r => setTimeout(r, 1000));

    res.json({ analysis: fakeAnalysis, premium: true });

  } catch (error) {
    console.error("🔥 TEST HATASI:", error);
    res.json({ analysis: `Sunucu Hatası: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});