const crypto = require('crypto');
const dotenv = require('dotenv');
const hashService = require('./hash-service');
dotenv.config(); // Load environment variables

const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const twilio = require('twilio')(smsSid, smsAuthToken);

class OtpService {

    // Generate a 4-digit OTP
    async generateOtp() {
        const otp = crypto.randomInt(1000, 9999);
        return otp;
    }

    // Send OTP via SMS
    async sendBySms(phone, otp) {
        try {
            return await twilio.messages.create({
                to: phone,
                from: process.env.SMS_FROM_NUMBER,
                body: `Your OTP is ${otp}`, // Include OTP in the message
            });
        } catch (err) {
            console.error('Error sending SMS:', err);
            throw err; // Rethrow error to be caught in controller
        }
    }

    async verifyOtp(hashOtp,data) {
        // Implement OTP verification logic if needed
        let computedhash=hashService.hashOtp(data);
        if (computedhash===hashOtp){
            return true;
        }
        else{
            return false;
        }
    }
}

module.exports = new OtpService();
