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
    async refresh(req, res) {
        // get refresh token from cookie
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        // check if token is valid
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(
                refreshTokenFromCookie
            );
        } catch (err) {
            return res.status(401).json({ message: 'Invalid Token' });
        }
        // Check if token is in db
        try {
            const token = await tokenService.findRefreshToken(
                userData._id,
                refreshTokenFromCookie
            );
            if (!token) {
                return res.status(401).json({ message: 'Invalid token' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
        // check if valid user
        const user = await userService.findUser({ _id: userData._id });
        if (!user) {
            return res.status(404).json({ message: 'No user' });
        }
        // Generate new tokens
        const { refreshToken, accessToken } = tokenService.generateTokens({
            _id: userData._id,
        });

        // Update refresh token
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }

        // put in cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });
        
        // response
        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true });
    }
    async logout(req, res) {
        const { refreshToken } = req.cookies;
        // delete refresh token from db
        await tokenService.removeToken(refreshToken);
        // delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({ user: null, auth: false });
    }
}

module.exports = new AuthController();
