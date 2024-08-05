const OtpService = require('../services/otp-service');
const HashService = require('../services/hash-service');
const UserService = require('../services/user-service'); // Assuming you have a user service for user-related operations
const TokenService = require('../services/token-service');

class AuthController {
    // Send OTP to the user's phone number
    async sendOtp(req, res) {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: "Phone field is required!" });
        }

        const otp = await OtpService.generateOtp();
        const ttl = 1000 * 60 * 2; // OTP valid for 2 minutes
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = HashService.hashOtp(data);

        try {
            await OtpService.sendBySms(phone, otp);
            return res.json({
                hash: `${hash}.${expires}`,
                phone,
            });
        } catch (err) {
            console.error('Error in sendOtp:', err);
            return res.status(500).json({ message: 'Message sending failed' });
        }
    }

    // Verify the OTP provided by the user
    async verifyOtp(req, res) {
        const { otp, hash, phone } = req.body;

        if (!otp || !hash || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [hashOtp, expires] = hash.split('.');
        if (Date.now() > +expires) { // + sign to explicitly convert to int
            return res.status(400).json({ message: "OTP expired" });
        }

        const data = `${phone}.${otp}.${expires}`;
        const isValid = OtpService.verifyOtp(hashOtp, data);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Optionally, you can register or log in the user here
        // Assuming you have a findOrCreate method in UserService to manage user records
        let user;
        try {
            user = await UserService.findOrCreate({ phone });
        } catch (err) {
            console.error('Error finding/creating user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        // Generate JWT tokens
        const tokens = TokenService.generateAccessToken({ id: user._id, phone });

        return res.json({
            message: "OTP verified successfully",
            ...tokens
        });
    }
}

module.exports = new AuthController();
