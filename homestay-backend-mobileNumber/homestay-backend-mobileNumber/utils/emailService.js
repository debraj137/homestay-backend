const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
};

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify Your Email - OTP Verification',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Email Verification</h2>
        <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
        <h1 style="color: #2e6da4;">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you did not initiate this request, you can ignore this email.</p>
        <br/>
        <p>Regards,<br/>HomeStay Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {sendEmail, sendOtpEmail};
