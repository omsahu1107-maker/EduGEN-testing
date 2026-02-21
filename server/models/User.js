const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  totalStudyHours: { type: Number, default: 0 },
  avatar: { type: String, default: '🎓' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  lastLoginDate: { type: Date },
  lastSpinDate: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  refreshToken: String,
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 }
}, { timestamps: true });

// Generate unique referral code before save
userSchema.pre('save', async function () {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update level based on XP
userSchema.methods.updateLevel = function () {
  if (this.xp >= 5000) this.level = 'Expert';
  else if (this.xp >= 2000) this.level = 'Advanced';
  else if (this.xp >= 500) this.level = 'Intermediate';
  else this.level = 'Beginner';
};

module.exports = mongoose.model('User', userSchema);
