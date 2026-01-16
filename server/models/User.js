const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // ⭐ EKLENDİ: Şifre olmazsa giriş yapamazlar
  country: String,
  gender: String, // Register ekranında soruyoruz, buraya ekledim
  age: String,    // Register ekranında soruyoruz, buraya ekledim
  
  // --- ABONELİK SİSTEMİ ---
  trialStartDate: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  subscriptionPlan: { type: String, default: "none" },

  // --- ⭐ GÜVENLİK (NETFLIX MODELİ) ---
  deviceId: { type: String, default: "" } // O an giriş yapan cihazın kimliği burada tutulacak
});

module.exports = mongoose.model("User", UserSchema);