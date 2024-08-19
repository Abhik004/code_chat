const tokenService = require("../services/token-service");

module.exports = async function (req, res, next) {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            throw new Error('Access token missing in cookies');
        }

        const userData = await tokenService.verifyAccessToken(accessToken);
        if (!userData) {
            throw new Error('Invalid or expired access token');
        }

        console.log('User data in middleware:', userData); // Debugging line
        req.user = userData;
        next();
    } catch (error) {
        console.error('JWT Middleware Error:', error.message);
        res.status(401).json({ message: "Invalid Token" });
    }
}
