const jwt=require('jsonwebtoken');
const accessTokenSecret=process.env.JWT_ACCESS_SECRET;
const refreshTokenSecret=process.env.JWT_REFRESH_SECRET;
class TokenService{
    generateAccessToken(payload){
        const accessToken=jwt.sign(payload,accessTokenSecret,{
            expiresIn:'1h'
        });
        const refreshToken=jwt.sign(payload,refreshTokenSecret,{
            expiresIn:'1y'
        });
        return {accessToken,refreshToken}
    }

    
}

module.exports=new TokenService()