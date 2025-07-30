const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function sendSMS(to, body) {
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER, // your Twilio number 
    to: `+91${to}`
  });
}

const unirest = require('unirest');

const sendOTPviaSMS = (mobileNumber, otp) => {
  return new Promise((resolve, reject) => {
    const req = unirest('POST', 'https://www.fast2sms.com/dev/bulkV2');

    req.headers({
      authorization: process.env.FAST2SMS_API_KEY
    });

    req.form({
      variables_values: otp,
      route: 'otp',
      numbers: mobileNumber // e.g., "9876543210"
    });

    req.end(res => {
      if (res.error) {
        console.error('SMS Error:', res.body);
        return reject(res.error);
      }
      console.log('SMS Sent:', res.body);
      resolve(res.body);
    });
  });
};

module.exports = {sendSMS, sendOTPviaSMS};