const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendOtpEmail} = require('../utils/emailService');
const {sendSMS} = require('../utils/smsService');  
async function register(req, res) {
  try {
    const { name, email, mobileNumber, password, role } = req.body;
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('emailOtp: ',emailOtp);
    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('mobileOtp: ',mobileOtp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      role,
      emailOtp,
      mobileOtp,
      emailOtpExpiry: otpExpiry,
      mobileOtpExpiry: otpExpiry
    });
    await user.save();
    // Send email OTP
    // await sendEmail(email, `Your email OTP is ${emailOtp}`);
    await sendOtpEmail(email, `Your email OTP is ${emailOtp}`);
    // Send mobile OTP (using Twilio or SMS gateway)
    await sendSMS(mobileNumber, `Your mobile OTP is ${mobileOtp}`);
    //fast2sms
    // await sendOTPviaSMS(mobileNumber, mobileOtp);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Server error' });
  }
};

async function verifyAllOtps(req, res) {
  const { email, emailOtp, mobileOtp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.emailVerified && user.mobileVerified) {
    return res.status(400).json({ message: 'Already verified' });
  }

  const now = new Date();

  const isEmailValid = user.emailOtp === emailOtp && user.emailOtpExpiry > now;
  const isMobileValid = user.mobileOtp === mobileOtp && user.mobileOtpExpiry > now;

  if (!isEmailValid || !isMobileValid) {
    return res.status(400).json({ message: 'Invalid or expired OTPs' });
  }

  user.emailVerified = true;
  user.mobileVerified = true;
  user.emailOtp = null;
  user.mobileOtp = null;
  user.emailOtpExpiry = null;
  user.mobileOtpExpiry = null;

  await user.save();

  return res.json({  
    success: true,
    message: 'Email and mobile number verified successfully' });
};


async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user.emailVerified || !user.mobileVerified) {
      return res.status(403).json({ message: 'Please verify both email and mobile first.' });
    }
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { register, login, verifyAllOtps }