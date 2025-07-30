const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // phone: { type: String },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false }, // for owners
  mobileNumber: { type: String },
  emailVerified: { type: Boolean, default: false },
  mobileVerified: { type: Boolean, default: false },
  emailOtp: { type: String },
  emailOtpExpiry: { type: Date },
  mobileOtp: { type: String },
  mobileOtpExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('User', userSchema);
