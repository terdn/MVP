const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  country: String,
  trialStartDate: { type: Date, default: Date.now }, 
  isPremium: { type: Boolean, default: false },
  subscriptionPlan: { type: String, default: 'none' } 
});

module.exports = mongoose.model('User', UserSchema);