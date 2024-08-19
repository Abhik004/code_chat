const OtpService = require('../services/otp-service');
const HashService = require('../services/hash-service');
const UserService = require('../services/user-service');
const TokenService = require('../services/token-service');
const UserDto=require('../dtos/user-dto');
const tokenService = require('../services/token-service');


class AuthController {
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

    async verifyOtp(req, res) {
        const { otp, hash, phone } = req.body;
    
        if (!otp || !hash || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }
    
        const [hashOtp, expires] = hash.split('.');
        if (Date.now() > +expires) {
            return res.status(400).json({ message: "OTP expired" });
        }
    
        const data = `${phone}.${otp}.${expires}`;
        const isValid = OtpService.verifyOtp(hashOtp, data);
    
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
    
        try {
            const user = await UserService.findOrCreate({ phone }, { phone });
            const { accessToken, refreshToken } = TokenService.generateAccessToken({ id: user.id, phone });
    
            await tokenService.storeRefreshToken(refreshToken, user.id);
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });
    
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });
    
            const userDto = new UserDto(user);
            return res.json({
                message: "OTP verified successfully",
                user: userDto,
                auth: true
            });
        } catch (err) {
            console.error('Error verifying OTP:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new AuthController();
