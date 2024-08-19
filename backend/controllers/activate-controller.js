const Jimp = require('jimp');
const path = require('path');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');

class ActivateController {
    async activate(req, res) {
        const { name, avatar } = req.body;
        

        if (!name || !avatar) {
            console.error('Missing fields:', { name, avatar });
            return res.status(400).json({ message: "All fields are required" });
        }

        try {
            // Process image
            const buffer = Buffer.from(avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
            const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
            const jimpResp = await Jimp.read(buffer);
            jimpResp.resize(150, Jimp.AUTO).write(path.resolve(__dirname, `../storage/${imagePath}`));

            // Update user
            const userId = req.user.id;
            const user = await userService.findUser({ id: userId });
            if (!user) {
                console.error('User not found:', userId);
                return res.status(404).json({ message: "User not found" });
            }

            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imagePath}`;
            await user.save();

            return res.json({ user: new UserDto(user), auth: true });

        } catch (error) {
            console.error('Activation error:', error.message);
            return res.status(500).json({ message: "Could Not Process the image" });
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
}

module.exports = new ActivateController();
